import { getBetForUser, getSettings, listProfiles } from "@/lib/app-data";
import { requireAppAccess } from "@/lib/access/profile";
import { getWorldCupAdapter } from "@/lib/worldcup";
import { ApostaClient } from "./aposta-client";

export const dynamic = "force-dynamic";

export default async function ApostaPage() {
  await requireAppAccess();

  const currentProfile = listProfiles().find((profile) => profile.id === "profile-current");
  const adapter = getWorldCupAdapter();
  const teamsResult = await adapter.syncTeams();
  const currentBet = currentProfile ? getBetForUser(currentProfile.id) : null;
  const { settings } = getSettings();

  return <ApostaClient bet={currentBet} betsOpen={settings.betsOpen} profileId={currentProfile?.id ?? "profile-current"} teams={teamsResult.data} />;
}
