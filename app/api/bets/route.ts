import { NextResponse } from "next/server";
import { submitBet } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/server";

type SubmitBetBody = {
  championTeamId?: string;
  runnerUpTeamId?: string;
  thirdPlaceTeamId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SubmitBetBody | null;

  if (!body?.championTeamId || !body.runnerUpTeamId || !body.thirdPlaceTeamId) {
    return NextResponse.json({ error: "invalid_bet_payload" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    return NextResponse.json(
      await submitBet({
        userId,
        championTeamId: body.championTeamId,
        runnerUpTeamId: body.runnerUpTeamId,
        thirdPlaceTeamId: body.thirdPlaceTeamId,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "bet_submit_failed";
    const normalizedMessage = normalizeBetError(message);
    const status = ["profile_not_allowed", "payment_not_approved", "bets_closed", "bet_persist_permission_denied"].includes(normalizedMessage)
      ? 403
      : 409;
    return NextResponse.json({ error: normalizedMessage }, { status });
  }
}

function normalizeBetError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("row-level security") || normalized.includes("violates row-level")) {
    return "bet_persist_permission_denied";
  }

  return message;
}
