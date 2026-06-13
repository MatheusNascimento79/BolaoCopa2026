import type { AppSettings, Bet } from "@/lib/domain/types";

export type BettingStatusKind = "open" | "closing" | "closed";

export function isBetsDeadlineExpired(settings: Pick<AppSettings, "betsDeadlineAt" | "betsOpen">, now = new Date()) {
  if (!settings.betsOpen) return true;
  if (!settings.betsDeadlineAt) return false;

  const deadline = new Date(settings.betsDeadlineAt);
  if (Number.isNaN(deadline.getTime())) return false;

  return deadline.getTime() <= now.getTime();
}

export function getBettingStatusKind(settings: Pick<AppSettings, "betsDeadlineAt" | "betsOpen">, now = new Date()): BettingStatusKind {
  if (isBetsDeadlineExpired(settings, now)) return "closed";
  return settings.betsDeadlineAt ? "closing" : "open";
}

export function shouldForceBettingGate(settings: Pick<AppSettings, "betsDeadlineAt" | "betsOpen">, bet: Bet | null, now = new Date()) {
  return isBetsDeadlineExpired(settings, now) && !bet?.locked;
}
