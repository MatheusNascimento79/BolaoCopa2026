"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { AppFrame, BettingStatusBar, GlassCard, LiveBottomNav, MatchCard, StageTabs, StatusBadge } from "@/components/live-ui";
import type { Match, MatchStatus, Team, TournamentStage } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";
import { stageLabels, stageOrder } from "@/lib/worldcup/stages";

const validStages = new Set<TournamentStage>(stageOrder);

type JogosClientProps = {
  activeStage: TournamentStage;
  betsDeadlineAt: string | null;
  betsOpen: boolean;
  initialMatches: Match[];
  initialTeams: Team[];
};

type MatchesPayload = {
  matches: Match[];
  snapshotAt: string;
  teams: Team[];
};

type StatusFilter = "todos" | "agendado" | "ao_vivo" | "encerrado";

const statusFilters: Array<{ label: string; value: StatusFilter }> = [
  { label: "Todos", value: "todos" },
  { label: "Agendados", value: "agendado" },
  { label: "Ao vivo", value: "ao_vivo" },
  { label: "Encerrados", value: "encerrado" },
];

export function JogosClient({ activeStage, betsDeadlineAt, betsOpen, initialMatches, initialTeams }: JogosClientProps) {
  const [matches, setMatches] = useState(initialMatches);
  const [teams, setTeams] = useState(initialTeams);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [refreshing, setRefreshing] = useState(false);
  const [statusText, setStatusText] = useState("Tabela sincronizada.");
  const teamMap = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const matchesByStage = useMemo(() => groupMatchesByStage(matches), [matches]);
  const stageTabs = stageOrder.map((stage) => ({
    id: stage,
    label: stage === "fase_de_grupos" ? "Grupos" : stageLabels[stage],
    count: matchesByStage[stage].length,
    href: `/jogos?fase=${stage}`,
  }));
  const stageMatches = useMemo(() => matchesByStage[activeStage] ?? [], [activeStage, matchesByStage]);
  const teamOptions = useMemo(() => sortTeamsByName(teams), [teams]);
  const visibleMatches = useMemo(
    () => filterMatches(stageMatches, selectedTeamId, statusFilter),
    [selectedTeamId, stageMatches, statusFilter],
  );
  const liveMatches = visibleMatches.filter((match) => match.status === "ao_vivo");
  const spotlightMatch = liveMatches[0] ?? visibleMatches.find((match) => match.status === "agendado") ?? visibleMatches[0] ?? null;
  const groupedMatches = groupMatchesByDate(visibleMatches);

  const refreshMatches = useCallback(async () => {
    setRefreshing(true);
    setStatusText("Atualizando jogos...");

    try {
      const response = await fetch("/api/matches", { cache: "no-store" });
      if (!response.ok) throw new Error("matches_refresh_failed");

      const payload = (await response.json()) as MatchesPayload;
      setMatches(payload.matches);
      setTeams(payload.teams);
      setStatusText(`Atualizado em ${formatTime(payload.snapshotAt)}.`);
    } catch {
      setStatusText("Não foi possível atualizar agora.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setMatches(initialMatches);
    setTeams(initialTeams);
  }, [initialMatches, initialTeams]);

  useEffect(() => {
    void refreshMatches();
  }, [refreshMatches]);

  useEffect(() => {
    const refreshOnFocus = () => void refreshMatches();
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [refreshMatches]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("live-matches-teams")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => void refreshMatches())
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, () => void refreshMatches())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshMatches]);

  return (
    <AppFrame
      eyebrow="Tabela"
      title="Jogos"
      action={
        <div className="live-ranking-actions">
          <StatusBadge tone={liveMatches.length > 0 ? "live" : "scheduled"} className={liveMatches.length > 0 ? "live-pulse-badge" : ""}>
            {liveMatches.length > 0 ? "AO VIVO" : "Agenda"}
          </StatusBadge>
          <button className="live-refresh-action" disabled={refreshing} onClick={refreshMatches} type="button">
            <RefreshCw size={15} />
            Atualizar
          </button>
        </div>
      }
      bottomStatus={<BettingStatusBar betsDeadlineAt={betsDeadlineAt} betsOpen={betsOpen} />}
      nav={<LiveBottomNav current="/jogos" />}
    >
      <StageTabs tabs={stageTabs} activeId={activeStage} />
      <p className="live-phase-caption">{stageLabels[activeStage]} · {statusText}</p>

      <GlassCard className="live-filter-card live-games-filter" tone="blue">
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
        <div className="live-filter-pills" aria-label="Filtrar por status do jogo">
          {statusFilters.map((filter) => (
            <button
              aria-pressed={statusFilter === filter.value}
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {spotlightMatch && (
        <GlassCard className="live-live-card" tone="green">
          <div>
            <StatusBadge
              tone={spotlightMatch.status === "ao_vivo" ? "live" : "scheduled"}
              className={spotlightMatch.status === "ao_vivo" ? "live-pulse-badge" : ""}
            >
              {spotlightMatch.status === "ao_vivo" ? "AO VIVO" : "Próximo jogo"}
            </StatusBadge>
            <strong>{matchTeamsLabel(spotlightMatch.homeTeamId, spotlightMatch.awayTeamId, teamMap)}</strong>
            <span>{`${formatMatchTime(spotlightMatch.kickoffAt)} · ${spotlightMatch.venue}`}</span>
          </div>
        </GlassCard>
      )}

      <section className="live-stack" aria-label={`Jogos - ${stageLabels[activeStage]}`}>
        {visibleMatches.length === 0 && (
          <GlassCard className="live-empty-state" tone="blue">
            <strong>Nenhum jogo encontrado</strong>
            <p>Ajuste a seleção, o status ou escolha outra fase.</p>
          </GlassCard>
        )}

        {groupedMatches.map((group) => (
          <div className="live-match-date-group" key={group.dateKey}>
            <div className="live-section-row">
              <span className="live-section-label">{group.label}</span>
              <StatusBadge tone="scheduled">{group.matches.length} jogos</StatusBadge>
            </div>

            <div className="live-stack">
              {group.matches.map((match) => {
                const homeTeam = teamMap.get(match.homeTeamId);
                const awayTeam = teamMap.get(match.awayTeamId);

                return (
                  <MatchCard
                    key={match.id}
                    stage={stageLabels[match.stage]}
                    group={match.groupName}
                    kickoffLabel={formatMatchTime(match.kickoffAt)}
                    venue={`${match.venue} · ${match.city}`}
                    status={getMatchCardStatus(match.status)}
                    home={{
                      name: homeTeam?.name ?? "A definir",
                      flagSrc: homeTeam?.flagUrl,
                      score: match.homeScore ?? undefined,
                    }}
                    away={{
                      name: awayTeam?.name ?? "A definir",
                      flagSrc: awayTeam?.flagUrl,
                      score: match.awayScore ?? undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </AppFrame>
  );
}

function filterMatches(matches: Match[], selectedTeamId: string, statusFilter: StatusFilter) {
  return matches.filter((match) => {
    const matchesCountry =
      selectedTeamId.length === 0 ||
      match.homeTeamId === selectedTeamId ||
      match.awayTeamId === selectedTeamId;
    const matchesStatus = statusFilter === "todos" || match.status === statusFilter;

    return matchesCountry && matchesStatus;
  });
}

function sortTeamsByName(teamList: Team[]) {
  return [...teamList].sort((teamA, teamB) => teamA.name.localeCompare(teamB.name, "pt-BR"));
}

function getMatchCardStatus(status: MatchStatus) {
  return status === "encerrado" ? "done" : status === "ao_vivo" ? "live" : "scheduled";
}

function groupMatchesByStage(matches: Match[]) {
  return stageOrder.reduce(
    (acc, stage) => {
      acc[stage] = matches.filter((match) => match.stage === stage);
      return acc;
    },
    {} as Record<TournamentStage, Match[]>,
  );
}

function groupMatchesByDate(matches: Match[]) {
  const groups = new Map<string, Match[]>();

  matches.forEach((match) => {
    const dateKey = new Intl.DateTimeFormat("fr-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Sao_Paulo",
      year: "numeric",
    }).format(new Date(match.kickoffAt));
    groups.set(dateKey, [...(groups.get(dateKey) ?? []), match]);
  });

  return Array.from(groups.entries()).map(([dateKey, groupMatches]) => ({
    dateKey,
    label: formatMatchDate(groupMatches[0]?.kickoffAt ?? dateKey),
    matches: groupMatches.sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()),
  }));
}

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
    weekday: "short",
  }).format(new Date(value));
}

function formatMatchTime(value: string) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));

  return `${formatted} BRT`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function matchTeamsLabel(homeTeamId: string, awayTeamId: string, teamMap: Map<string, Team>) {
  const homeTeam = teamMap.get(homeTeamId);
  const awayTeam = teamMap.get(awayTeamId);

  return `${homeTeam?.name ?? "Time"} X ${awayTeam?.name ?? "Time"}`;
}
