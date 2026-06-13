import { requireAppAccessOrBettingGate } from "@/lib/access/betting-gate";
import { listTeams } from "@/lib/app-data";
import { TimesClient } from "./times-client";

export const dynamic = "force-dynamic";

export default async function TimesPage() {
  const { settings } = await requireAppAccessOrBettingGate();

  const teams = await listTeams();

  return <TimesClient betsDeadlineAt={settings.betsDeadlineAt} betsOpen={settings.betsOpen} teams={teams} />;
}
