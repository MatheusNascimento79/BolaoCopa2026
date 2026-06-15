"use client";

import Link from "next/link";
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import { AppFrame, GlassCard, StatusBadge } from "@/components/live-ui";
import type { BetAuditEntry } from "@/lib/app-data";

type AdminApostasClientProps = {
  entries: BetAuditEntry[];
};

export function AdminApostasClient({ entries }: AdminApostasClientProps) {
  function exportCsv() {
    const csv = toCsv(entries);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `auditoria-apostas-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppFrame
      eyebrow="Super Admin"
      title="Auditoria das Apostas"
      action={<StatusBadge tone="warning">{entries.length} apostas</StatusBadge>}
    >
      <Link className="live-back-action" href="/admin">
        <ArrowLeft size={18} />
        Voltar para principal
      </Link>

      <GlassCard className="live-admin-summary" tone="gold">
        <span className="live-section-label">Apostas registradas</span>
        <strong>{entries.length}</strong>
        <span>Conferência dos palpites salvos por participante.</span>
        <button className="live-primary-action live-export-action" disabled={entries.length === 0} onClick={exportCsv} type="button">
          <Download size={18} />
          Exportar CSV
        </button>
      </GlassCard>

      <section className="live-admin-list" aria-label="Lista de apostas registradas">
        {entries.length === 0 && (
          <GlassCard className="live-admin-feedback" tone="blue">
            <FileSpreadsheet size={18} />
            <span>Nenhuma aposta registrada ainda.</span>
          </GlassCard>
        )}

        {entries.map((entry, index) => (
          <GlassCard className="live-admin-row live-bet-audit-row" key={entry.id}>
            <div>
              <strong>{index + 1}. {entry.nickname}</strong>
              <span>{entry.fullName} · {entry.email}</span>
              <small>{new Date(entry.submittedAt).toLocaleString("pt-BR")}</small>
            </div>
            <StatusBadge tone="success" className="live-admin-status live-admin-status-aprovado">
              Aposta
            </StatusBadge>
            <dl className="live-bet-audit-picks">
              <div>
                <dt>Campeão</dt>
                <dd>{entry.champion}</dd>
              </div>
              <div>
                <dt>Vice</dt>
                <dd>{entry.runnerUp}</dd>
              </div>
              <div>
                <dt>Terceiro</dt>
                <dd>{entry.thirdPlace}</dd>
              </div>
            </dl>
          </GlassCard>
        ))}
      </section>
    </AppFrame>
  );
}

function toCsv(entries: BetAuditEntry[]) {
  const headers = ["Apelido", "Nome", "E-mail", "Campeão", "Vice", "Terceiro", "Data da aposta"];
  const rows = entries.map((entry) => [
    entry.nickname,
    entry.fullName,
    entry.email,
    entry.champion,
    entry.runnerUp,
    entry.thirdPlace,
    new Date(entry.submittedAt).toLocaleString("pt-BR"),
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsvValue).join(";")).join("\n");
}

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
