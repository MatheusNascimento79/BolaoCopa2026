import { requireAppAccess } from "@/lib/access/profile";
import { listMatches, listTeams } from "@/lib/app-data";
import type { TournamentStage } from "@/lib/domain/types";
import { stageOrder } from "@/lib/worldcup/stages";
import { JogosClient } from "./jogos-client";

const validStages = new Set<TournamentStage>(stageOrder);

type JogosPageProps = {
  searchParams?: Promise<{
    fase?: string;
  }>;
};

export default async function JogosPage({ searchParams }: JogosPageProps) {
  await requireAppAccess();

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
      initialMatches={matches}
      initialTeams={teams}
    />
  );
}
