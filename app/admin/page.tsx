import Link from "next/link";
import { ClipboardList, CreditCard, ShieldCheck, ToggleRight } from "lucide-react";
import { AppFrame, GlassCard, StatusBadge } from "@/components/live-ui";
import { LogoutLink } from "@/components/logout-link";
import { requireSuperAdmin } from "@/lib/access/profile";

export default async function AdminPage() {
  await requireSuperAdmin();

  return (
    <AppFrame eyebrow="Bolão Copa 2026" title="Admin" action={<StatusBadge tone="warning">Prévia</StatusBadge>}>
      <GlassCard className="live-admin-hero" tone="gold">
        <div className="live-register-icon">
          <ShieldCheck size={34} />
        </div>
        <span className="live-section-label">Super Admin</span>
        <strong>Controle operacional</strong>
        <p>Validação visual do fluxo de pagamentos e abertura ou fechamento das apostas.</p>
      </GlassCard>

      <section className="live-admin-menu" aria-label="Ações administrativas">
        <Link href="/admin/pagamento">
          <CreditCard size={22} />
          <span>
            <strong>Pagamentos</strong>
            <small>Validar comprovantes</small>
          </span>
        </Link>
        <Link href="/admin/finalizar">
          <ToggleRight size={22} />
          <span>
            <strong>Apostas</strong>
            <small>Abrir ou fechar rodada</small>
          </span>
        </Link>
        <Link href="/admin/apostas">
          <ClipboardList size={22} />
          <span>
            <strong>Auditoria das Apostas</strong>
            <small>Conferir palpites e exportar lista</small>
          </span>
        </Link>
        <LogoutLink />
      </section>
    </AppFrame>
  );
}
