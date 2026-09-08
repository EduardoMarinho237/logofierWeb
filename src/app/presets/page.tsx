"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Trash2,
  LayoutTemplate,
  Play,
  Layers,
  Repeat,
  PenTool,
  Copy,
} from "lucide-react";
import { api, type Preset } from "@/lib/api";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { IconButton } from "@/components/ui/IconButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  presetModeLabel,
  presetStrategyLabel,
  pageSelectionLabel,
} from "@/lib/presetLabels";

function PresetCard({
  preset,
  onDelete,
  onUse,
}: {
  preset: Preset;
  onDelete: (preset: Preset) => void;
  onUse: (id: string) => void;
}) {
  const StrategyIcon = preset.pos_strategy === "individual" ? PenTool : Repeat;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-md shadow-[#0e525b]/5 transition-shadow hover:shadow-lg sm:p-5">
      <div className="min-w-0">
        <h3 className="truncate font-semibold text-[#0e525b]">{preset.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#0e525b]/60">
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
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <IconButton variant="ghost" onClick={() => onUse(preset.id)} title="Usar preset">
          <Play className="h-4 w-4 text-[#2b9aa8]" />
        </IconButton>
        <IconButton variant="danger" onClick={() => onDelete(preset)} title="Excluir">
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}

function PresetsManager() {
  const router = useRouter();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Preset | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        const data = await api.listPresets();
        if (active) setPresets(data);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const confirmDelete = useCallback((preset: Preset) => {
    setDeleteTarget(preset);
  }, []);

  async function executeDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deletePreset(deleteTarget.id);
      setPresets((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#e4e4eb]">
      <PageHeader
        title="Presets"
        subtitle="Configurações salvas para reutilizar em novos processamentos"
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-8 sm:py-6">
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#2b9aa8]" />
          </div>
        ) : presets.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg shadow-[#0e525b]/5">
            <LayoutTemplate className="mx-auto mb-3 h-10 w-10 text-[#0e525b]/15" />
            <p className="font-medium text-[#0e525b]/70">Nenhum preset salvo.</p>
            <p className="mt-1 text-xs text-[#0e525b]/50">
              Salve um preset na tela de revisão de um processamento.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                onDelete={confirmDelete}
                onUse={(id) => router.push(`/dashboard/new?presetId=${id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir preset?"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function PresetsPage() {
  return (
    <AuthGuard>
      <PresetsManager />
    </AuthGuard>
  );
}
