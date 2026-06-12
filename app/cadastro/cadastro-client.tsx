"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Check, CreditCard, FileUp, UserRound } from "lucide-react";
import { AppFrame, GlassCard, StatusBadge } from "@/components/live-ui";
import { appSettings } from "@/lib/mock";
import { createClient } from "@/lib/supabase/client";

const steps = [
  { id: "dados", label: "Dados", icon: UserRound },
  { id: "pagamento", label: "Pagamento", icon: CreditCard },
  { id: "comprovante", label: "Comprovante", icon: FileUp },
  { id: "confirmacao", label: "Confirmação", icon: Check },
];

type SignupError = {
  code?: string;
  message?: string;
  status?: number;
};

function getSignupErrorMessage(error?: SignupError | null) {
  const normalized = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();

  if (normalized.includes("already") || normalized.includes("registered") || normalized.includes("exists")) {
    return "Este e-mail já está cadastrado. Volte para entrar ou remova o usuário em homologação.";
  }

  if (normalized.includes("password")) {
    return "A senha precisa atender aos critérios mínimos de segurança.";
  }

  if (error?.status === 429 || normalized.includes("rate") || normalized.includes("too many")) {
    return "Muitas tentativas em sequência. Aguarde alguns minutos e tente novamente.";
  }

  return "Não foi possível criar sua conta. Verifique os dados e tente novamente.";
}

export function CadastroClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("success");
  const current = steps[step];
  const CurrentIcon = current.icon;

  function handleBack() {
    if (step === 0) {
      router.push("/auth");
      return;
    }

    setStep((value) => Math.max(0, value - 1));
  }

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setMessageTone("success");

    if (email.trim().toLowerCase() !== emailConfirmation.trim().toLowerCase()) {
      setMessage("Os e-mails não conferem.");
      setMessageTone("error");
      setStatus("idle");
      return;
    }

    if (password !== passwordConfirmation) {
      setMessage("As senhas não conferem.");
      setMessageTone("error");
      setStatus("idle");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          nickname: nickname.trim(),
        },
      },
    });

    if (error || !data.user) {
      setMessage(getSignupErrorMessage(error));
      setMessageTone("error");
      setStatus("idle");
      return;
    }

    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setMessage("Cadastro criado, mas a confirmação de e-mail ainda está ativa no Supabase.");
        setMessageTone("error");
        setStatus("idle");
        return;
      }
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      email: email.trim(),
      full_name: fullName.trim(),
      id: data.user.id,
      nickname: nickname.trim(),
      payment_status: "pendente",
      role: "participant",
    });

    if (profileError) {
      setMessage("Este e-mail já tem perfil cadastrado. Volte para entrar no app.");
      setMessageTone("error");
      setStatus("idle");
      return;
    }

    setStatus("done");
    setStep(1);
  }

  return (
    <AppFrame
      eyebrow="Cadastro"
      title="Quero participar"
      action={<StatusBadge tone="warning">R$ 50,00</StatusBadge>}
    >
      <div className="live-register-steps" aria-label="Etapas do cadastro">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              aria-current={index === step ? "step" : undefined}
              key={item.id}
              onClick={() => setStep(index)}
              type="button"
            >
              <Icon size={17} />
              <span>{index + 1}</span>
            </button>
          );
        })}
      </div>

      <GlassCard className="live-register-card" tone={step === 3 ? "green" : "blue"}>
        <div className="live-register-icon">
          <CurrentIcon size={34} />
        </div>
        <span className="live-section-label">{current.label}</span>

        {step === 0 && (
          <form className="live-form-grid" onSubmit={handleCreateAccount}>
            <label className="live-select-field">
              <span>Nome verdadeiro</span>
              <input autoComplete="name" onChange={(event) => setFullName(event.target.value)} required value={fullName} />
            </label>
            <label className="live-select-field">
              <span>Apelido no ranking</span>
              <input autoComplete="nickname" onChange={(event) => setNickname(event.target.value)} required value={nickname} />
            </label>
            <label className="live-select-field">
              <span>E-mail</span>
              <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </label>
            <label className="live-select-field">
              <span>Repetir e-mail</span>
              <input autoComplete="email" onChange={(event) => setEmailConfirmation(event.target.value)} required type="email" value={emailConfirmation} />
            </label>
            <label className="live-select-field">
              <span>Senha</span>
              <input autoComplete="new-password" minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            </label>
            <label className="live-select-field">
              <span>Repetir senha</span>
              <input autoComplete="new-password" minLength={6} onChange={(event) => setPasswordConfirmation(event.target.value)} required type="password" value={passwordConfirmation} />
            </label>
            {message && <p className={messageTone === "error" ? "live-form-error" : "live-form-note"}>{message}</p>}
            <button className="live-primary-action" disabled={status === "loading"} type="submit">
              {status === "loading" ? "Criando..." : "Criar conta"}
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="live-copy-stack">
            <strong>Pagamento NuBank</strong>
            <p>O valor é fixo e o acesso só será liberado após validação manual do Super Admin.</p>
            <a className="live-primary-action" href={appSettings.paymentLink} rel="noreferrer" target="_blank">
              Pagar agora
            </a>
          </div>
        )}

        {step === 2 && (
          <div className="live-upload-box">
            <FileUp size={36} />
            <strong>Enviar comprovante</strong>
            <p>Use uma imagem ou PDF do comprovante para liberar a validação.</p>
          </div>
        )}

        {step === 3 && (
          <div className="live-copy-stack">
            <strong>Cadastro enviado</strong>
            <p>Seu comprovante está em análise. Quando aprovado, o app completo será liberado.</p>
          </div>
        )}
      </GlassCard>

      <div className="live-action-row">
        <button className="live-secondary-action" onClick={handleBack} type="button">
          Voltar
        </button>
        {step === steps.length - 1 ? (
          <Link className="live-primary-action" href="/status/aguardando">
            Acompanhar validação
          </Link>
        ) : (
          <button className="live-primary-action" disabled={step === 0 && status !== "done"} onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))} type="button">
            Continuar
          </button>
        )}
      </div>
    </AppFrame>
  );
}
