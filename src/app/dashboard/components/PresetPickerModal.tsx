"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutTemplate,
  Layers,
  Repeat,
  PenTool,
  Copy,
  Loader2,
  ChevronRight,
  Search,
} from "lucide-react";
import { api, type Preset } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import {
  presetModeLabel,
  presetStrategyLabel,
  pageSelectionLabel,
} from "@/lib/presetLabels";

interface PresetPickerModalProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20";

export function PresetPickerModal({ open, onClose }: PresetPickerModalProps) {
  const router = useRouter();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      try {
        const data = await api.listPresets();
        if (active) {
          setError(null);
          setPresets(data);
        }
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar presets");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter((p) => p.name.toLowerCase().includes(q));
  }, [presets, query]);

  return (
    <Modal open={open} onClose={onClose} title="Usar um preset salvo" maxWidth="max-w-xl">
      <div className="flex flex-col gap-3">
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#2b9aa8]" />
          </div>
        ) : presets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <LayoutTemplate className="h-10 w-10 text-[#0e525b]/15" />
            <p className="font-medium text-[#0e525b]/70">Você ainda não tem presets.</p>
            <p className="max-w-xs text-xs text-[#0e525b]/50">
              Salve um preset na tela de revisão de um processamento para usar aqui.
            </p>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome..."
                className={inputClass}
              />
            </div>

            <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#0e525b33_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#0e525b]/25">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-14 text-center">
                  <LayoutTemplate className="h-10 w-10 text-[#0e525b]/15" />
                  <p className="text-sm text-[#0e525b]/60">
                    Nenhum preset encontrado para essa busca.
                  </p>
                </div>
              ) : (
                filtered.map((preset) => {
                  const StrategyIcon = preset.pos_strategy === "individual" ? PenTool : Repeat;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onClose();
                        router.push(`/dashboard/new?presetId=${preset.id}`);
                      }}
                      className="group flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-md shadow-[#0e525b]/5 transition-all duration-150 hover:shadow-lg hover:shadow-[#2b9aa8]/10 active:scale-[0.99]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2b9aa8]/10 text-[#2b9aa8]">
                        <Layers className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-[#0e525b]">
                          {preset.name}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#0e525b]/60">
                          <span className="flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5 text-[#2b9aa8]" />
                            {presetModeLabel(preset.mode)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Copy className="h-3.5 w-3.5 text-[#2b9aa8]" />
                            {pageSelectionLabel(preset.page_selection.mode)}
                          </span>
                          <span className="flex items-center gap-1">
                            <StrategyIcon className="h-3.5 w-3.5 text-[#2b9aa8]" />
                            {presetStrategyLabel(preset.pos_strategy)}
                          </span>
                        </span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-[#2b9aa8] transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}