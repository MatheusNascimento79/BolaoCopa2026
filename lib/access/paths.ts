export type AccessProfile = {
  role: "participant" | "super_admin";
  payment_status: "pendente" | "aguardando" | "pago";
};

export function resolveAccessPath(profile: AccessProfile) {
  if (profile.role === "super_admin") return "/admin";
  if (profile.payment_status === "pago") return "/";
  if (profile.payment_status === "aguardando") return "/status/aguardando";

  return "/pagamento/upload";
}

export function canAccessApp(profile: AccessProfile) {
  return profile.role === "super_admin" || profile.payment_status === "pago";
}
