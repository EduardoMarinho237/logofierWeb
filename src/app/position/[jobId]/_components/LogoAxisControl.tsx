"use client";

import { Crosshair } from "lucide-react";
import { ControlSection } from "./ControlSection";

export type LogoAxis = "center" | "top_left" | "top_right" | "bottom_left" | "bottom_right";

const AXES: { value: LogoAxis; label: string }[] = [
  { value: "top_left", label: "Superior esquerdo" },
  { value: "top_right", label: "Superior direito" },
  { value: "center", label: "Central" },
  { value: "bottom_left", label: "Inferior esquerdo" },
  { value: "bottom_right", label: "Inferior direito" },
];

export function LogoAxisControl({
  value,
  onChange,
}: {
  value: LogoAxis;
  onChange: (axis: LogoAxis) => void;
}) {
  return (
    <ControlSection title="Eixo do logo" icon={Crosshair}>
      <p className="mb-3 text-xs text-[#0e525b]/60">
        Define o ponto de referência usado por todos os logos no modo múltiplos logos.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {AXES.map((axis) => (
          <button
            key={axis.value}
            onClick={() => onChange(axis.value)}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[10px] font-semibold transition active:scale-[0.98] ${
              value === axis.value
                ? "bg-[#0e525b] text-white shadow-md shadow-[#0e525b]/20"
                : "bg-white text-[#0e525b] shadow-sm shadow-[#0e525b]/5 hover:shadow-md hover:shadow-[#0e525b]/5"
            }`}
          >
            <AxisIcon axis={axis.value} active={value === axis.value} />
            {axis.label}
          </button>
        ))}
      </div>
    </ControlSection>
  );
}

function AxisIcon({ axis, active }: { axis: LogoAxis; active: boolean }) {
  const color = active ? "#ffffff" : "#2b9aa8";
  // Small 20x12 rectangle representing the logo; the dot marks the anchor.
  const dot = (() => {
    switch (axis) {
      case "top_left":
        return { cx: 3, cy: 3 };
      case "top_right":
        return { cx: 17, cy: 3 };
      case "center":
        return { cx: 10, cy: 7 };
      case "bottom_left":
        return { cx: 3, cy: 11 };
      case "bottom_right":
        return { cx: 17, cy: 11 };
    }
  })();

  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <rect x="1" y="1" width="18" height="12" rx="1.5" stroke={color} strokeWidth="1.5" />
      <circle cx={dot.cx} cy={dot.cy} r="2" fill={color} />
    </svg>
  );
}
