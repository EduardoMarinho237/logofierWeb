"use client";

import { FileText, List, Hash, Layers, Copy, BookMarked } from "lucide-react";

export interface PageSelectionValue {
  mode: string;
  first_count: number;
  last_count: number;
  specific_pages: number[];
}

interface Props {
  value: PageSelectionValue;
  onChange: (v: PageSelectionValue) => void;
}

const MODES: { key: string; label: string; icon: typeof Hash }[] = [
  { key: "all", label: "Todas as páginas", icon: Layers },
  { key: "first_only", label: "Somente a primeira página", icon: Copy },
  { key: "last_only", label: "Somente a última página", icon: BookMarked },
  { key: "first_n", label: "Primeiras N páginas", icon: Hash },
  { key: "last_n", label: "Últimas N páginas", icon: Hash },
  { key: "first_n_and_last_m", label: "Primeiras N e últimas M", icon: Hash },
  { key: "specific", label: "Páginas específicas", icon: List },
];

const inputClass =
  "w-16 rounded-lg bg-white px-2 py-1 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20";

export function PageSelectionPanel({ value, onChange }: Props) {
  function setMode(mode: string) {
    onChange({ ...value, mode });
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white/60 p-4 shadow-lg shadow-[#0e525b]/5">
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = value.mode === m.key;
        return (
          <label
            key={m.key}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              active
                ? "bg-[#2b9aa8]/10 shadow-sm shadow-[#2b9aa8]/10"
                : "hover:bg-[#0e525b]/5"
            }`}
          >
            <input
              type="radio"
              name="mode"
              checked={active}
              onChange={() => setMode(m.key)}
              className="accent-[#2b9aa8]"
            />
            <Icon
              className={`h-4 w-4 shrink-0 ${active ? "text-[#2b9aa8]" : "text-[#0e525b]/50"}`}
            />
            <span
              className={`flex flex-1 flex-wrap items-center gap-2 font-medium ${
                active ? "text-[#0e525b]" : "text-[#0e525b]/70"
              }`}
            >
              {m.label}
              {m.key === "first_n" && (
                <input
                  type="number"
                  min={1}
                  value={value.first_count}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onChange({ ...value, first_count: Math.max(1, Number(e.target.value)) })
                  }
                  className={inputClass}
                />
              )}
              {m.key === "last_n" && (
                <input
                  type="number"
                  min={1}
                  value={value.last_count}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onChange({ ...value, last_count: Math.max(1, Number(e.target.value)) })
                  }
                  className={inputClass}
                />
              )}
              {m.key === "first_n_and_last_m" && (
                <>
                  <input
                    type="number"
                    min={1}
                    value={value.first_count}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onChange({ ...value, first_count: Math.max(1, Number(e.target.value)) })
                    }
                    className={inputClass}
                  />
                  <span className="text-[#0e525b]/60">e últimas</span>
                  <input
                    type="number"
                    min={1}
                    value={value.last_count}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onChange({ ...value, last_count: Math.max(1, Number(e.target.value)) })
                    }
                    className={inputClass}
                  />
                </>
              )}
            </span>
          </label>
        );
      })}

      {value.mode === "specific" && (
        <div className="mt-1 pl-7 pr-3">
          <div className="relative">
            <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
            <input
              type="text"
              placeholder="Ex: 1,3,5-10"
              onBlur={(e) => {
                const nums = parseSpecific(e.target.value);
                onChange({ ...value, specific_pages: nums });
              }}
              className="w-full rounded-lg bg-white py-2 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
            />
          </div>
          <p className="mt-1 text-xs text-[#0e525b]/60">
            Use vírgulas e intervalos com hífen.
          </p>
        </div>
      )}
    </div>
  );
}

function parseSpecific(input: string): number[] {
  const result = new Set<number>();
  const parts = input.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes("-")) {
      const [a, b] = trimmed.split("-").map((x) => parseInt(x, 10));
      if (!isNaN(a) && !isNaN(b)) {
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        for (let i = lo; i <= hi; i++) result.add(i - 1);
      }
    } else {
      const n = parseInt(trimmed, 10);
      if (!isNaN(n)) result.add(n - 1);
    }
  }
  return Array.from(result);
}
