import { redirect } from "next/navigation";
import { shouldForceBettingGate } from "@/lib/betting/status";
import { getBetForUser, getSettings } from "@/lib/app-data";
import { requireAppAccess } from "./profile";

export async function requireAppAccessOrBettingGate() {
  const profile = await requireAppAccess();
  const [{ settings }, bet] = await Promise.all([getSettings(), getBetForUser(profile.id)]);

  if (profile.role === "participant" && shouldForceBettingGate(settings, bet)) {
    redirect("/aposta?obrigatoria=1");
  }

  return { bet, profile, settings };
}
