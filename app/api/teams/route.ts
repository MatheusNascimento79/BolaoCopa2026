import { NextResponse } from "next/server";
import { getWorldCupSnapshotAt, listMatches, listTeams } from "@/lib/app-data";
import { getLiveWorldCupSnapshot } from "@/lib/worldcup/live-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [matches, teams, fallbackSnapshotAt] = await Promise.all([listMatches(), listTeams(), getWorldCupSnapshotAt()]);
  const snapshot = await getLiveWorldCupSnapshot({ dbMatches: matches, dbTeams: teams, fallbackSnapshotAt });

  return NextResponse.json({
    dataSource: snapshot.dataSource,
    fallbackReason: snapshot.fallbackReason,
    snapshotAt: snapshot.snapshotAt,
    teams: snapshot.teams,
  });
}
