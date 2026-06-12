import { CheckCircle2 } from "lucide-react";
import { StatusScreen } from "../status-screen";

export default function AprovadoPage() {
  return (
    <StatusScreen
      title="Aprovado"
      badge="Liberado"
      badgeTone="success"
      cardTone="green"
      icon={CheckCircle2}
      label="Pagamento aprovado"
      heading="Acesso liberado"
      description="Seu pagamento foi confirmado. Você já pode acompanhar jogos, times, aposta e ranking."
      timeline={[
        "Cadastro confirmado",
        "Pagamento aprovado",
        "Acesso liberado",
      ]}
      actions={[
        { href: "/jogos", label: "Entrar no bolão" },
        { href: "/ranking", label: "Ver ranking", variant: "secondary" },
      ]}
    />
  );
}
