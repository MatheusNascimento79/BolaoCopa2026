import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessApp, resolveAccessPath } from "./paths";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  nickname: string;
  role: "participant" | "super_admin";
  payment_status: "pendente" | "aguardando" | "pago";
};

export async function requireProfile() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,nickname,role,payment_status")
    .eq("id", claimsData.claims.sub)
    .single<Profile>();

  if (error || !profile) {
    redirect("/login");
  }

  return profile;
}

export async function requireAppAccess() {
  const profile = await requireProfile();

  if (!canAccessApp(profile)) {
    redirect(resolveAccessPath(profile));
  }

  return profile;
}

export async function requireSuperAdmin() {
  const profile = await requireProfile();

  if (profile.role !== "super_admin") {
    redirect(resolveAccessPath(profile));
  }

  return profile;
}

export async function requirePaymentUploadAccess() {
  const profile = await requireProfile();

  if (profile.role === "super_admin" || profile.payment_status === "pago") {
    redirect("/");
  }

  if (profile.payment_status === "aguardando") {
    redirect("/status/aguardando");
  }

  return profile;
}
