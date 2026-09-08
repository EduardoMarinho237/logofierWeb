"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardOptions } from "./components/DashboardOptions";
import { ModeSelector } from "./components/ModeSelector";
import type { JobMode } from "./hooks/useJobCreator";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="flex h-dvh w-full flex-col bg-[#e4e4eb]">
        <DashboardHeader />

        <div className="relative flex w-full flex-1 flex-col">
          <DashboardOptions />

          <ModeSelector
            selected={null}
            onSelect={(mode: JobMode) => router.push(`/dashboard/new?mode=${mode}`)}
          />
        </div>
      </div>
    </AuthGuard>
  );
}