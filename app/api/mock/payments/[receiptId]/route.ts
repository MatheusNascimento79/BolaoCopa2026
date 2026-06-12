import { NextResponse } from "next/server";
import { decidePayment } from "@/lib/app-data";
import type { PaymentDecision } from "@/lib/app-data";

type RouteContext = {
  params: Promise<{
    receiptId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { receiptId } = await params;
  const body = (await request.json().catch(() => null)) as { status?: PaymentDecision; actorId?: string } | null;

  if (body?.status !== "aprovado" && body?.status !== "rejeitado") {
    return NextResponse.json({ error: "invalid_payment_decision" }, { status: 400 });
  }

  try {
    return NextResponse.json(decidePayment(receiptId, body.status, body.actorId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "payment_decision_failed";
    const status = message === "receipt_not_found" ? 404 : 409;
    return NextResponse.json({ error: message }, { status });
  }
}
