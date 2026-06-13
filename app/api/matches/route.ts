import { NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/access/profile";
import { listMatches, listTeams } from "@/lib/app-data";
import { getLiveMatchesFallback, getLiveTeamsFallback } from "@/lib/worldcup/live-data";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAppAccess();

  const [dbMatches, dbTeams] = await Promise.all([listMatches(), listTeams()]);
  const [matches, teams] = await Promise.all([
    getLiveMatchesFallback(dbMatches, dbTeams),
    getLiveTeamsFallback(dbTeams),
  ]);

  return NextResponse.json({
    matches,
    snapshotAt: new Date().toISOString(),
    teams,
  });
}
