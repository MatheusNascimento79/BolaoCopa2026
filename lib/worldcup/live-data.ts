import type { Match, Team } from "@/lib/domain/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorldCupAdapter } from ".";

type LiveDataSnapshot = {
  dataSource: "live" | "snapshot";
  fallbackReason: string | null;
  matches: Match[];
  snapshotAt: string;
  teams: Team[];
};

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export async function getLiveTeamsFallback(dbTeams: Team[]) {
  return (await getLiveWorldCupSnapshot({ dbTeams })).teams;
}

export async function getLiveMatchesFallback(dbMatches: Match[], dbTeams: Team[]) {
  return (await getLiveWorldCupSnapshot({ dbMatches, dbTeams })).matches;
}

export async function getLiveWorldCupSnapshot({
  dbMatches = [],
  dbTeams,
  fallbackSnapshotAt,
}: {
  dbMatches?: Match[];
  dbTeams: Team[];
  fallbackSnapshotAt?: string | null;
}): Promise<LiveDataSnapshot> {
  try {
    const adapter = getWorldCupAdapter();
    const [teamsResult, matchesResult] = await Promise.all([
      adapter.syncTeams(),
      dbMatches.length > 0 ? adapter.syncMatches() : Promise.resolve(null),
    ]);

    if (dbTeams.length > 0 && teamsResult.data.length === 0) {
      throw new Error("worldcup_sync_empty_teams");
    }

    if (matchesResult && dbMatches.length > 0 && matchesResult.data.length === 0) {
      throw new Error("worldcup_sync_empty_matches");
    }

    const teams = mergeLiveTeams(dbTeams, teamsResult.data);
    const matches = matchesResult ? mergeLiveMatches(dbMatches, dbTeams, teamsResult.data, matchesResult.data) : dbMatches;
    const snapshotAt = matchesResult?.syncedAt ?? teamsResult.syncedAt;

    const persistError = await persistLiveSnapshot({ matches, teams });

    return {
      dataSource: "live",
      fallbackReason: persistError,
      matches,
      snapshotAt,
      teams,
    };
  } catch (error) {
    return {
      dataSource: "snapshot",
      fallbackReason: error instanceof Error ? error.message : "worldcup_sync_failed",
      matches: dbMatches,
      snapshotAt: fallbackSnapshotAt ?? new Date().toISOString(),
      teams: dbTeams,
    };
  }
}

function mergeLiveTeams(dbTeams: Team[], liveTeams: Team[]) {
  const liveByCode = new Map(liveTeams.map((team) => [team.externalId, team]));
  const liveByName = new Map(liveTeams.map((team) => [normalizeName(team.name), team]));

  return dbTeams.map((team) => {
    const liveTeam = liveByCode.get(team.externalId) ?? liveByName.get(normalizeName(team.name));

    return liveTeam
      ? {
          ...team,
          flagUrl: liveTeam.flagUrl || team.flagUrl,
          groupName: liveTeam.groupName || team.groupName,
          stats: liveTeam.stats,
          status: liveTeam.status,
        }
      : team;
  });
}

function mergeLiveMatches(dbMatches: Match[], dbTeams: Team[], liveTeams: Team[], liveMatches: Match[]) {
  const liveTeamById = new Map(liveTeams.map((team) => [team.id, team]));
  const dbTeamsByCode = new Map(dbTeams.map((team) => [team.externalId, team]));
  const dbTeamsByName = new Map(dbTeams.map((team) => [normalizeName(team.name), team]));
  const dbMatchesByExternalId = new Map(dbMatches.map((match) => [match.externalId, match]));
  const dbMatchesByTeams = new Map(dbMatches.map((match) => [matchTeamsKey(match.homeTeamId, match.awayTeamId), match]));

  const mappedMatches = liveMatches
    .map((match) => {
      const liveHome = liveTeamById.get(match.homeTeamId);
      const liveAway = liveTeamById.get(match.awayTeamId);
      const homeTeam = liveHome ? dbTeamsByCode.get(liveHome.externalId) ?? dbTeamsByName.get(normalizeName(liveHome.name)) : null;
      const awayTeam = liveAway ? dbTeamsByCode.get(liveAway.externalId) ?? dbTeamsByName.get(normalizeName(liveAway.name)) : null;

      if (!homeTeam || !awayTeam) return null;

      const dbMatch = dbMatchesByExternalId.get(match.externalId) ?? dbMatchesByTeams.get(matchTeamsKey(homeTeam.id, awayTeam.id));

      return {
        ...match,
        externalId: dbMatch?.externalId ?? match.externalId,
        id: dbMatch?.id ?? match.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
      };
    })
    .filter(Boolean) as Match[];

  return mappedMatches.length > 0 ? mappedMatches : dbMatches;
}

function matchTeamsKey(homeTeamId: string, awayTeamId: string) {
  return `${homeTeamId}:${awayTeamId}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function persistLiveSnapshot({ matches, teams }: { matches: Match[]; teams: Team[] }) {
  const supabase = createAdminClient();
  if (!supabase) return "service_role_not_configured";

  const teamRows = teams.map((team) => ({
    id: team.id,
    external_id: team.externalId,
    name: team.name,
    flag_url: team.flagUrl,
    group_name: team.groupName,
    confederation: team.confederation,
    fifa_ranking: team.fifaRanking,
    stats: team.stats,
    status: team.status,
    raw_payload: {
      source: "worldcup2026",
      syncedAt: new Date().toISOString(),
    },
  }));

  const matchRows = matches
    .filter((match) => isUuid(match.id))
    .map((match) => ({
      id: match.id,
      external_id: match.externalId,
      stage: match.stage,
      group_name: match.groupName ?? null,
      home_team_id: match.homeTeamId,
      away_team_id: match.awayTeamId,
      home_score: match.homeScore,
      away_score: match.awayScore,
      status: match.status,
      kickoff_at: match.kickoffAt,
      venue: match.venue,
      city: match.city,
      raw_payload: {
        source: "worldcup2026",
        syncedAt: new Date().toISOString(),
      },
    }));

  const { error: teamsError } = await supabase.from("teams").upsert(teamRows, { onConflict: "id" });
  if (teamsError) return `worldcup_teams_persist_failed:${teamsError.message}`;

  if (matchRows.length > 0) {
    const { error: matchesError } = await supabase.from("matches").upsert(matchRows, { onConflict: "id" });
    if (matchesError) return `worldcup_matches_persist_failed:${matchesError.message}`;
  }

  return null;
}
