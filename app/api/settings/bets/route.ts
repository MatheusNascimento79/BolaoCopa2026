import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/access/profile";
import { getSettings, setBetsSettings } from "@/lib/app-data";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PATCH(request: Request) {
  const profile = await requireSuperAdmin();
  const body = (await request.json().catch(() => null)) as { betsDeadlineAt?: string | null; open?: boolean } | null;

  if (!body || (typeof body.open !== "boolean" && !Object.prototype.hasOwnProperty.call(body, "betsDeadlineAt"))) {
    return NextResponse.json({ error: "invalid_bets_open_value" }, { status: 400 });
  }

  if (typeof body.betsDeadlineAt === "string" && Number.isNaN(new Date(body.betsDeadlineAt).getTime())) {
    return NextResponse.json({ error: "invalid_bets_deadline_at" }, { status: 400 });
  }

  return NextResponse.json(
    await setBetsSettings(
      {
        betsDeadlineAt: Object.prototype.hasOwnProperty.call(body, "betsDeadlineAt") ? (body.betsDeadlineAt ?? null) : undefined,
        open: body.open,
      },
      profile.id,
    ),
  );
}
