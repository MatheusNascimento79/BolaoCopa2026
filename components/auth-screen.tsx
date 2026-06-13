"use client";

import Link from "next/link";
import { LockKeyhole, Mail, Trophy } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame, GlassCard } from "@/components/live-ui";
import { resolveAccessPath } from "@/lib/access/paths";
import { createClient } from "@/lib/supabase/client";

type LoginProfile = {
  id: string;
  email: string;
  full_name: string;
  nickname: string;
  role: "participant" | "super_admin";
  payment_status: "pendente" | "aguardando" | "pago";
};

type AuthUserMetadata = {
  full_name?: string;
  nickname?: string;
};

function fallbackNameFromEmail(email: string) {
  return email.split("@")[0] || "Participante";
}

export function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage("E-mail ou senha inválidos.");
      setStatus("idle");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;

    if (!userId) {
      setErrorMessage("Não foi possível validar sua sessão.");
      setStatus("idle");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,full_name,nickname,role,payment_status")
      .eq("id", userId)
      .maybeSingle<LoginProfile>();

    if (profileError) {
      setErrorMessage("Não foi possível carregar seu perfil agora.");
      setStatus("idle");
      return;
    }

    let resolvedProfile = profile;

    if (!resolvedProfile) {
      const metadata = (signInData.user?.user_metadata ?? {}) as AuthUserMetadata;
      const fullName = metadata.full_name?.trim() || fallbackNameFromEmail(normalizedEmail);
      const nickname = metadata.nickname?.trim() || fallbackNameFromEmail(normalizedEmail);
      const { data: createdProfile, error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          email: normalizedEmail,
          full_name: fullName,
          id: userId,
          nickname,
          payment_status: "pendente",
          role: "participant",
        })
        .select("id,email,full_name,nickname,role,payment_status")
        .single<LoginProfile>();

      if (createProfileError || !createdProfile) {
        setErrorMessage("Não foi possível retomar seu cadastro agora.");
        setStatus("idle");
        return;
      }

      resolvedProfile = createdProfile;
    }

    router.refresh();
    router.replace(resolveAccessPath(resolvedProfile));
  }

  return (
    <AppFrame className="live-login-frame">
      <GlassCard className="live-form-card live-login-card" tone="blue">
        <section className="live-login-hero">
          <div className="live-login-trophy" aria-hidden="true">
            <Trophy size={54} />
          </div>
          <div className="live-login-brand">
            <strong>Bolão Copa 2026</strong>
            <span>Bem-vindo de volta</span>
          </div>
        </section>

        <form onSubmit={handleLogin}>
          <label className="live-field">
            <span>E-mail</span>
            <div>
              <Mail size={19} />
              <input
                aria-label="E-mail"
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="E-mail"
                required
                type="email"
                value={email}
              />
            </div>
          </label>

          <label className="live-field">
            <span>Senha</span>
            <div>
              <LockKeyhole size={19} />
              <input
                aria-label="Senha"
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Senha"
                required
                type="password"
                value={password}
              />
            </div>
          </label>

          {errorMessage && <p className="live-form-error">{errorMessage}</p>}

          <div className="live-button-stack">
            <button className="live-primary-action" disabled={status === "loading"} type="submit">
              {status === "loading" ? "Entrando..." : "Entrar"}
            </button>
            <Link className="live-secondary-action live-gold-action" href="/cadastro">
              Quero Participar
            </Link>
          </div>
        </form>

        <Link className="live-text-link" href="/status/aguardando">
          Esqueceu sua senha?
        </Link>
        <div className="live-login-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </GlassCard>
    </AppFrame>
  );
}
