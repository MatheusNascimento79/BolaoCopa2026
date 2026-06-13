import Link from "next/link";
import { Home, ReceiptText, Shield, Trophy, UsersRound, Volleyball, type LucideIcon } from "lucide-react";

export type LiveNavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

const defaultItems: LiveNavItem[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/jogos", label: "Jogos", icon: Volleyball },
  { href: "/times", label: "Times", icon: Shield },
  { href: "/participantes", label: "Participantes", icon: UsersRound },
  { href: "/aposta", label: "Aposta", icon: ReceiptText },
  { href: "/ranking", label: "Ranking", icon: Trophy },
];

type LiveBottomNavProps = {
  current?: string;
  items?: LiveNavItem[];
  className?: string;
};

export function LiveBottomNav({ current = "/", items = defaultItems, className = "" }: LiveBottomNavProps) {
  return (
    <nav className={`live-bottom-nav ${className}`.trim()} aria-label="Navegação principal">
      {items.map((item) => {
        const Icon = item.icon ?? Home;
        const active = current === item.href;

        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
            <span className="live-nav-icon">
              <Icon size={24} strokeWidth={active ? 2.35 : 2} />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
