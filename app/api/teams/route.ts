import { NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/access/profile";
import { getWorldCupSnapshotAt, listTeams } from "@/lib/app-data";
import { getLiveWorldCupSnapshot } from "@/lib/worldcup/live-data";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAppAccess();

  const [teams, fallbackSnapshotAt] = await Promise.all([listTeams(), getWorldCupSnapshotAt()]);
  const snapshot = await getLiveWorldCupSnapshot({ dbTeams: teams, fallbackSnapshotAt });

  return NextResponse.json({
    dataSource: snapshot.dataSource,
    fallbackReason: snapshot.fallbackReason,
    snapshotAt: snapshot.snapshotAt,
    teams: snapshot.teams,
  });
}
