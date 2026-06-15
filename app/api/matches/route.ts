import { NextResponse } from "next/server";
import { getWorldCupSnapshotAt, listMatches, listTeams } from "@/lib/app-data";
import { getLiveWorldCupSnapshot } from "@/lib/worldcup/live-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [dbMatches, dbTeams, fallbackSnapshotAt] = await Promise.all([listMatches(), listTeams(), getWorldCupSnapshotAt()]);
  const snapshot = await getLiveWorldCupSnapshot({ dbMatches, dbTeams, fallbackSnapshotAt });

  return NextResponse.json({
    dataSource: snapshot.dataSource,
    fallbackReason: snapshot.fallbackReason,
    matches: snapshot.matches,
    snapshotAt: snapshot.snapshotAt,
    teams: snapshot.teams,
  });
}
