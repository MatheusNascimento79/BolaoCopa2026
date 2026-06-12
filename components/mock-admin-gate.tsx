"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getMockSession } from "@/lib/mock/session";

export function MockAdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = getMockSession();

    if (session?.role !== "super_admin") {
      router.replace("/auth");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) return null;

  return children;
}
