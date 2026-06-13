"use client";

import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { LiveBottomNav } from "@/components/live-ui";

const prizePoolCents = 1245000;
const whatsappGroupUrl = "https://chat.whatsapp.com/F7mycs099hjFrz5Jn9uGq6?mode=gi_t";

function money(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { currency: "BRL", style: "currency" });
}

type HomeProfile = {
  id: string;
  fullName: string;
  nickname: string;
};

function firstName(profile: HomeProfile | null) {
  if (!profile) return "Zé";
  return profile.nickname.split(" ")[0] || profile.fullName.split(" ")[0] || "Zé";
}

export function HomeClient({ hasBet, profile }: { hasBet: boolean; profile: HomeProfile }) {
  return (
    <main className="live-home-frame">
      <div className="live-home-field" aria-hidden="true" />
      <section className="live-home-shell" aria-label="Início do Bolão Copa 2026">
        <header className="live-home-brand">
          <span>Bolão Copa 2026</span>
        </header>

        <a
          className="live-home-whatsapp"
          href={whatsappGroupUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span>Grupo WhatsApp</span>
          <svg aria-hidden="true" viewBox="0 0 32 32">
            <path d="M16.04 4.01c-6.62 0-12.02 5.35-12.02 11.93 0 2.1.56 4.16 1.62 5.96L4 28l6.27-1.63a12.14 12.14 0 0 0 5.77 1.47c6.62 0 12.02-5.35 12.02-11.93S22.66 4.01 16.04 4.01Zm0 21.76c-1.86 0-3.68-.52-5.25-1.5l-.38-.23-3.72.97.99-3.61-.25-.38a9.74 9.74 0 0 1-1.49-5.08c0-5.44 4.54-9.86 10.1-9.86s10.1 4.42 10.1 9.86-4.54 9.83-10.1 9.83Zm5.54-7.36c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.27-.46-2.42-1.49-.89-.79-1.5-1.77-1.67-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.63-.93-2.23-.25-.58-.5-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.51s1.08 2.91 1.23 3.11c.15.2 2.13 3.24 5.16 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.08 1.79-.73 2.04-1.43.25-.7.25-1.31.18-1.43-.08-.13-.28-.2-.58-.35Z" />
          </svg>
        </a>

        <h1 className="live-home-greeting">Olá, {firstName(profile)}</h1>

        <section className="live-home-prize" aria-label="Premiação atual">
          <div className="live-home-prize-bubble">
            <strong>{money(prizePoolCents)}</strong>
          </div>

          <div className="live-home-treasure" aria-hidden="true">
            <Image
              alt=""
              className="live-home-chest-image"
              fill
              priority
              sizes="(max-width: 440px) 92vw, 390px"
              src="/assets/bau-bolao.png"
            />
          </div>
        </section>

        <div className="live-home-actions">
          <Link className="live-home-primary" href="/aposta">
            Minha Aposta
          </Link>
          <Link className="live-home-secondary" href="/ranking">
            Ver Ranking
          </Link>
          <p className="live-home-status">
            <Check size={16} />
            {hasBet ? "Aposta feita" : "Aposta pendente"}
          </p>
        </div>

        <LiveBottomNav current="/" />
      </section>
    </main>
  );
}
