import { requireAppAccessOrBettingGate } from "@/lib/access/betting-gate";
import { getWorldCupSnapshotAt, listMatches, listTeams } from "@/lib/app-data";
import type { TournamentStage } from "@/lib/domain/types";
import { getLiveWorldCupSnapshot } from "@/lib/worldcup/live-data";
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

  const [matches, teams, params, fallbackSnapshotAt] = await Promise.all([
    listMatches(),
    listTeams(),
    searchParams,
    getWorldCupSnapshotAt(),
  ]);
  const snapshot = await getLiveWorldCupSnapshot({ dbMatches: matches, dbTeams: teams, fallbackSnapshotAt });
  const requestedStage = params?.fase as TournamentStage | undefined;
  const activeStage = requestedStage && validStages.has(requestedStage) ? requestedStage : "fase_de_grupos";

  return (
    <JogosClient
      activeStage={activeStage}
      betsDeadlineAt={settings.betsDeadlineAt}
      betsOpen={settings.betsOpen}
      initialMatches={snapshot.matches}
      initialSnapshotAt={snapshot.snapshotAt}
      initialSource={snapshot.dataSource}
      initialTeams={snapshot.teams}
    />
  );
}
