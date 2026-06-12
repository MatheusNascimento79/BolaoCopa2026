import type { Profile, UserRole } from "./types";

const MOCK_SESSION_KEY = "bolao-copa-2026-session";

export type MockSession = {
  profileId: string;
  role: UserRole;
};

export function getMockSession(): MockSession | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(MOCK_SESSION_KEY);
    return stored ? (JSON.parse(stored) as MockSession) : null;
  } catch {
    return null;
  }
}

export function setMockSession(session: MockSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
}

export function clearMockSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MOCK_SESSION_KEY);
}

export function resolveMockAccessPath(profile: Profile) {
  if (profile.role === "super_admin") return "/admin";
  if (profile.paymentStatus === "pago") return "/";
  if (profile.paymentStatus === "aguardando") return "/status/aguardando";
  if (profile.paymentStatus === "rejeitado") return "/status/recusado";
  return "/pagamento/upload";
}
