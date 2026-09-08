"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function WizardFooter({
  step,
  totalSteps,
  submitLabel,
  loading,
  onBack,
  onNext,
  onSubmit,
}: {
  step: number;
  totalSteps: number;
  submitLabel: string;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="w-full bg-[#ececf1]/80 px-4 py-3 sm:px-8 sm:py-5">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3">
        {step > 1 && (
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 text-[#2b9aa8]" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        )}

        {step < totalSteps ? (
          <Button variant="primary" size="lg" onClick={onNext} className="flex-1">
            Concluir etapa
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={onSubmit}
            loading={loading}
            className="flex-1"
          >
            {!loading && submitLabel}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
