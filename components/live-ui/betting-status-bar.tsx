"use client";

import { useEffect, useMemo, useState } from "react";
import { getBettingStatusKind } from "@/lib/betting/status";

type BettingStatusBarProps = {
  betsDeadlineAt: string | null;
  betsOpen: boolean;
};

export function BettingStatusBar({ betsDeadlineAt, betsOpen }: BettingStatusBarProps) {
  const [now, setNow] = useState(() => Date.now());
  const status = useMemo(
    () => getBettingStatusKind({ betsDeadlineAt, betsOpen }, new Date(now)),
    [betsDeadlineAt, betsOpen, now],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <p className={`live-betting-status live-betting-status-${status}`} aria-live="polite">
      {status === "open" && "Apostas abertas"}
      {status === "closing" && betsDeadlineAt && `Apostas encerram em ${formatCountdown(betsDeadlineAt, now)}`}
      {status === "closed" && "Apostas encerradas"}
    </p>
  );
}

function formatCountdown(deadlineAt: string, now: number) {
  const remaining = Math.max(0, new Date(deadlineAt).getTime() - now);
  const totalMinutes = Math.ceil(remaining / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return `${days}dia:${hours}horas:${minutes}minutos`;
}
