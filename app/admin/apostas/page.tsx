import { requireSuperAdmin } from "@/lib/access/profile";
import { listBetAuditEntries } from "@/lib/app-data";
import { AdminApostasClient } from "./apostas-client";

export const dynamic = "force-dynamic";

export default async function AdminApostasPage() {
  await requireSuperAdmin();

  const entries = await listBetAuditEntries();

  return <AdminApostasClient entries={entries} />;
}
