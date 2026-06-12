import { Clock3 } from "lucide-react";
import { StatusScreen } from "../status-screen";

export default function AguardandoPage() {
  return (
    <StatusScreen
      title="Validação"
      badge="Aguardando"
      badgeTone="warning"
      cardTone="green"
      icon={Clock3}
      label="Comprovante enviado"
      heading="Aguardando validação"
      description="Recebemos seu comprovante. O acesso será liberado após a conferência do pagamento."
      timeline={[
        "Comprovante recebido",
        "Conferência do pagamento",
        "Liberação do acesso",
      ]}
      actions={[
        { href: "/pagamento/upload", label: "Reenviar comprovante", variant: "secondary" },
        { href: "/auth", label: "Voltar para login" },
      ]}
    />
  );
}
