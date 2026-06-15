import { requireAppAccessOrBettingGate } from "@/lib/access/betting-gate";
import { getWorldCupSnapshotAt, listTeams } from "@/lib/app-data";
import { getLiveWorldCupSnapshot } from "@/lib/worldcup/live-data";
import { TimesClient } from "./times-client";

export const dynamic = "force-dynamic";

export default async function TimesPage() {
  const { settings } = await requireAppAccessOrBettingGate();

  const [teams, fallbackSnapshotAt] = await Promise.all([listTeams(), getWorldCupSnapshotAt()]);
  const snapshot = await getLiveWorldCupSnapshot({ dbTeams: teams, fallbackSnapshotAt });

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
