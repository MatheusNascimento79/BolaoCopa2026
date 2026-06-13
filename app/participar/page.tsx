import { CadastroClient } from "@/app/cadastro/cadastro-client";
import { getSettings } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function ParticiparPage() {
  const { settings } = await getSettings();

  return <CadastroClient paymentAmountCents={settings.paymentAmountCents} paymentLink={settings.paymentLink} />;
}
