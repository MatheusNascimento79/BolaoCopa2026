import { getBetForUser, getSettings, listTeams } from "@/lib/app-data";
import { requireAppAccess } from "@/lib/access/profile";
import type { Team } from "@/lib/domain/types";
import { getWorldCupAdapter } from "@/lib/worldcup";
import { ApostaClient } from "./aposta-client";

export const dynamic = "force-dynamic";

export default async function ApostaPage() {
  const profile = await requireAppAccess();

  const adapter = getWorldCupAdapter();
  const [teamsResult, storedTeams, currentBet, { settings }] = await Promise.all([
    adapter.syncTeams().catch(() => ({ data: [] as Team[], source: adapter.source, syncedAt: new Date().toISOString() })),
    listTeams(),
    getBetForUser(profile.id),
    getSettings(),
  ]);
  const teams = storedTeams.length > 0 ? storedTeams : teamsResult.data;

  return <ApostaClient bet={currentBet} betsOpen={settings.betsOpen} profileId={profile.id} teams={teams} />;
}
