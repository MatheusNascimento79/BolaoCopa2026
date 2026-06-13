import type { Match, Team } from "@/lib/domain/types";
import { getWorldCupAdapter } from ".";

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export async function getLiveTeamsFallback(dbTeams: Team[]) {
  try {
    const liveTeams = (await getWorldCupAdapter().syncTeams()).data;
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
  } catch {
    return dbTeams;
  }
}

export async function getLiveMatchesFallback(dbMatches: Match[], dbTeams: Team[]) {
  try {
    const adapter = getWorldCupAdapter();
    const [liveTeams, liveMatches] = await Promise.all([
      adapter.syncTeams().then((result) => result.data),
      adapter.syncMatches().then((result) => result.data),
    ]);
    const liveTeamById = new Map(liveTeams.map((team) => [team.id, team]));
    const dbTeamsByCode = new Map(dbTeams.map((team) => [team.externalId, team]));
    const dbTeamsByName = new Map(dbTeams.map((team) => [normalizeName(team.name), team]));
    const dbMatchesByExternalId = new Map(dbMatches.map((match) => [match.externalId, match]));

    const mappedMatches = liveMatches
      .map((match) => {
        const liveHome = liveTeamById.get(match.homeTeamId);
        const liveAway = liveTeamById.get(match.awayTeamId);
        const homeTeam = liveHome ? dbTeamsByCode.get(liveHome.externalId) ?? dbTeamsByName.get(normalizeName(liveHome.name)) : null;
        const awayTeam = liveAway ? dbTeamsByCode.get(liveAway.externalId) ?? dbTeamsByName.get(normalizeName(liveAway.name)) : null;

        if (!homeTeam || !awayTeam) return null;

        const dbMatch = dbMatchesByExternalId.get(match.externalId);

        return {
          ...match,
          id: dbMatch?.id ?? match.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
        };
      })
      .filter(Boolean) as Match[];

    return mappedMatches.length > 0 ? mappedMatches : dbMatches;
  } catch {
    return dbMatches;
  }
}
