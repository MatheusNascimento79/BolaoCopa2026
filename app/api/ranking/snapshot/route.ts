import { NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/access/profile";
import { getPaymentSummary, listBets, listProfiles, listTeams } from "@/lib/app-data";
import type { Bet, Team } from "@/lib/domain/types";
import { calculateRankingEntries } from "@/lib/ranking/calculate";
import { getWorldCupAdapter } from "@/lib/worldcup";

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

  const adapter = getWorldCupAdapter();
  let fallbackReason: string | null = null;
  let teamsResult;
  let resultsResult;

  try {
    teamsResult = await adapter.syncTeams();
    resultsResult = await adapter.syncResults();
  } catch (error) {
    fallbackReason = error instanceof Error ? error.message : "worldcup_adapter_failed";
    teamsResult = { data: [] as Team[], source: adapter.source, syncedAt: new Date().toISOString() };
    resultsResult = { data: [], source: adapter.source, syncedAt: teamsResult.syncedAt };
  }

  const snapshotAt = new Date().toISOString();
  const [storedBets, storedProfiles, storedTeams, storedPaymentSummary] = await Promise.all([
    listBets(),
    listProfiles(),
    listTeams(),
    getPaymentSummary(),
  ]);
  const realDataAvailable = storedBets.length > 0 && storedProfiles.length > 0 && teamsResult.data.length > 0;
  const normalizedBets = realDataAvailable ? normalizeBetsForTeams(storedBets, teamsResult.data, storedTeams) : [];
  const totalPrizeCents = realDataAvailable ? storedPaymentSummary.totalRaisedCents : 0;
  const entries = calculateRankingEntries({
    betList: normalizedBets,
    profileList: realDataAvailable ? storedProfiles : [],
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
    dataSource: "supabase",
    fallbackFrom: null,
    fallbackReason,
  });
}
