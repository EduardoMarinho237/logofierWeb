"use client";

import { Layers, LayoutTemplate, Repeat, PenTool } from "lucide-react";
import type { JobMode } from "../hooks/useJobCreator";

interface PositionOption {
  value: "single" | "first_rest";
  title: string;
  description: string;
  icon: typeof Layers;
}

const POSITION_OPTIONS: PositionOption[] = [
  {
    value: "single",
    title: "Uma posição única para todas as páginas",
    description: "A mesma posição/tamanho é aplicada em todas as páginas.",
    icon: Layers,
  },
  {
    value: "first_rest",
    title: "Posição na 1ª página + posição nas demais",
    description: "Posicione na primeira página e depois em todas as outras separadamente.",
    icon: LayoutTemplate,
  },
];

export function PositioningStep({
  mode,
  positionMode,
  setPositionMode,
  posStrategy,
  setPosStrategy,
}: {
  mode: JobMode;
  positionMode: "single" | "first_rest";
  setPositionMode: (v: "single" | "first_rest") => void;
  posStrategy: "shared" | "individual";
  setPosStrategy: (v: "shared" | "individual") => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center overflow-y-auto sm:overflow-visible">
      <div className="rounded-2xl bg-[#f7f7fa] p-5 shadow-xl shadow-[#0e525b]/5 sm:p-7">
        <p className="mb-4 text-sm text-[#0e525b]/70">
          Defina como o logo deve ser posicionado no arquivo.
        </p>

        {mode === "multiple_logos" && (
          <div className="mb-6">
            <p className="mb-3 text-sm font-semibold text-[#0e525b]">
              Posição entre os logos
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPosStrategy("shared")}
                className={`rounded-xl p-4 text-left transition-all duration-150 ${
                  posStrategy === "shared"
                    ? "bg-[#2b9aa8]/10 shadow-md shadow-[#2b9aa8]/10"
                    : "bg-white shadow-sm hover:shadow-md hover:shadow-[#0e525b]/5"
                }`}
              >
                <span className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-semibold text-[#0e525b]">
                    <Repeat className="h-4 w-4 text-[#2b9aa8]" />
                    Mesma posição para todos
                  </span>
                  <span className="text-xs text-[#0e525b]/70">
                    Você posiciona uma vez e ela é aplicada a todos os logos.
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPosStrategy("individual")}
                className={`rounded-xl p-4 text-left transition-all duration-150 ${
                  posStrategy === "individual"
                    ? "bg-[#2b9aa8]/10 shadow-md shadow-[#2b9aa8]/10"
                    : "bg-white shadow-sm hover:shadow-md hover:shadow-[#0e525b]/5"
                }`}
              >
                <span className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-semibold text-[#0e525b]">
                    <PenTool className="h-4 w-4 text-[#2b9aa8]" />
                    Alterar um por um
                  </span>
                  <span className="text-xs text-[#0e525b]/70">
                    Posicione cada logo individualmente em uma cópia do PDF.
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        <div>
          <p className="mb-3 text-sm font-semibold text-[#0e525b]">Posição nas páginas</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {POSITION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = positionMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPositionMode(opt.value)}
                  className={`rounded-xl p-4 text-left transition-all duration-150 ${
                    active
                      ? "bg-[#2b9aa8]/10 shadow-md shadow-[#2b9aa8]/10"
                      : "bg-white shadow-sm hover:shadow-md hover:shadow-[#0e525b]/5"
                  }`}
                >
                  <span className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 font-semibold text-[#0e525b]">
                      <Icon className="h-4 w-4 text-[#2b9aa8]" />
                      {opt.title}
                    </span>
                    <span className="text-xs text-[#0e525b]/70">{opt.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
