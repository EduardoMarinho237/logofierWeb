"use client";

import { useState } from "react";
import { Download, Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api, type JobConfig } from "@/lib/api";

export function SavePresetModal({
  open,
  config,
  onProceed,
  onClose,
}: {
  open: boolean;
  config: JobConfig | null;
  onProceed: () => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!config) {
      onProceed();
      return;
    }
    if (!name.trim()) {
      setError("Dê um nome ao preset.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.createPreset({
        name: name.trim(),
        mode: config.mode ?? "multiple_pdfs",
        pos_strategy: config.pos_strategy ?? "shared",
        page_selection: config.page_selection ?? {
          mode: "all",
          first_count: 1,
          last_count: 1,
          specific_pages: [],
        },
        position: config.position ?? {
          x: 0,
          y: 0,
          width: 120,
          height: 120,
          page_width: 595,
          page_height: 842,
        },
        position_rest: config.position_rest ?? null,
        position_mode: config.position_mode ?? "single",
      });
      onProceed();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar preset");
      setSaving(false);
    }
  }

  function handleSkip() {
    onProceed();
  }

  return (
    <Modal open={open} onClose={onClose} title="Salvar para reutilizar?" maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-[#0e525b]/70">
          Deseja salvar a configuração deste processamento como um preset, para
          reutilizar depois?
        </p>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
          Nome do preset
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Literatura científica"
            maxLength={255}
            autoFocus
            className="rounded-xl bg-white px-3 py-2.5 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
          />
        </label>
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            className="w-full"
            loading={saving}
            onClick={handleSave}
            disabled={!name.trim()}
          >
            <Save className="h-4 w-4" />
            Salvar preset e baixar
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleSkip} disabled={saving}>
            <Download className="h-4 w-4" />
            Apenas baixar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
