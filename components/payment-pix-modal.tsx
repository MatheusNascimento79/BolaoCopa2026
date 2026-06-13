"use client";

import { Check, Copy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GlassCard } from "@/components/live-ui";

type PaymentPixModalProps = {
  amountLabel: string;
  pixKey: string;
};

export function PaymentPixButton({ amountLabel, pixKey }: PaymentPixModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function copyPixKey() {
    if (!pixKey) return;

    await navigator.clipboard.writeText(pixKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const modal = open ? (
    <div className="live-modal-backdrop live-payment-backdrop" role="presentation">
      <GlassCard aria-labelledby="payment-pix-title" className="live-team-modal live-payment-modal" role="dialog" tone="blue">
        <div className="live-modal-head">
          <strong id="payment-pix-title">Dados para o pagamento</strong>
          <button aria-label="Fechar" onClick={() => setOpen(false)} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="live-payment-modal-content">
          <div className="live-payment-row">
            <span>Valor</span>
            <strong>{amountLabel}</strong>
          </div>

          <div className="live-payment-row">
            <span>Chave Pix NUBank</span>
            <button className="live-pix-copy" disabled={!pixKey} onClick={copyPixKey} type="button">
              <strong>{pixKey || "Chave Pix não configurada"}</strong>
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          {copied && <p className="live-form-note">Chave Pix copiada.</p>}
        </div>

        <button className="live-primary-action" onClick={() => setOpen(false)} type="button">
          OK
        </button>
      </GlassCard>
    </div>
  ) : null;

  return (
    <>
      <button className="live-primary-action" onClick={() => setOpen(true)} type="button">
        Pagar agora
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
