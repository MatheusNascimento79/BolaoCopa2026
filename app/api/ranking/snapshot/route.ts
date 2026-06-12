import { NextResponse } from "next/server";
import { bets, calculateRankingEntries, paymentSummary, profiles } from "@/lib/mock";
import { getWorldCupAdapter } from "@/lib/worldcup";
import { mockWorldCupAdapter } from "@/lib/worldcup/mock-adapter";

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
  const entries = calculateRankingEntries({
    betList: bets,
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
