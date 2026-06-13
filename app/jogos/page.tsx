import { AppFrame, GlassCard, LiveBottomNav, MatchCard, StageTabs, StatusBadge } from "@/components/live-ui";
import { requireAppAccess } from "@/lib/access/profile";
import type { Match, Team, TournamentStage } from "@/lib/domain/types";
import { getWorldCupAdapter } from "@/lib/worldcup";
import { stageLabels, stageOrder } from "@/lib/worldcup/stages";

const validStages = new Set<TournamentStage>(stageOrder);

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

type JogosPageProps = {
  searchParams?: Promise<{
    fase?: string;
  }>;
};

export default async function JogosPage({ searchParams }: JogosPageProps) {
  await requireAppAccess();

  const adapter = getWorldCupAdapter();
  const [matchesResult, teamsResult, params] = await Promise.all([
    adapter.syncMatches().catch(() => ({ data: [] as Match[], source: adapter.source, syncedAt: new Date().toISOString() })),
    adapter.syncTeams().catch(() => ({ data: [] as Team[], source: adapter.source, syncedAt: new Date().toISOString() })),
    searchParams,
  ]);
  const matches = matchesResult.data;
  const teams = teamsResult.data;
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const matchesByStage = groupMatchesByStage(matches);
  const stageTabs = stageOrder.map((stage) => ({
    id: stage,
    label: stage === "fase_de_grupos" ? "Grupos" : stageLabels[stage],
    count: matchesByStage[stage].length,
    href: `/jogos?fase=${stage}`,
  }));
  const requestedStage = params?.fase as TournamentStage | undefined;
  const activeStage = requestedStage && validStages.has(requestedStage) ? requestedStage : "fase_de_grupos";
  const visibleMatches = matchesByStage[activeStage] ?? [];
  const liveMatch = matches.find((match) => match.status === "ao_vivo") ?? null;
  const spotlightMatch = liveMatch ?? matches.find((match) => match.status === "agendado") ?? matches[0];

  return (
    <AppFrame
      eyebrow="Tabela"
      title="Jogos"
      action={<SpotlightBadge live={Boolean(liveMatch)} />}
      nav={<LiveBottomNav current="/jogos" />}
    >
      <StageTabs tabs={stageTabs} activeId={activeStage} />
      <p className="live-phase-caption">{stageLabels[activeStage]}</p>

      <GlassCard className="live-live-card" tone="green">
        <div>
          <StatusBadge tone={liveMatch ? "live" : "scheduled"} className={liveMatch ? "live-pulse-badge" : ""}>
            {liveMatch ? "AO VIVO" : "Próximo jogo"}
          </StatusBadge>
          <strong>
            {spotlightMatch
              ? matchTeamsLabel(spotlightMatch.homeTeamId, spotlightMatch.awayTeamId, teamMap)
              : "Sem jogos disponíveis"}
          </strong>
          <span>
            {spotlightMatch ? `${formatMatchTime(spotlightMatch.kickoffAt)} · ${spotlightMatch.venue}` : "Aguardando dados oficiais"}
          </span>
        </div>
      </GlassCard>

      <section className="live-stack" aria-label={`Jogos - ${stageLabels[activeStage]}`}>
        {visibleMatches.map((match) => {
          const homeTeam = teamMap.get(match.homeTeamId);
          const awayTeam = teamMap.get(match.awayTeamId);

          return (
            <MatchCard
              key={match.id}
              stage={stageLabels[match.stage]}
              group={match.groupName}
              kickoffLabel={formatMatchTime(match.kickoffAt)}
              venue={`${match.venue} · ${match.city}`}
              status={match.status === "encerrado" ? "done" : match.status === "ao_vivo" ? "live" : "scheduled"}
              home={{
                name: homeTeam?.name ?? "A definir",
                flag: homeTeam ? flagByCode[homeTeam.externalId] : undefined,
                score: match.homeScore ?? undefined,
              }}
              away={{
                name: awayTeam?.name ?? "A definir",
                flag: awayTeam ? flagByCode[awayTeam.externalId] : undefined,
                score: match.awayScore ?? undefined,
              }}
            />
          );
        })}
      </section>
    </AppFrame>
  );
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

function SpotlightBadge({ live }: { live: boolean }) {
  return (
    <StatusBadge tone={live ? "live" : "scheduled"} className={live ? "live-pulse-badge" : ""}>
      {live ? "AO VIVO" : "Agenda"}
    </StatusBadge>
  );
}

function formatMatchTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function matchTeamsLabel(homeTeamId: string, awayTeamId: string, teamMap: Map<string, Team>) {
  const homeTeam = teamMap.get(homeTeamId);
  const awayTeam = teamMap.get(awayTeamId);

  return `${homeTeam?.name ?? "Time"} x ${awayTeam?.name ?? "Time"}`;
}
