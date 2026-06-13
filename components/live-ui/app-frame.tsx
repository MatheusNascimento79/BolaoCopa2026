import type { ReactNode } from "react";

type AppFrameProps = {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  bottomStatus?: ReactNode;
  nav?: ReactNode;
  className?: string;
};

export function AppFrame({ children, title, eyebrow, action, bottomStatus, nav, className = "" }: AppFrameProps) {
  return (
    <div className={`live-app-frame ${className}`.trim()}>
      <div className="live-app-field" aria-hidden="true" />
      <PhoneShell>
        {(eyebrow || title || action) && (
          <header className="live-app-header">
            <div>
              {eyebrow && <p className="live-eyebrow">{eyebrow}</p>}
              {title && <h1>{title}</h1>}
            </div>
            {action && <div className="live-header-action">{action}</div>}
          </header>
        )}
        <main className="live-app-content">{children}</main>
        {bottomStatus}
        {nav}
      </PhoneShell>
    </div>
  );
}

export function PhoneShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`live-phone-shell ${className}`.trim()}>{children}</div>;
}
