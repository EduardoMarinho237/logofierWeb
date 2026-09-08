"use client";

import { Copy, LayoutTemplate } from "lucide-react";

export function StepTabs({
  mode,
  activeStep,
  onChange,
}: {
  mode: "single" | "first_rest";
  activeStep: 0 | 1;
  onChange: (step: 0 | 1) => void;
}) {
  if (mode === "single") return null;

  return (
    <div className="mb-3 flex shrink-0 items-center gap-2">
      <button
        onClick={() => onChange(0)}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
          activeStep === 0
            ? "bg-[#0e525b] text-white shadow-md shadow-[#0e525b]/20"
            : "bg-[#f7f7fa] text-[#0e525b] shadow-md shadow-[#0e525b]/5 hover:bg-white"
        }`}
      >
        <Copy className="h-4 w-4" />
        Página 1
      </button>
      <button
        onClick={() => onChange(1)}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
          activeStep === 1
            ? "bg-[#0e525b] text-white shadow-md shadow-[#0e525b]/20"
            : "bg-[#f7f7fa] text-[#0e525b] shadow-md shadow-[#0e525b]/5 hover:bg-white"
        }`}
      >
        <LayoutTemplate className="h-4 w-4" />
        Demais páginas
      </button>
    </div>
  );
}
