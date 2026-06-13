import { NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/access/profile";
import { listMatches, listTeams } from "@/lib/app-data";

export async function GET() {
  await requireAppAccess();

  const [matches, teams] = await Promise.all([listMatches(), listTeams()]);

  return NextResponse.json({
    matches,
    snapshotAt: new Date().toISOString(),
    teams,
  });
}
