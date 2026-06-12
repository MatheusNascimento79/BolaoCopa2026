import type { ReactNode } from "react";
import { Check, Lock, Sparkles, TrendingUp } from "lucide-react";
import { GlassCard, StatusBadge } from "./primitives";

type TeamSide = {
  name: string;
  flag?: string;
  score?: number | string;
};

export type MatchCardProps = {
  stage: string;
  group?: string;
  kickoffLabel: string;
  venue?: string;
  home: TeamSide;
  away: TeamSide;
  status?: "scheduled" | "live" | "done" | "warning";
  className?: string;
};

const statusCopy = {
  scheduled: "Agendado",
  live: "Ao vivo",
  done: "Encerrado",
  warning: "Atenção",
};

export function MatchCard({
  stage,
  group,
  kickoffLabel,
  venue,
  home,
  away,
  status = "scheduled",
  className = "",
}: MatchCardProps) {
  return (
    <GlassCard className={`live-match-card ${className}`.trim()}>
      <div className="live-card-topline">
        <span>{group ? `${stage} · ${group}` : stage}</span>
        <StatusBadge tone={status}>{statusCopy[status]}</StatusBadge>
      </div>
      <div className="live-match-teams">
        <TeamScore team={home} align="left" />
        <div className="live-versus">
          <strong>{home.score ?? "-"} : {away.score ?? "-"}</strong>
          <span>{kickoffLabel}</span>
        </div>
        <TeamScore team={away} align="right" />
      </div>
      {venue && <p className="live-card-footnote">{venue}</p>}
    </GlassCard>
  );
}

function TeamScore({ team, align }: { team: TeamSide; align: "left" | "right" }) {
  return (
    <div className={`live-team-score live-team-${align}`}>
      <span className="live-flag-orb">{team.flag ?? team.name.slice(0, 2).toUpperCase()}</span>
      <strong>{team.name}</strong>
    </div>
  );
}

export type RankingRowProps = {
  position: number;
  nickname: string;
  probability: number;
  prizeLabel: string;
  tierLabel?: string;
  active?: boolean;
  className?: string;
};

export function RankingRow({
  position,
  nickname,
  probability,
  prizeLabel,
  tierLabel,
  active = false,
  className = "",
}: RankingRowProps) {
  const probabilityLabel = `${probability.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: probability > 0 && probability < 1 ? 2 : 0,
  })}%`;

  return (
    <div className={`live-ranking-row ${active ? "live-ranking-active" : ""} ${className}`.trim()}>
      <span className="live-ranking-position">{position}</span>
      <div className="live-ranking-player">
        <strong>{nickname}</strong>
        {tierLabel && <span>{tierLabel}</span>}
      </div>
      <div className="live-ranking-meter" aria-label={`Probabilidade ${probabilityLabel}`}>
        <span style={{ width: `${Math.max(0, Math.min(probability, 100))}%` }} />
      </div>
      <div className="live-ranking-prize">
        <strong>{prizeLabel}</strong>
        <span>{probabilityLabel}</span>
      </div>
    </div>
  );
}

export type TeamPickCardProps = {
  label: string;
  teamName?: string;
  flag?: string;
  helper?: string;
  selected?: boolean;
  locked?: boolean;
  action?: ReactNode;
  className?: string;
};

export function TeamPickCard({
  label,
  teamName,
  flag,
  helper,
  selected = false,
  locked = false,
  action,
  className = "",
}: TeamPickCardProps) {
  return (
    <GlassCard className={`live-team-pick ${selected ? "live-team-pick-selected" : ""} ${className}`.trim()}>
      <div className="live-pick-medal">{flag ?? <Sparkles size={22} />}</div>
      <div>
        <span>{label}</span>
        <strong>{teamName ?? "Selecionar time"}</strong>
        {helper && <p>{helper}</p>}
      </div>
      <div className="live-pick-action">
        {locked ? <Lock size={20} aria-label="Aposta travada" /> : selected ? <Check size={21} /> : action}
      </div>
    </GlassCard>
  );
}

export type MoneyPanelProps = {
  amountLabel: string;
  paidCount?: number;
  entryLabel?: string;
  className?: string;
};

export function MoneyPanel({ amountLabel, paidCount, entryLabel = "R$ 50,00 por participante", className = "" }: MoneyPanelProps) {
  return (
    <GlassCard tone="gold" className={`live-money-panel ${className}`.trim()}>
      <div className="live-money-bubble">
        <span>Total arrecadado</span>
        <strong>{amountLabel}</strong>
      </div>
      <div className="live-money-scene" aria-hidden="true">
        <span className="live-coin live-coin-a" />
        <span className="live-coin live-coin-b" />
        <span className="live-coin live-coin-c" />
        <span className="live-coin live-coin-d" />
        <div className="live-treasure">
          <span />
        </div>
      </div>
      <div className="live-money-meta">
        <TrendingUp size={20} />
        <span>{typeof paidCount === "number" ? `${paidCount} pagos · ${entryLabel}` : entryLabel}</span>
      </div>
    </GlassCard>
  );
}
