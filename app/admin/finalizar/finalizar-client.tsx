"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Clock3, Lock, Unlock } from "lucide-react";
import { AppFrame, GlassCard, StatusBadge } from "@/components/live-ui";
import type { AppSettings, AppSettingsAuditEntry } from "@/lib/mock";

type AdminFinalizarClientProps = {
  initialSettings: AppSettings;
};

function auditLabel(entry: AppSettingsAuditEntry) {
  if (entry.action === "bets_opened") return "Abertura";
  if (entry.action === "bets_closed") return "Fechamento";
  if (entry.action === "payment_approved") return "Pagamento aprovado";
  return "Pagamento recusado";
}

export function AdminFinalizarClient({ initialSettings }: AdminFinalizarClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const open = settings.betsOpen;

  async function toggleBetsOpen() {
    setSaving(true);

    try {
      const response = await fetch("/api/mock/settings/bets", {
        body: JSON.stringify({ actorId: "profile-admin", open: !open }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) throw new Error("settings_update_failed");

      const result = (await response.json()) as { settings: AppSettings };
      setSettings(result.settings);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppFrame eyebrow="Super Admin" title="Apostas" action={<StatusBadge tone={open ? "success" : "locked"}>{open ? "Aberto" : "Fechado"}</StatusBadge>}>
      <Link className="live-back-action" href="/admin">
        <ArrowLeft size={18} />
        Voltar para principal
      </Link>

      <GlassCard className="live-admin-control" tone={open ? "green" : "gold"}>
        <div className="live-register-icon">
          {open ? <Unlock size={34} /> : <Lock size={34} />}
        </div>
        <span className="live-section-label">Estado atual</span>
        <strong>{open ? "Palpites abertos" : "Palpites encerrados"}</strong>
        <p>Ao alterar este estado, a ação fica registrada na auditoria administrativa.</p>
        <button className={open ? "live-secondary-action" : "live-primary-action"} disabled={saving} onClick={toggleBetsOpen} type="button">
          {open ? "Finalizar apostas" : "Reabrir apostas"}
        </button>
      </GlassCard>

      <GlassCard className="live-admin-audit" tone="blue">
        <span className="live-section-label">Auditoria</span>
        {settings.auditTrail.map((entry) => (
          <p key={entry.id}>
            <Clock3 size={15} />
            <span>{auditLabel(entry)} · {new Date(entry.createdAt).toLocaleString("pt-BR")}</span>
          </p>
        ))}
      </GlassCard>
    </AppFrame>
  );
}
