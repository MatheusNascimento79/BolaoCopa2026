"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { AppFrame, GlassCard, LiveBottomNav, StatusBadge } from "@/components/live-ui";
import type { Team } from "@/lib/domain/types";

const flagByCode: Record<string, string> = {
  ARG: "🇦🇷",
  BRA: "🇧🇷",
  ENG: "🏴",
  ESP: "🇪🇸",
  FRA: "🇫🇷",
  GER: "🇩🇪",
  JPN: "🇯🇵",
  MAR: "🇲🇦",
  MEX: "🇲🇽",
  NZL: "🇳🇿",
  POR: "🇵🇹",
  USA: "🇺🇸",
};

export function TimesClient({ teams }: { teams: Team[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Todos");
  const [expanded, setExpanded] = useState(teams[0]?.id ?? "");
  const groups = useMemo(() => ["Todos", ...Array.from(new Set(teams.map((team) => team.groupName)))], [teams]);
  const filtered = teams.filter((team) => {
    const matchesQuery = team.name.toLowerCase().includes(query.toLowerCase());
    const matchesGroup = group === "Todos" || team.groupName === group;
    return matchesQuery && matchesGroup;
  });

  return (
    <AppFrame
      eyebrow="Seleções"
      title="Times"
      action={<StatusBadge tone="scheduled">{filtered.length} times</StatusBadge>}
      nav={<LiveBottomNav current="/times" />}
    >
      <GlassCard className="live-team-summary" tone="green">
        <ShieldCheck size={26} />
        <div>
          <strong>Seleções da Copa</strong>
          <span>Busca, filtro por grupo e estatísticas das seleções.</span>
        </div>
      </GlassCard>

      <GlassCard className="live-filter-card" tone="blue">
        <label className="live-search-field">
          <Search size={18} />
          <input placeholder="Buscar seleção" value={query} onChange={(event) => setQuery(event.target.value)} />
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
            <p>Ajuste a busca ou escolha outro grupo.</p>
          </GlassCard>
        )}

        {filtered.map((team) => {
          const isOpen = expanded === team.id;
          return (
            <GlassCard className="live-team-wide-card" key={team.id}>
              <button onClick={() => setExpanded(isOpen ? "" : team.id)} type="button">
                <span className="live-flag-orb">{flagByCode[team.externalId] ?? team.externalId.slice(0, 2)}</span>
                <span>
                  <strong>{team.name}</strong>
                  <small>{team.groupName} · {team.confederation}</small>
                </span>
                <StatusBadge tone={team.status === "eliminado" ? "locked" : "success"}>
                  {team.status === "eliminado" ? "Eliminado" : "Ativo"}
                </StatusBadge>
              </button>
              {isOpen && (
                <div className="live-expanded-stats">
                  <span>{team.stats.points} pts</span>
                  <span>{team.stats.wins} vitórias</span>
                  <span>{team.stats.goalDifference > 0 ? `+${team.stats.goalDifference}` : team.stats.goalDifference} SG</span>
                  <span>FIFA #{team.fifaRanking}</span>
                </div>
              )}
            </GlassCard>
          );
        })}
      </section>
    </AppFrame>
  );
}
