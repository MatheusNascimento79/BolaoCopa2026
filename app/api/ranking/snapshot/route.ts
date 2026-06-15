import { NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/access/profile";
import { getPaymentSummary, listRankingBets, listRankingProfiles, listTeams } from "@/lib/app-data";
import { calculateRankingEntries } from "@/lib/ranking/calculate";

export async function GET() {
  await requireAppAccess();

  const snapshotAt = new Date().toISOString();
  const [storedBets, storedProfiles, teamList, storedPaymentSummary] = await Promise.all([
    listRankingBets(),
    listRankingProfiles(),
    listTeams(),
    getPaymentSummary(),
  ]);
  const realDataAvailable = storedBets.length > 0 && storedProfiles.length > 0 && teamList.length > 0;
  const totalPrizeCents = realDataAvailable ? storedPaymentSummary.totalRaisedCents : 0;
  const entries = calculateRankingEntries({
    betList: realDataAvailable ? storedBets : [],
    profileList: realDataAvailable ? storedProfiles : [],
    teamList: realDataAvailable ? teamList : [],
    totalPrizeCents,
    snapshotAt,
  });

  return NextResponse.json({
    entries,
    snapshotAt,
    dataSource: "supabase",
    resultsCount: 0,
    source: "supabase",
    syncedAt: snapshotAt,
    fallbackFrom: null,
    fallbackReason: null,
  });
}
