"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";

export function PositionHeader({
  jobId,
  mode,
  activeStep,
  isPerLogo,
  logoIndex,
  logoCount,
}: {
  jobId: string;
  mode: "single" | "first_rest";
  activeStep: 0 | 1;
  isPerLogo: boolean;
  logoIndex: number | null;
  logoCount: number;
}) {
  const router = useRouter();

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-display text-lg font-semibold text-[#0e525b] sm:text-xl">
            {isPerLogo
              ? `Posicionar logo ${logoIndex !== null ? logoIndex + 1 : ""}${
                  logoCount > 0 ? ` de ${logoCount}` : ""
                }`
              : "Posicionar logo"}
          </h1>
          <p className="text-xs text-[#0e525b]/60">
            {mode === "first_rest"
              ? activeStep === 0
                ? "Posicione a logo na 1ª página"
                : "Posicione a logo nas demais páginas"
              : "Arraste, redimensione e centralize o logo"}
          </p>
        </div>
      </div>
      <button
        onClick={() => router.push(isPerLogo ? `/arrange/${jobId}` : "/dashboard")}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-[#f7f7fa] px-3 py-2 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:bg-white hover:shadow-lg active:scale-[0.98]"
      >
        <ArrowLeftIcon className="h-4 w-4 text-[#2b9aa8]" />
        <span className="hidden sm:inline">{isPerLogo ? "Voltar à lista" : "Voltar"}</span>
      </button>
    </header>
  );
}
