import { NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/access/profile";
import { bets, calculateRankingEntries, paymentSummary, profiles, type Bet, type Team } from "@/lib/mock";
import { getPaymentSummary, listBets, listProfiles, listTeams } from "@/lib/app-data";
import { getWorldCupAdapter } from "@/lib/worldcup";
import { mockWorldCupAdapter } from "@/lib/worldcup/mock-adapter";

function normalizeBetTeamId(teamId: string, teamList: Team[], storedTeams: Team[]) {
  const storedTeam = storedTeams.find((team) => team.id === teamId);
  if (storedTeam) {
    const providerTeam = teamList.find((team) => team.externalId.toUpperCase() === storedTeam.externalId.toUpperCase());
    return providerTeam?.id ?? teamId;
  }

  if (teamList.some((team) => team.id === teamId)) return teamId;

  const legacyCode = teamId.replace(/^team-/, "").toUpperCase();
  const teamByCode = teamList.find((team) => team.externalId.toUpperCase() === legacyCode);

  return teamByCode?.id ?? teamId;
}

function normalizeBetsForTeams(betList: Bet[], teamList: Team[], storedTeams: Team[]) {
  return betList.map((bet) => ({
    ...bet,
    championTeamId: normalizeBetTeamId(bet.championTeamId, teamList, storedTeams),
    runnerUpTeamId: normalizeBetTeamId(bet.runnerUpTeamId, teamList, storedTeams),
    thirdPlaceTeamId: normalizeBetTeamId(bet.thirdPlaceTeamId, teamList, storedTeams),
  }));
}

export async function GET() {
  await requireAppAccess();

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
  const [storedBets, storedProfiles, storedTeams, storedPaymentSummary] = await Promise.all([
    listBets(),
    listProfiles(),
    listTeams(),
    getPaymentSummary(),
  ]);
  const realDataAvailable = storedBets.length > 0 && storedProfiles.length > 0;
  const normalizedBets = normalizeBetsForTeams(realDataAvailable ? storedBets : bets, teamsResult.data, storedTeams);
  const totalPrizeCents = realDataAvailable ? storedPaymentSummary.totalRaisedCents : paymentSummary.totalRaisedCents;
  const entries = calculateRankingEntries({
    betList: normalizedBets,
    profileList: realDataAvailable ? storedProfiles : profiles,
    teamList: teamsResult.data,
    totalPrizeCents,
    snapshotAt,
  });

  return NextResponse.json({
    entries,
    snapshotAt,
    source: adapter.source,
    syncedAt: teamsResult.syncedAt,
    resultsCount: resultsResult.data.length,
    dataSource: realDataAvailable ? "supabase" : "mock-fallback",
    fallbackFrom: fallbackReason ? selectedAdapter.source : null,
    fallbackReason,
  });
}
