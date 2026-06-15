import { requireAppAccessOrBettingGate } from "@/lib/access/betting-gate";
import { getWorldCupSnapshotAt, listTeams } from "@/lib/app-data";
import { TimesClient } from "./times-client";

export const dynamic = "force-dynamic";

export default async function TimesPage() {
  const { settings } = await requireAppAccessOrBettingGate();

  const [teams, fallbackSnapshotAt] = await Promise.all([listTeams(), getWorldCupSnapshotAt()]);

  return (
    <TimesClient
      betsDeadlineAt={settings.betsDeadlineAt}
      betsOpen={settings.betsOpen}
      initialSnapshotAt={fallbackSnapshotAt ?? new Date().toISOString()}
      initialSource="snapshot"
      teams={teams}
    />
  );
}
