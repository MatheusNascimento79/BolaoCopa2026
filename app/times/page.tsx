import { getWorldCupAdapter } from "@/lib/worldcup";
import { requireAppAccess } from "@/lib/access/profile";
import { TimesClient } from "./times-client";

export default async function TimesPage() {
  await requireAppAccess();

  const adapter = getWorldCupAdapter();
  const teamsResult = await adapter.syncTeams();

  return <TimesClient teams={teamsResult.data} />;
}
