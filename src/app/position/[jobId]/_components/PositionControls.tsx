"use client";

import {
  Maximize2,
  Layers,
  Move,
  Minus,
  Plus,
  RotateCcw,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
} from "lucide-react";
import { ControlSection } from "./ControlSection";
import type { Position } from "@/lib/api";

const SIZE_STEP = 10;

export function PositionControls({
  activePosition,
  preserveAspect,
  logoAspect,
  onMove,
  onSetActivePosition,
  onCenterHoriz,
  onCenterVert,
  onCenterBoth,
  onSetSize,
  onResetProportion,
}: {
  activePosition: Position;
  preserveAspect: boolean;
  logoAspect: number;
  onMove: (dx: number, dy: number) => void;
  onSetActivePosition: (p: Position) => void;
  onCenterHoriz: () => void;
  onCenterVert: () => void;
  onCenterBoth: () => void;
  onSetSize: (w: number, h: number) => void;
  onResetProportion: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-3 overflow-y-auto pb-2 lg:w-72">
      <ControlSection title="Posição (X, Y)" icon={Maximize2}>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-[#0e525b]">
            X
            <input
              type="number"
              value={Math.round(activePosition.x)}
              onChange={(e) => onMove(Number(e.target.value) - activePosition.x, 0)}
              className="w-full cursor-text rounded-lg bg-white px-3 py-2 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-[#0e525b]">
            Y
            <input
              type="number"
              value={Math.round(activePosition.y)}
              onChange={(e) => onMove(0, Number(e.target.value) - activePosition.y)}
              className="w-full cursor-text rounded-lg bg-white px-3 py-2 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
            />
          </label>
        </div>
      </ControlSection>

      <ControlSection title="Tamanho do logo" icon={Layers}>
            <p className="mb-3 text-xs text-[#0e525b]/60">
              {preserveAspect
                ? "Ajuste o tamanho pela largura. A altura é mantida automaticamente para preservar a proporção de cada logo."
                : "Ajuste livre ou use as alças no preview. O botão abaixo restaura a proporção original do logo."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-[#0e525b]">
                Largura (pt)
                <input
                  type="number"
                  min={1}
                  value={Math.round(activePosition.width)}
                  onChange={(e) => {
                    const width = Math.max(10, Number(e.target.value));
                    onSetActivePosition({
                      ...activePosition,
                      width,
                      height: preserveAspect ? width / logoAspect : activePosition.height,
                    });
                  }}
                  className="w-full cursor-text rounded-lg bg-white px-3 py-2 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-[#0e525b]">
                Altura (pt)
                <input
                  type="number"
                  min={1}
                  disabled={preserveAspect}
                  value={Math.round(activePosition.height)}
                  onChange={(e) =>
                    onSetActivePosition({
                      ...activePosition,
                      height: Math.max(10, Number(e.target.value)),
                    })
                  }
                  className={`w-full cursor-text rounded-lg bg-white px-3 py-2 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20 ${preserveAspect ? "opacity-60" : ""}`}
                />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onSetSize(activePosition.width - SIZE_STEP, activePosition.height - SIZE_STEP)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white py-2.5 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:text-[#2b9aa8] hover:shadow-lg active:scale-[0.98]"
              >
                <Minus className="h-4 w-4 text-[#2b9aa8]" /> Menor
              </button>
              <button
                onClick={() => onSetSize(activePosition.width + SIZE_STEP, activePosition.height + SIZE_STEP)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white py-2.5 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:text-[#2b9aa8] hover:shadow-lg active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 text-[#2b9aa8]" /> Maior
              </button>
            </div>
        <button
          onClick={onResetProportion}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0e525b] px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0e525b]/25 transition hover:bg-[#0c464f] active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          Redefinir proporção
        </button>
      </ControlSection>

      <ControlSection title="Centralizar" icon={Move}>
        <div className="flex flex-col gap-2">
          <button
            onClick={onCenterHoriz}
            className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:text-[#2b9aa8] hover:shadow-lg active:scale-[0.98]"
          >
            <AlignHorizontalDistributeCenter className="h-4 w-4 text-[#2b9aa8]" />
            Horizontalmente
          </button>
          <button
            onClick={onCenterVert}
            className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:text-[#2b9aa8] hover:shadow-lg active:scale-[0.98]"
          >
            <AlignVerticalDistributeCenter className="h-4 w-4 text-[#2b9aa8]" />
            Verticalmente
          </button>
          <button
            onClick={onCenterBoth}
            className="flex items-center justify-center gap-2.5 rounded-lg bg-[#2b9aa8] px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2b9aa8]/30 transition hover:bg-[#248a97] active:scale-[0.98]"
          >
            <Layers className="h-4 w-4" />
            Ambos
          </button>
        </div>
      </ControlSection>
    </div>
  );
}
