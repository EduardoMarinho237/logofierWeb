"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getToken } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const { user, checkAuth, isAuthenticated, isInitialising } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInitialising) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated === false) {
      router.replace("/login");
      return;
    }

    if (requireAdmin && user && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
  }, [isAuthenticated, user, requireAdmin, router, isInitialising]);

  const isReady =
    typeof window !== "undefined" &&
    !isInitialising &&
    !!getToken() &&
    isAuthenticated &&
    (!requireAdmin || user?.role === "admin");

  if (!isReady) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-[#e4e4eb]">
        <Loader2 className="h-10 w-10 animate-spin text-[#2b9aa8]" />
      </div>
    );
  }

  return <>{children}</>;
}