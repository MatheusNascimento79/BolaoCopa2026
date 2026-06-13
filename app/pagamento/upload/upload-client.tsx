"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, FileUp, RotateCcw } from "lucide-react";
import { AppFrame, GlassCard, StatusBadge } from "@/components/live-ui";
import { createClient } from "@/lib/supabase/client";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(cents / 100);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function UploadPagamentoClient({
  paymentAmountCents,
  paymentLink,
}: {
  paymentAmountCents: number;
  paymentLink: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [message, setMessage] = useState("");

  async function submitReceipt() {
    if (!file || status === "uploading") return;

    setMessage("");

    if (file.size > 10 * 1024 * 1024) {
      setMessage("O arquivo precisa ter até 10 MB.");
      return;
    }

    const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
    if (!allowedTypes.has(file.type)) {
      setMessage("Use PDF, JPEG, PNG ou WebP.");
      return;
    }

    setStatus("uploading");
    const supabase = createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;

    if (!userId) {
      setMessage("Faça login novamente para enviar o comprovante.");
      setStatus("idle");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "comprovante";
    const storagePath = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-receipts")
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setMessage("Não foi possível enviar o arquivo. Tente novamente.");
      setStatus("idle");
      return;
    }

    const { error: receiptError } = await supabase.from("payment_receipts").insert({
      status: "aguardando",
      storage_path: storagePath,
      user_id: userId,
    });

    if (receiptError) {
      setMessage("Arquivo enviado, mas não foi possível registrar o comprovante. Fale com o administrador.");
      setStatus("idle");
      return;
    }

    router.refresh();
    router.replace("/status/aguardando");
  }

  return (
    <AppFrame
      eyebrow="Cadastro"
      title="Pagamento"
      action={
        <StatusBadge tone={file ? "success" : "warning"}>
          {file ? "Pronto" : paymentAmountCents > 0 ? formatCurrency(paymentAmountCents) : "Pagamento"}
        </StatusBadge>
      }
    >
      <GlassCard className="live-register-card" tone="blue">
        <div className="live-register-icon">
          <CreditCard size={34} />
        </div>
        <span className="live-section-label">Comprovante</span>
        <div className="live-copy-stack">
          <strong>Pagamento NuBank</strong>
          <p>Envie o comprovante Pix para validação manual do Super Admin.</p>
          {paymentLink ? (
            <a className="live-primary-action" href={paymentLink} rel="noreferrer" target="_blank">
              Pagar agora
            </a>
          ) : (
            <p className="live-form-note">Link de pagamento ainda não configurado.</p>
          )}
        </div>
      </GlassCard>

      <div className={`live-upload-box ${file ? "live-upload-ready" : ""}`.trim()}>
        <input
          ref={inputRef}
          accept="image/*,.pdf"
          className="live-upload-input"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          type="file"
        />
        <FileUp size={36} />
        <strong>{file ? "Comprovante selecionado" : "Enviar comprovante"}</strong>
        <p>{file ? `${file.name} · ${formatFileSize(file.size)}` : "Selecione uma imagem ou PDF do comprovante para seguir para validação."}</p>
        {message && <p className="live-form-error">{message}</p>}
        <div className="live-upload-actions">
          <button className="live-secondary-action" onClick={() => inputRef.current?.click()} type="button">
            {file ? <RotateCcw size={17} /> : <FileUp size={17} />}
            {file ? "Trocar arquivo" : "Selecionar arquivo"}
          </button>
          <button
            aria-disabled={!file || status === "uploading"}
            className={`live-primary-action ${!file ? "live-action-disabled" : ""}`.trim()}
            disabled={!file || status === "uploading"}
            onClick={submitReceipt}
            type="button"
          >
            <Check size={17} />
            {status === "uploading" ? "Enviando..." : "Enviar comprovante"}
          </button>
        </div>
      </div>
    </AppFrame>
  );
}
