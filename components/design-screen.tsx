import Link from "next/link";
import Image from "next/image";

type Hotspot = {
  href: string;
  label: string;
  className: string;
};

export function DesignScreen({
  src,
  alt,
  hotspots = [],
}: {
  src: string;
  alt: string;
  hotspots?: Hotspot[];
}) {
  return (
    <main className="design-stage">
      <section className="design-phone" aria-label={alt}>
        <Image
          className="design-image"
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 440px) 100vw, 440px"
        />
        {hotspots.map((hotspot) => (
          <Link
            key={`${hotspot.href}-${hotspot.label}`}
            className={`design-hotspot ${hotspot.className}`}
            href={hotspot.href}
            aria-label={hotspot.label}
          />
        ))}
      </section>
    </main>
  );
}

export const bottomNavHotspots: Hotspot[] = [
  { href: "/", label: "Ir para Início", className: "nav-home" },
  { href: "/jogos", label: "Ir para Jogos", className: "nav-games" },
  { href: "/times", label: "Ir para Times", className: "nav-teams" },
  { href: "/aposta", label: "Ir para Aposta", className: "nav-bet" },
  { href: "/ranking", label: "Ir para Ranking", className: "nav-ranking" },
];
