import { requireAppAccessOrBettingGate } from "@/lib/access/betting-gate";
import { listMatches, listTeams } from "@/lib/app-data";
import type { TournamentStage } from "@/lib/domain/types";
import { stageOrder } from "@/lib/worldcup/stages";
import { JogosClient } from "./jogos-client";

const validStages = new Set<TournamentStage>(stageOrder);

export const dynamic = "force-dynamic";

type JogosPageProps = {
  searchParams?: Promise<{
    fase?: string;
  }>;
};

export default async function JogosPage({ searchParams }: JogosPageProps) {
  const { settings } = await requireAppAccessOrBettingGate();

  const [matches, teams, params] = await Promise.all([
    listMatches(),
    listTeams(),
    searchParams,
  ]);
  const requestedStage = params?.fase as TournamentStage | undefined;
  const activeStage = requestedStage && validStages.has(requestedStage) ? requestedStage : "fase_de_grupos";

  return (
    <JogosClient
      activeStage={activeStage}
      betsDeadlineAt={settings.betsDeadlineAt}
      betsOpen={settings.betsOpen}
      initialMatches={matches}
      initialTeams={teams}
    />
  );
}
