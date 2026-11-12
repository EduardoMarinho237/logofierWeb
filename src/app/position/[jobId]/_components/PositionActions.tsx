"use client";

import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export function PositionActions({
  mode,
  activeStep,
  isPerLogo,
  isPageEdit,
  saving,
  logoIndex,
  logoCount,
  confirmLabel,
  onSwitchStep,
  onNavigateLogo,
  onConfirm,
  onCancel,
}: {
  mode: "single" | "first_rest";
  activeStep: 0 | 1;
  isPerLogo: boolean;
  isPageEdit?: boolean;
  saving: boolean;
  logoIndex: number | null;
  logoCount: number;
  confirmLabel?: string;
  onSwitchStep: (step: 0 | 1) => void;
  onNavigateLogo: (next: number) => void;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  return (
    <>
      {isPerLogo && (
        <div className="flex gap-2">
          <button
            onClick={() => logoIndex !== null && onNavigateLogo(logoIndex - 1)}
            disabled={logoIndex === null || logoIndex <= 0}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#f7f7fa] px-3 py-3 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:bg-white hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeftIcon className="h-4 w-4 text-[#2b9aa8]" />
            Anterior
          </button>
          <button
            onClick={() => logoIndex !== null && onNavigateLogo(logoIndex + 1)}
            disabled={logoIndex === null || logoIndex >= logoCount - 1}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#f7f7fa] px-3 py-3 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:bg-white hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próximo
            <ArrowRight className="h-4 w-4 text-[#2b9aa8]" />
          </button>
        </div>
      )}

      {!isPageEdit && mode === "first_rest" && activeStep === 0 ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSwitchStep(1)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2b9aa8] px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#2b9aa8]/30 transition hover:bg-[#248a97] active:scale-[0.98]"
          >
            Avançar
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      ) : !isPageEdit && mode === "first_rest" && activeStep === 1 ? (
        <div className="flex gap-2">
          <button
            onClick={() => onSwitchStep(0)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f7f7fa] px-3 py-3.5 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:bg-white hover:shadow-lg active:scale-[0.98]"
          >
            <ArrowLeftIcon className="h-4 w-4 text-[#2b9aa8]" />
            Voltar
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2b9aa8] px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#2b9aa8]/30 transition hover:bg-[#248a97] active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                {confirmLabel || (isPerLogo ? "Salvar e concluir" : "Revisar & baixar")}
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={onConfirm}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2b9aa8] px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#2b9aa8]/30 transition hover:bg-[#248a97] active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              {confirmLabel || "Revisar & baixar"}
            </>
          )}
        </button>
      )}

      {isPageEdit && onCancel && (
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f7f7fa] px-4 py-3 text-sm font-semibold text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:bg-white hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
        >
          <ArrowLeftIcon className="h-4 w-4 text-[#2b9aa8]" />
          Cancelar e voltar
        </button>
      )}
    </>
  );
}
