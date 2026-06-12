"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearMockSession } from "@/lib/mock/session";
import { createClient } from "@/lib/supabase/client";

export function MockLogoutLink() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearMockSession();
    router.refresh();
    router.replace("/auth");
  }

  return (
    <button className="live-admin-exit" onClick={handleLogout} type="button">
      <LogOut size={22} />
      <span>
        <strong>Sair</strong>
        <small>Sair do Super Admin</small>
      </span>
    </button>
  );
}
