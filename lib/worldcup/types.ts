import type { Match, Team } from "@/lib/domain/types";

export type WorldCupStanding = {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type SyncResult<T> = {
  data: T;
  source: string;
  syncedAt: string;
};

export type WorldCupAdapter = {
  source: string;
  syncTeams: () => Promise<SyncResult<Team[]>>;
  syncMatches: () => Promise<SyncResult<Match[]>>;
  syncStandings: () => Promise<SyncResult<WorldCupStanding[]>>;
  syncResults: () => Promise<SyncResult<Match[]>>;
};
