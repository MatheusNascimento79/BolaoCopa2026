import { requireAppAccess } from "@/lib/access/profile";
import { listTeams } from "@/lib/app-data";
import { TimesClient } from "./times-client";

export default async function TimesPage() {
  await requireAppAccess();

  const teams = await listTeams();

  return <TimesClient teams={teams} />;
}
