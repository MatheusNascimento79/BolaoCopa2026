"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Minus, RefreshCw, Trophy } from "lucide-react";
import { AppFrame, GlassCard, LiveBottomNav, RankingRow, StatusBadge } from "@/components/live-ui";
import type { RankingEntry } from "@/lib/domain/types";

const trendByUserId: Record<string, "up" | "down" | "same"> = {};

type RankingClientProps = {
  activeUserId: string;
  initialEntries: RankingEntry[];
  paidParticipants: number;
};

export function RankingClient({ activeUserId, initialEntries, paidParticipants }: RankingClientProps) {
  const [rankingEntries, setRankingEntries] = useState(initialEntries);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(initialEntries[0]?.rankingSnapshotAt ?? new Date().toISOString());
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState("Resultados sincronizados.");
  const podium = rankingEntries.slice(0, 3);
  const rankingWithMeta = useMemo(
    () =>
      rankingEntries.map((entry, index, entries) => {
        const previous = entries[index - 1];
        const next = entries[index + 1];
        const tied =
          previous?.probabilityScore === entry.probabilityScore ||
          next?.probabilityScore === entry.probabilityScore;

        return {
          ...entry,
          tied,
          trend: trendByUserId[entry.userId] ?? "same",
        };
      }),
    [rankingEntries],
  );

  async function refreshRanking() {
    setRefreshing(true);
    setRefreshStatus("Atualizando resultados...");

    try {
      const response = await fetch("/api/ranking/snapshot", { cache: "no-store" });
      if (!response.ok) throw new Error("ranking_snapshot_failed");

      const payload = (await response.json()) as {
        entries: RankingEntry[];
        snapshotAt: string;
        source: string;
        dataSource: string;
      };

      setRankingEntries(payload.entries);
      setLastUpdatedAt(payload.snapshotAt);
      setRefreshStatus(payload.dataSource === "supabase" ? "Resultados e apostas reais sincronizados." : "Resultados sincronizados.");
    } catch {
      setRefreshStatus("Não foi possível atualizar agora.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <AppFrame
      eyebrow="Classificação"
      title="Ranking"
      action={
        <div className="live-ranking-actions">
          <StatusBadge tone="warning">{paidParticipants} pagos</StatusBadge>
          <button className="live-refresh-action" disabled={refreshing} onClick={refreshRanking} type="button">
            <RefreshCw size={15} />
            Atualizar
          </button>
        </div>
      }
      nav={<LiveBottomNav current="/ranking" />}
    >
      <GlassCard className="live-podium-card" tone="gold">
        <div className="live-podium-head">
          <Trophy size={24} />
          <div>
            <strong>Top 3</strong>
            <p>Probabilidade viva calculada com resultados sincronizados e força atual dos times.</p>
          </div>
        </div>

        <div className="live-podium" aria-label="Pódio do ranking">
          {podium.length > 0 ? (
            podium.map((entry) => (
              <div className={`live-podium-place live-podium-${entry.position}`} key={entry.id}>
                <strong>{entry.position}º</strong>
                <span>{entry.nickname}</span>
                <small>{formatProbability(entry.probabilityScore)}</small>
              </div>
            ))
          ) : (
            <div className="live-podium-empty">
              <strong>Sem apostas</strong>
              <span>O ranking aparece quando houver apostas confirmadas.</span>
            </div>
          )}
        </div>

        <p className="live-ranking-sync">
          Atualizado em {formatDateTime(lastUpdatedAt)} · {refreshStatus}
        </p>
      </GlassCard>

      <section className="live-stack" aria-label="Ranking geral">
        <div className="live-section-row">
          <span className="live-section-label">Geral</span>
          <StatusBadge tone="scheduled">{rankingEntries.length} participantes</StatusBadge>
        </div>

        {rankingWithMeta.length > 0 ? (
          rankingWithMeta.map((entry) => (
            <div className="live-ranking-item" key={entry.id}>
              <RankingRow
                position={entry.position}
                nickname={entry.nickname}
                probability={formatProbabilityNumber(entry.probabilityScore)}
                prizeLabel={entry.prizeLabel}
                tierLabel={entry.tied ? "Empatado" : prizeTierLabel(entry.expectedTier)}
                active={entry.userId === activeUserId}
              />
              <div className="live-ranking-meta">
                <span>{entry.reasoningSummary}</span>
                <TrendBadge trend={entry.trend} />
              </div>
            </div>
          ))
        ) : (
          <GlassCard className="live-admin-feedback" tone="blue">
            <span>Nenhuma aposta confirmada ainda.</span>
          </GlassCard>
        )}
      </section>
    </AppFrame>
  );
}

function TrendBadge({ trend }: { trend: "up" | "down" | "same" }) {
  const Icon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const label = trend === "up" ? "Subiu" : trend === "down" ? "Caiu" : "Estável";

  return (
    <span className={`live-trend live-trend-${trend}`}>
      <Icon size={15} />
      {label}
    </span>
  );
}

function formatProbabilityNumber(value: number) {
  return Number((value * 100).toFixed(2));
}

function formatProbability(value: number) {
  const probability = formatProbabilityNumber(value);
  return `${probability.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: probability > 0 && probability < 1 ? 2 : 0,
  })}%`;
}

function prizeTierLabel(tier: number) {
  if (tier >= 1 && tier <= 7) return `Categoria ${tier}`;
  return "Sem premiação";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
