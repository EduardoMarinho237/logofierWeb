"use client";

import dynamic from "next/dynamic";
import { Move } from "lucide-react";
import type { Position } from "@/lib/api";

const KonvaStage = dynamic(() => import("./KonvaStage"), { ssr: false });

interface Props {
  previewImage: string;
  pageWidthPoints: number;
  pageHeightPoints: number;
  logoUrl: string;
  position: Position;
  onChange: (p: Position) => void;
  onResetProportion?: () => void;
  preserveAspect?: boolean;
}

export function PositionEditor({
  previewImage,
  pageWidthPoints,
  pageHeightPoints,
  logoUrl,
  position,
  onChange,
  onResetProportion,
  preserveAspect,
}: Props) {
  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="min-h-0 flex-1">
        <KonvaStage
          previewImage={previewImage}
          pageWidthPoints={pageWidthPoints}
          pageHeightPoints={pageHeightPoints}
          logoUrl={logoUrl}
          position={position}
          onChange={onChange}
          onResetProportion={onResetProportion}
          preserveAspect={preserveAspect}
        />
      </div>
      <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#0e525b]/5 px-4 py-2 text-xs font-medium text-[#0e525b]/80">
        <Move className="h-3.5 w-3.5 shrink-0 text-[#2b9aa8]" />
        {preserveAspect
          ? "Arraste para mover · Alças para redimensionar (proporção mantida)"
          : "Arraste para mover · Alças para redimensionar (livre) · Duplo clique para mover"}
      </div>
    </div>
  );
}

export default PositionEditor;
