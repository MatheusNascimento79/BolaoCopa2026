import { getSettings } from "@/lib/app-data";
import { requireSuperAdmin } from "@/lib/access/profile";
import { AdminFinalizarClient } from "./finalizar-client";

export const dynamic = "force-dynamic";

export default async function AdminFinalizarPage() {
  await requireSuperAdmin();

  const { settings } = await getSettings();

  return <AdminFinalizarClient initialSettings={settings} />;
}
