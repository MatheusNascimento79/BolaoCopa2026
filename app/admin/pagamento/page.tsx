import { getSettings, listPaymentReceipts } from "@/lib/app-data";
import { requireSuperAdmin } from "@/lib/access/profile";
import { AdminPagamentoClient } from "./pagamento-client";

export const dynamic = "force-dynamic";

export default async function AdminPagamentoPage() {
  await requireSuperAdmin();

  const receipts = listPaymentReceipts();
  const { settings } = getSettings();

  return <AdminPagamentoClient initialReceipts={receipts} entryAmountCents={settings.paymentAmountCents} />;
}
