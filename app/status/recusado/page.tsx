import { CircleAlert } from "lucide-react";
import { StatusScreen } from "../status-screen";

export default function RecusadoPage() {
  return (
    <StatusScreen
      title="Revisão"
      badge="Ajustar"
      badgeTone="locked"
      cardTone="gold"
      icon={CircleAlert}
      label="Comprovante recusado"
      heading="Precisamos de um novo envio"
      description="Não foi possível confirmar o pagamento com o comprovante enviado. Reenvie o arquivo ou refaça o pagamento."
      timeline={[
        "Comprovante analisado",
        "Pagamento não confirmado",
        "Novo envio necessário",
      ]}
      actions={[
        { href: "/pagamento/upload", label: "Reenviar comprovante" },
        { href: "/auth", label: "Voltar para login", variant: "secondary" },
      ]}
    />
  );
}
