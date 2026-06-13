import { getBetForUser, getSettings, listTeams } from "@/lib/app-data";
import { requireAppAccess } from "@/lib/access/profile";
import { ApostaClient } from "./aposta-client";

export const dynamic = "force-dynamic";

export default async function ApostaPage() {
  const profile = await requireAppAccess();

  const [teams, currentBet, { settings }] = await Promise.all([
    listTeams(),
    getBetForUser(profile.id),
    getSettings(),
  ]);

  return <ApostaClient bet={currentBet} betsOpen={settings.betsOpen} teams={teams} />;
}
