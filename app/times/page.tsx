import { getWorldCupAdapter } from "@/lib/worldcup";
import { requireAppAccess } from "@/lib/access/profile";
import type { Team } from "@/lib/domain/types";
import { TimesClient } from "./times-client";

export default async function TimesPage() {
  await requireAppAccess();

  const adapter = getWorldCupAdapter();
  const teamsResult = await adapter.syncTeams().catch(() => ({
    data: [] as Team[],
    source: adapter.source,
    syncedAt: new Date().toISOString(),
  }));

  return <TimesClient teams={teamsResult.data} />;
}
