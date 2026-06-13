import { requirePaymentUploadAccess } from "@/lib/access/profile";
import { getSettings } from "@/lib/app-data";
import { UploadPagamentoClient } from "./upload-client";

export default async function UploadPagamentoPage() {
  await requirePaymentUploadAccess();
  const { settings } = await getSettings();

  return <UploadPagamentoClient paymentAmountCents={settings.paymentAmountCents} paymentPixKey={settings.paymentPixKey} />;
}
