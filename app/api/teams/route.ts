import { NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/access/profile";
import { listTeams } from "@/lib/app-data";
import { getLiveTeamsFallback } from "@/lib/worldcup/live-data";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAppAccess();

  const teams = await listTeams();

  return NextResponse.json({
    snapshotAt: new Date().toISOString(),
    teams: await getLiveTeamsFallback(teams),
  });
}
