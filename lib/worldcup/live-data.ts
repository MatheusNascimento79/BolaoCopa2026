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
    const liveByName = new Map(liveTeams.map((team) => [normalizeName(team.name), team]));

    return dbTeams.map((team) => {
      const liveTeam = liveByName.get(normalizeName(team.name));

      return liveTeam
        ? {
            ...team,
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
    const liveTeamNamesById = new Map(liveTeams.map((team) => [team.id, team.name]));
    const dbTeamsByName = new Map(dbTeams.map((team) => [normalizeName(team.name), team]));
    const dbMatchesByExternalId = new Map(dbMatches.map((match) => [match.externalId, match]));

    const mappedMatches = liveMatches
      .map((match) => {
        const homeName = liveTeamNamesById.get(match.homeTeamId);
        const awayName = liveTeamNamesById.get(match.awayTeamId);
        const homeTeam = homeName ? dbTeamsByName.get(normalizeName(homeName)) : null;
        const awayTeam = awayName ? dbTeamsByName.get(normalizeName(awayName)) : null;

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
