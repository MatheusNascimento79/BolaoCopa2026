import fallbackData from "@/data/worldcup/fallback.json";
import type { Match, Team } from "@/lib/mock";
import type { WorldCupAdapter, WorldCupStanding } from "./types";

const fallbackTeams = fallbackData.teams as Team[];
const fallbackMatches = fallbackData.matches as Match[];

function now() {
  return new Date().toISOString();
}

export const mockWorldCupAdapter: WorldCupAdapter = {
  source: "mock-local",
  async syncTeams() {
    return {
      data: fallbackTeams,
      source: this.source,
      syncedAt: now(),
    };
  },
  async syncMatches() {
    return {
      data: fallbackMatches,
      source: this.source,
      syncedAt: now(),
    };
  },
  async syncStandings() {
    const standings: WorldCupStanding[] = fallbackTeams.map((team) => ({
      teamId: team.id,
      ...team.stats,
    }));

    return {
      data: standings,
      source: this.source,
      syncedAt: now(),
    };
  },
  async syncResults() {
    return {
      data: fallbackMatches.filter((match) => match.status === "encerrado" || match.status === "ao_vivo"),
      source: this.source,
      syncedAt: now(),
    };
  },
};
