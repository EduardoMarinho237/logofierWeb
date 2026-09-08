"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { JobMode } from "../hooks/useJobCreator";
import { PresetPickerModal } from "./PresetPickerModal";

const MODES: {
  id: JobMode;
  title: string;
  description: string;
  bullets: string[];
}[] = [
  {
    id: "multiple_pdfs",
    title: "Mesmo logo em vários arquivos",
    description:
      "Você escolhe um único logo e vários PDFs. O logo é aplicado em todos os arquivos selecionados.",
    bullets: ["1 logotipo", "Vários PDFs", "1 PDF de saída por arquivo"],
  },
  {
    id: "multiple_logos",
    title: "Vários logos no mesmo arquivo",
    description:
      "Você escolhe vários logos e um único PDF. Cada logo é aplicado no arquivo gerando 1 PDF para cada imagem.",
    bullets: ["Vários logotipos", "1 único PDF", "1 PDF de saída por logo"],
  },
];

export function ModeSelector({
  selected,
  onSelect,
}: {
  selected: JobMode | null;
  onSelect: (mode: JobMode) => void;
}) {
  const [presetPickerOpen, setPresetPickerOpen] = useState(false);

  return (
    <main className="flex w-full flex-1 items-center justify-center">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2b9aa8] sm:text-xs">
            Como deseja aplicar seus logos?
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-[#0e525b] sm:text-3xl">
            Escolha o tipo de operação
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#0e525b]/70">
            Selecione uma das opções abaixo para começar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {MODES.map((m) => {
            const isSelected = selected === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m.id)}
                className={`group flex flex-col gap-3 rounded-2xl p-5 text-left transition-all duration-200 active:scale-[0.98] sm:p-6 ${
                  isSelected
                    ? "bg-white shadow-xl shadow-[#2b9aa8]/15"
                    : "bg-white shadow-lg shadow-[#0e525b]/5 hover:shadow-xl hover:shadow-[#0e525b]/8"
                }`}
              >
                <span className="font-display text-lg font-semibold text-[#0e525b]">
                  {m.title}
                </span>
                <span className="text-sm leading-relaxed text-[#0e525b]/70">
                  {m.description}
                </span>
                <ul className="mt-1 flex flex-col gap-1.5">
                  {m.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-xs font-medium text-[#0e525b]/80"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#2b9aa8]" />
                      {b}
                    </li>
                  ))}
                </ul>
                <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#2b9aa8]">
                  Começar
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setPresetPickerOpen(true)}
            className="group col-span-full flex items-center justify-between gap-4 rounded-2xl bg-white px-6 py-4 text-left shadow-lg shadow-[#0e525b]/5 transition-all duration-200 hover:shadow-xl hover:shadow-[#0e525b]/8 active:scale-[0.99]"
          >
            <span className="min-w-0">
              <span className="font-display block text-lg font-semibold text-[#0e525b]">
                Usar um preset salvo
              </span>
              <span className="block truncate text-sm text-[#0e525b]/70">
                Reaplique uma configuração já pronta em um novo processamento.
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#2b9aa8]">
              Ver presets
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>
      </div>

      <PresetPickerModal
        key={presetPickerOpen ? "open" : "closed"}
        open={presetPickerOpen}
        onClose={() => setPresetPickerOpen(false)}
      />
    </main>
  );
}
