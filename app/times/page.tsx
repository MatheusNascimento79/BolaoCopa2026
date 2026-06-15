import { requireAppAccessOrBettingGate } from "@/lib/access/betting-gate";
import { getWorldCupSnapshotAt, listMatches, listTeams } from "@/lib/app-data";
import { getLiveWorldCupSnapshot } from "@/lib/worldcup/live-data";
import { TimesClient } from "./times-client";

export const dynamic = "force-dynamic";

export default async function TimesPage() {
  const { settings } = await requireAppAccessOrBettingGate();

  const [matches, teams, fallbackSnapshotAt] = await Promise.all([listMatches(), listTeams(), getWorldCupSnapshotAt()]);
  const snapshot = await getLiveWorldCupSnapshot({ dbMatches: matches, dbTeams: teams, fallbackSnapshotAt });

  return (
    <TimesClient
      betsDeadlineAt={settings.betsDeadlineAt}
      betsOpen={settings.betsOpen}
      initialSnapshotAt={snapshot.snapshotAt}
      initialSource={snapshot.dataSource}
      teams={snapshot.teams}
    />
  );
}
