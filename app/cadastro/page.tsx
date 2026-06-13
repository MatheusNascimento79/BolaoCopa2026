import { CadastroClient } from "./cadastro-client";
import { getSettings } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function CadastroPage() {
  const { settings } = await getSettings();

  return <CadastroClient paymentAmountCents={settings.paymentAmountCents} paymentPixKey={settings.paymentPixKey} />;
}
