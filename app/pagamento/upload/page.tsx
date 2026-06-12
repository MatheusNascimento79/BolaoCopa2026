import { requirePaymentUploadAccess } from "@/lib/access/profile";
import { UploadPagamentoClient } from "./upload-client";

export default async function UploadPagamentoPage() {
  await requirePaymentUploadAccess();

  return <UploadPagamentoClient />;
}
