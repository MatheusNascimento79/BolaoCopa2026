import { NextResponse } from "next/server";
import { submitBet } from "@/lib/app-data";

type SubmitBetBody = {
  userId?: string;
  championTeamId?: string;
  runnerUpTeamId?: string;
  thirdPlaceTeamId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SubmitBetBody | null;

  if (!body?.userId || !body.championTeamId || !body.runnerUpTeamId || !body.thirdPlaceTeamId) {
    return NextResponse.json({ error: "invalid_bet_payload" }, { status: 400 });
  }

  try {
    return NextResponse.json(
      submitBet({
        userId: body.userId,
        championTeamId: body.championTeamId,
        runnerUpTeamId: body.runnerUpTeamId,
        thirdPlaceTeamId: body.thirdPlaceTeamId,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "bet_submit_failed";
    const status = message === "profile_not_allowed" || message === "payment_not_approved" || message === "bets_closed" ? 403 : 409;
    return NextResponse.json({ error: message }, { status });
  }
}
