"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, FileText, X } from "lucide-react";
import { AppFrame, GlassCard, StatusBadge } from "@/components/live-ui";
import type { PaymentDecisionResult, PaymentReceiptWithProfile } from "@/lib/app-data";
import type { ReceiptStatus } from "@/lib/domain/types";

type AdminPagamentoClientProps = {
  initialReceipts: PaymentReceiptWithProfile[];
  entryAmountCents: number;
};

const statusTone: Record<ReceiptStatus, "success" | "warning" | "locked"> = {
  aprovado: "success",
  aguardando: "warning",
  pendente: "locked",
  rejeitado: "locked",
};

const statusLabel: Record<ReceiptStatus, string> = {
  aprovado: "Aprovado",
  aguardando: "Aguardando",
  pendente: "Pendente",
  rejeitado: "Rejeitado",
};

function money(cents: number | null) {
  return typeof cents === "number"
    ? (cents / 100).toLocaleString("pt-BR", { currency: "BRL", style: "currency" })
    : "Pendente";
}

function dateLabel(value: string | null) {
  return value ? new Date(value).toLocaleString("pt-BR") : "Comprovante não enviado";
}

export function AdminPagamentoClient({ initialReceipts, entryAmountCents }: AdminPagamentoClientProps) {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceiptWithProfile | null>(null);
  const [feedback, setFeedback] = useState("Pronto para validar comprovantes.");
  const [pendingReceiptId, setPendingReceiptId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const paid = receipts.filter((receipt) => receipt.status === "aprovado").length;
    const awaiting = receipts.filter((receipt) => receipt.status === "aguardando").length;
    const pending = receipts.filter((receipt) => receipt.status === "pendente").length;
    const rejected = receipts.filter((receipt) => receipt.status === "rejeitado").length;

    return {
      awaiting,
      paid,
      pending,
      rejected,
      totalRaisedCents: paid * entryAmountCents,
    };
  }, [entryAmountCents, receipts]);

  async function updateReceiptStatus(receiptId: string, status: "aprovado" | "rejeitado") {
    const receipt = receipts.find((item) => item.id === receiptId);
    const participant = receipt?.profile?.nickname ?? "participante";
    setPendingReceiptId(receiptId);

    try {
      const response = await fetch(`/api/payments/${receiptId}`, {
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Falha ao validar comprovante.");

      const result = (await response.json()) as PaymentDecisionResult;
      setReceipts(result.receipts);
      setFeedback(status === "aprovado" ? `${participant} aprovado.` : `${participant} marcado para reenvio.`);
      setSelectedReceipt(null);
    } catch {
      setFeedback("Não foi possível validar este comprovante agora.");
    } finally {
      setPendingReceiptId(null);
    }
  }

  return (
    <AppFrame
      eyebrow="Super Admin"
      title="Pagamentos"
      action={<StatusBadge tone="warning">{summary.awaiting} aguardando</StatusBadge>}
    >
      <Link className="live-back-action" href="/admin">
        <ArrowLeft size={18} />
        Voltar para principal
      </Link>

      <GlassCard className="live-admin-summary" tone="gold">
        <span className="live-section-label">Total validado</span>
        <strong>{money(summary.totalRaisedCents)}</strong>
        <span>{summary.paid} pagos · {summary.pending} pendentes · {summary.rejected} recusados</span>
      </GlassCard>

      <GlassCard className="live-admin-feedback" tone="blue">
        <FileText size={18} />
        <span>{feedback}</span>
      </GlassCard>

      <section className="live-admin-list">
        {receipts.map((receipt) => (
          <GlassCard className="live-admin-row" key={receipt.id}>
            <div>
              <strong>{receipt.profile?.fullName ?? "Participante"}</strong>
              <span>{receipt.profile?.nickname ?? "Sem apelido"} · {money(receipt.detectedAmountCents)}</span>
              <small>{dateLabel(receipt.uploadedAt)}</small>
            </div>
            <StatusBadge tone={statusTone[receipt.status]} className={`live-admin-status live-admin-status-${receipt.status}`}>
              {statusLabel[receipt.status]}
            </StatusBadge>
            <div className="live-admin-actions">
              <button
                aria-label={`Ver comprovante de ${receipt.profile?.fullName ?? "participante"}`}
                disabled={!receipt.storagePath}
                onClick={() => setSelectedReceipt(receipt)}
                type="button"
              >
                <Eye size={16} /> Ver
              </button>
              <button
                aria-label={`Aprovar pagamento de ${receipt.profile?.fullName ?? "participante"}`}
                className="live-admin-action-approve"
                disabled={receipt.status !== "aguardando" || pendingReceiptId === receipt.id}
                onClick={() => updateReceiptStatus(receipt.id, "aprovado")}
                type="button"
              >
                <Check size={16} /> Aprovar
              </button>
              <button
                aria-label={`Recusar pagamento de ${receipt.profile?.fullName ?? "participante"}`}
                className="live-admin-action-reject"
                disabled={receipt.status !== "aguardando" || pendingReceiptId === receipt.id}
                onClick={() => updateReceiptStatus(receipt.id, "rejeitado")}
                type="button"
              >
                <X size={16} /> Recusar
              </button>
            </div>
          </GlassCard>
        ))}
      </section>

      {selectedReceipt && (
        <div
          className="live-modal-backdrop"
          onClick={() => setSelectedReceipt(null)}
          role="presentation"
        >
          <GlassCard
            aria-labelledby="receipt-modal-title"
            aria-modal="true"
            className="live-team-modal live-receipt-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            tone="blue"
          >
            <div className="live-modal-head">
              <div>
                <span className="live-section-label">Comprovante</span>
                <strong id="receipt-modal-title">{selectedReceipt.profile?.nickname ?? "Participante"}</strong>
              </div>
              <button aria-label="Fechar comprovante" onClick={() => setSelectedReceipt(null)} type="button">
                <X size={20} />
              </button>
            </div>

            <div className="live-receipt-preview" aria-label="Prévia do comprovante">
              <FileText size={38} />
              <strong>{selectedReceipt.storagePath?.split("/").pop() ?? "Comprovante"}</strong>
              <span>{money(selectedReceipt.detectedAmountCents)}</span>
            </div>

            <dl className="live-receipt-details">
              <div>
                <dt>Beneficiário</dt>
                <dd>{selectedReceipt.detectedBeneficiary ?? "Não identificado"}</dd>
              </div>
              <div>
                <dt>Confiança da leitura</dt>
                <dd>{selectedReceipt.detectedConfidence ? `${Math.round(selectedReceipt.detectedConfidence * 100)}%` : "Pendente"}</dd>
              </div>
              <div>
                <dt>Envio</dt>
                <dd>{dateLabel(selectedReceipt.uploadedAt)}</dd>
              </div>
            </dl>

            {selectedReceipt.status === "aguardando" && (
              <div className="live-action-row">
                <button
                  className="live-secondary-action"
                  disabled={pendingReceiptId === selectedReceipt.id}
                  onClick={() => updateReceiptStatus(selectedReceipt.id, "rejeitado")}
                  type="button"
                >
                  Recusar
                </button>
                <button
                  className="live-primary-action"
                  disabled={pendingReceiptId === selectedReceipt.id}
                  onClick={() => updateReceiptStatus(selectedReceipt.id, "aprovado")}
                  type="button"
                >
                  Aprovar
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </AppFrame>
  );
}
