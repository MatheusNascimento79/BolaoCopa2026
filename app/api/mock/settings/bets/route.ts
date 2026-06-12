import { NextResponse } from "next/server";
import { getSettings, setBetsOpen } from "@/lib/app-data";

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as { open?: boolean; actorId?: string } | null;

  if (typeof body?.open !== "boolean") {
    return NextResponse.json({ error: "invalid_bets_open_value" }, { status: 400 });
  }

  return NextResponse.json(setBetsOpen(body.open, body.actorId));
}
