"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ShieldCheck } from "lucide-react";
import { AppFrame, BettingStatusBar, GlassCard, LiveBottomNav, StatusBadge, TeamFlag } from "@/components/live-ui";
import type { Team } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";

type TeamsPayload = {
  dataSource: "live" | "snapshot";
  fallbackReason: string | null;
  snapshotAt: string;
  teams: Team[];
};

export function TimesClient({
  betsDeadlineAt,
  betsOpen,
  initialSnapshotAt,
  initialSource,
  teams: initialTeams,
}: {
  betsDeadlineAt: string | null;
  betsOpen: boolean;
  initialSnapshotAt: string;
  initialSource: "live" | "snapshot";
  teams: Team[];
}) {
  const [teams, setTeams] = useState(initialTeams);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [group, setGroup] = useState("Todos");
  const [refreshing, setRefreshing] = useState(false);
  const [statusText, setStatusText] = useState(formatSyncStatus(initialSource, initialSnapshotAt));
  const groups = useMemo(() => ["Todos", ...Array.from(new Set(teams.map((team) => team.groupName)))], [teams]);
  const teamOptions = useMemo(() => sortTeamsByName(teams), [teams]);
  const filtered = teams.filter((team) => {
    const matchesTeam = selectedTeamId.length === 0 || team.id === selectedTeamId;
    const matchesGroup = group === "Todos" || team.groupName === group;
    return matchesTeam && matchesGroup;
  });

  const refreshTeams = useCallback(async () => {
    setRefreshing(true);
    setStatusText("Atualizando seleções...");

    try {
      const response = await fetch("/api/teams", { cache: "no-store" });
      if (!response.ok) throw new Error("teams_refresh_failed");

      const payload = (await response.json()) as TeamsPayload;
      setTeams(payload.teams);
      setStatusText(formatSyncStatus(payload.dataSource, payload.snapshotAt));
    } catch {
      setStatusText("Não foi possível atualizar agora.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setTeams(initialTeams);
    setStatusText(formatSyncStatus(initialSource, initialSnapshotAt));
  }, [initialSnapshotAt, initialSource, initialTeams]);

  useEffect(() => {
    void refreshTeams();
  }, [refreshTeams]);

  useEffect(() => {
    const refreshOnFocus = () => void refreshTeams();
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    const supabase = createClient();
    const channel = supabase
      .channel("live-teams")
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, () => void refreshTeams())
      .subscribe();

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
      void supabase.removeChannel(channel);
    };
  }, [refreshTeams]);

  return (
    <AppFrame
      eyebrow="Seleções"
      title="Times"
      action={
        <div className="live-ranking-actions">
          <StatusBadge tone="scheduled">{filtered.length} times</StatusBadge>
          <button
            aria-busy={refreshing}
            className={`live-refresh-action${refreshing ? " is-refreshing" : ""}`}
            disabled={refreshing}
            onClick={() => void refreshTeams()}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="live-refresh-icon" size={15} />
            {refreshing ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      }
      bottomStatus={<BettingStatusBar betsDeadlineAt={betsDeadlineAt} betsOpen={betsOpen} />}
      nav={<LiveBottomNav current="/times" />}
    >
      <GlassCard className="live-team-summary" tone="green">
        <ShieldCheck size={26} />
        <div>
          <strong>Seleções da Copa</strong>
          <span>Busca, filtro por grupo e estatísticas das seleções.</span>
          <small>{statusText}</small>
        </div>
      </GlassCard>

      <GlassCard className="live-filter-card" tone="blue">
        <label className="live-search-field live-filter-select">
          <Search size={18} />
          <select
            aria-label="Filtrar por país"
            value={selectedTeamId}
            onChange={(event) => setSelectedTeamId(event.target.value)}
          >
            <option value="">Todos os países</option>
            {teamOptions.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <div className="live-filter-pills">
          {groups.map((item) => (
            <button aria-pressed={group === item} key={item} onClick={() => setGroup(item)} type="button">
              {item.replace("Grupo ", "")}
            </button>
          ))}
        </div>
      </GlassCard>

      <section className="live-team-list" aria-label="Lista de seleções">
        {filtered.length === 0 && (
          <GlassCard className="live-empty-state" tone="blue">
            <strong>Nenhuma seleção encontrada</strong>
            <p>Ajuste a seleção ou escolha outro grupo.</p>
          </GlassCard>
        )}

        {filtered.map((team) => (
          <GlassCard className="live-team-wide-card" key={team.id}>
            <div className="live-team-wide-head">
              <TeamFlag label={team.name} src={team.flagUrl} />
              <span>
                <strong>{team.name}</strong>
                <small>{team.groupName} · {team.confederation}</small>
              </span>
              <StatusBadge tone={team.status === "eliminado" ? "locked" : "success"}>
                {team.status === "eliminado" ? "Eliminado" : "Ativo"}
              </StatusBadge>
            </div>
            <div className="live-expanded-stats">
              <span>{team.stats.points} pts</span>
              <span>{team.stats.wins} vitórias</span>
              <span>{team.stats.goalDifference > 0 ? `+${team.stats.goalDifference}` : team.stats.goalDifference} SG</span>
            </div>
          </GlassCard>
        ))}
      </section>
    </AppFrame>
  );
}

function sortTeamsByName(teamList: Team[]) {
  return [...teamList].sort((teamA, teamB) => teamA.name.localeCompare(teamB.name, "pt-BR"));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function formatSyncStatus(dataSource: "live" | "snapshot", snapshotAt: string) {
  const label = dataSource === "live" ? "API atualizada" : "Usando último snapshot salvo";
  return `${label} em ${formatTime(snapshotAt)}.`;
}
