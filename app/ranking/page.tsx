import { requireAppAccess } from "@/lib/access/profile";
import { getPaymentSummary, listBets, listProfiles, listTeams } from "@/lib/app-data";
import { bets, calculateRankingEntries, paymentSummary, profiles, type Bet, type Team } from "@/lib/mock";
import { getWorldCupAdapter } from "@/lib/worldcup";
import { RankingClient } from "./ranking-client";

export const dynamic = "force-dynamic";

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

export default async function RankingPage() {
  const profile = await requireAppAccess();
  const adapter = getWorldCupAdapter();
  const [teamsResult, storedBets, storedProfiles, storedTeams, storedPaymentSummary] = await Promise.all([
    adapter.syncTeams(),
    listBets(),
    listProfiles(),
    listTeams(),
    getPaymentSummary(),
  ]);
  const realDataAvailable = storedBets.length > 0 && storedProfiles.length > 0;
  const snapshotAt = new Date().toISOString();
  const rankingEntries = calculateRankingEntries({
    betList: normalizeBetsForTeams(realDataAvailable ? storedBets : bets, teamsResult.data, storedTeams),
    profileList: realDataAvailable ? storedProfiles : profiles,
    teamList: teamsResult.data,
    totalPrizeCents: realDataAvailable ? storedPaymentSummary.totalRaisedCents : paymentSummary.totalRaisedCents,
    snapshotAt,
  });

  return (
    <RankingClient
      activeUserId={profile.id}
      initialEntries={rankingEntries}
      paidParticipants={realDataAvailable ? storedPaymentSummary.paid : paymentSummary.paidParticipants}
    />
  );
}
