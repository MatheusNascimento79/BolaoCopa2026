import { NextResponse } from "next/server";
import { bets, calculateRankingEntries, paymentSummary, profiles, type Bet, type Team } from "@/lib/mock";
import { getWorldCupAdapter } from "@/lib/worldcup";
import { mockWorldCupAdapter } from "@/lib/worldcup/mock-adapter";

function normalizeBetTeamId(teamId: string, teamList: Team[]) {
  if (teamList.some((team) => team.id === teamId)) return teamId;

  const legacyCode = teamId.replace(/^team-/, "").toUpperCase();
  const teamByCode = teamList.find((team) => team.externalId.toUpperCase() === legacyCode);

  return teamByCode?.id ?? teamId;
}

function normalizeBetsForTeams(betList: Bet[], teamList: Team[]) {
  return betList.map((bet) => ({
    ...bet,
    championTeamId: normalizeBetTeamId(bet.championTeamId, teamList),
    runnerUpTeamId: normalizeBetTeamId(bet.runnerUpTeamId, teamList),
    thirdPlaceTeamId: normalizeBetTeamId(bet.thirdPlaceTeamId, teamList),
  }));
}

export async function GET() {
  const selectedAdapter = getWorldCupAdapter();
  let adapter = selectedAdapter;
  let fallbackReason: string | null = null;
  let teamsResult;
  let resultsResult;

  try {
    teamsResult = await adapter.syncTeams();
    resultsResult = await adapter.syncResults();
  } catch (error) {
    adapter = mockWorldCupAdapter;
    fallbackReason = error instanceof Error ? error.message : "worldcup_adapter_failed";
    teamsResult = await adapter.syncTeams();
    resultsResult = await adapter.syncResults();
  }

  const snapshotAt = new Date().toISOString();
  const normalizedBets = normalizeBetsForTeams(bets, teamsResult.data);
  const entries = calculateRankingEntries({
    betList: normalizedBets,
    profileList: profiles,
    teamList: teamsResult.data,
    totalPrizeCents: paymentSummary.totalRaisedCents,
    snapshotAt,
  });

  return NextResponse.json({
    entries,
    snapshotAt,
    source: adapter.source,
    syncedAt: teamsResult.syncedAt,
    resultsCount: resultsResult.data.length,
    fallbackFrom: fallbackReason ? selectedAdapter.source : null,
    fallbackReason,
  });
}
