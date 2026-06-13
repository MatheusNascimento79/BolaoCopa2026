import { requireAppAccess } from "@/lib/access/profile";
import { getPaymentSummary, listBets, listProfiles, listTeams } from "@/lib/app-data";
import { calculateRankingEntries } from "@/lib/ranking/calculate";
import { RankingClient } from "./ranking-client";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const profile = await requireAppAccess();
  const [storedBets, storedProfiles, storedTeams, storedPaymentSummary] = await Promise.all([
    listBets(),
    listProfiles(),
    listTeams(),
    getPaymentSummary(),
  ]);
  const realDataAvailable = storedBets.length > 0 && storedProfiles.length > 0 && storedTeams.length > 0;
  const snapshotAt = new Date().toISOString();
  const rankingEntries = calculateRankingEntries({
    betList: realDataAvailable ? storedBets : [],
    profileList: realDataAvailable ? storedProfiles : [],
    teamList: realDataAvailable ? storedTeams : [],
    totalPrizeCents: realDataAvailable ? storedPaymentSummary.totalRaisedCents : 0,
    snapshotAt,
  });

  return (
    <RankingClient
      activeUserId={profile.id}
      initialEntries={rankingEntries}
      paidParticipants={storedPaymentSummary.paid}
    />
  );
}
