import { NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/access/profile";
import { listTeams } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAppAccess();

  return NextResponse.json({
    snapshotAt: new Date().toISOString(),
    teams: await listTeams(),
  });
}
