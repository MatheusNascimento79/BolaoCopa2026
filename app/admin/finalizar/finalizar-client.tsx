"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CalendarClock, Clock3, Lock, Save, Unlock } from "lucide-react";
import { AppFrame, GlassCard, StatusBadge } from "@/components/live-ui";
import type { AppSettings, AppSettingsAuditEntry } from "@/lib/domain/types";

type AdminFinalizarClientProps = {
  initialSettings: AppSettings;
};

function auditLabel(entry: AppSettingsAuditEntry) {
  if (entry.action === "bets_opened") return "Abertura";
  if (entry.action === "bets_closed") return "Fechamento";
  if (entry.action === "bets_deadline_updated") return "Prazo atualizado";
  if (entry.action === "payment_approved") return "Pagamento aprovado";
  return "Pagamento recusado";
}

export function AdminFinalizarClient({ initialSettings }: AdminFinalizarClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [deadlineInput, setDeadlineInput] = useState(formatDeadlineInput(initialSettings.betsDeadlineAt));
  const [saving, setSaving] = useState(false);
  const open = settings.betsOpen;

  async function toggleBetsOpen() {
    setSaving(true);

    try {
      const response = await fetch("/api/settings/bets", {
        body: JSON.stringify({ open: !open }),
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

  async function saveDeadline() {
    setSaving(true);

    try {
      const response = await fetch("/api/settings/bets", {
        body: JSON.stringify({ betsDeadlineAt: parseDeadlineInput(deadlineInput) }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) throw new Error("settings_update_failed");

      const result = (await response.json()) as { settings: AppSettings };
      setSettings(result.settings);
      setDeadlineInput(formatDeadlineInput(result.settings.betsDeadlineAt));
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

      <GlassCard className="live-admin-control" tone="blue">
        <div className="live-register-icon">
          <CalendarClock size={34} />
        </div>
        <span className="live-section-label">Fim das apostas</span>
        <strong>{settings.betsDeadlineAt ? formatDeadlineLabel(settings.betsDeadlineAt) : "Sem prazo definido"}</strong>
        <label className="live-select-field">
          <span>Data e horário de finalização</span>
          <input
            type="datetime-local"
            value={deadlineInput}
            onChange={(event) => setDeadlineInput(event.target.value)}
          />
        </label>
        <button className="live-primary-action" disabled={saving} onClick={saveDeadline} type="button">
          <Save size={18} />
          Salvar prazo
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

function formatDeadlineInput(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function parseDeadlineInput(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function formatDeadlineLabel(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
