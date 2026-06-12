import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AppFrame, GlassCard, StatusBadge } from "@/components/live-ui";

type StatusAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type StatusScreenProps = {
  eyebrow?: string;
  title: string;
  badge: string;
  badgeTone: "warning" | "success" | "locked";
  cardTone: "blue" | "green" | "gold";
  icon: LucideIcon;
  label: string;
  heading: string;
  description: string;
  actions: StatusAction[];
  timeline?: string[];
};

export function StatusScreen({
  eyebrow = "Cadastro",
  title,
  badge,
  badgeTone,
  cardTone,
  icon: Icon,
  label,
  heading,
  description,
  actions,
  timeline = [],
}: StatusScreenProps) {
  return (
    <AppFrame
      eyebrow={eyebrow}
      title={title}
      action={<StatusBadge tone={badgeTone}>{badge}</StatusBadge>}
    >
      <GlassCard className="live-register-card live-status-center" tone={cardTone}>
        <div className="live-register-icon">
          <Icon size={34} />
        </div>
        <span className="live-section-label">{label}</span>
        <div className="live-copy-stack">
          <strong>{heading}</strong>
          <p>{description}</p>
        </div>
      </GlassCard>

      {timeline.length > 0 && (
        <GlassCard className="live-status-timeline" tone="blue">
          <span className="live-section-label">Andamento</span>
          {timeline.map((item, index) => (
            <p key={`${item}-${index}`}>
              <span>{index + 1}</span>
              {item}
            </p>
          ))}
        </GlassCard>
      )}

      <div className="live-button-stack">
        {actions.map((action) => (
          <Link
            className={action.variant === "secondary" ? "live-secondary-action" : "live-primary-action"}
            href={action.href}
            key={`${action.href}-${action.label}`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </AppFrame>
  );
}
