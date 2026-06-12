"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

type GlassCardProps = ComponentPropsWithoutRef<"section"> & {
  children: ReactNode;
  tone?: "default" | "gold" | "green" | "blue";
};

export function GlassCard({ children, className = "", tone = "default", ...props }: GlassCardProps) {
  return <section className={`live-glass-card live-glass-${tone} ${className}`.trim()} {...props}>{children}</section>;
}

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "live" | "scheduled" | "done" | "warning" | "success" | "locked";
  className?: string;
};

export function StatusBadge({ children, tone = "scheduled", className = "" }: StatusBadgeProps) {
  return <span className={`live-status-badge live-status-${tone} ${className}`.trim()}>{children}</span>;
}

export type StageTab = {
  id: string;
  label: string;
  count?: number;
  href?: string;
};

type StageTabsProps = {
  tabs: StageTab[];
  activeId: string;
  onSelect?: (id: string) => void;
  className?: string;
};

export function StageTabs({ tabs, activeId, onSelect, className = "" }: StageTabsProps) {
  return (
    <div className={`live-stage-tabs ${className}`.trim()} role="tablist" aria-label="Fases da Copa">
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        const content = (
          <>
            <span>{tab.label}</span>
            {typeof tab.count === "number" && <strong>{tab.count}</strong>}
          </>
        );

        if (tab.href) {
          return (
            <a
              key={tab.id}
              className="live-stage-tab"
              href={tab.href}
              role="tab"
              aria-selected={active}
            >
              {content}
            </a>
          );
        }

        return (
          <button
            key={tab.id}
            className="live-stage-tab"
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect?.(tab.id)}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
