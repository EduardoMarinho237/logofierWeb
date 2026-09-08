"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  type JobConfig,
  type Logo,
  type PageSelection,
  type Position,
  type Preset,
} from "@/lib/api";
import { ImageIcon, FileText, Layers, Move } from "lucide-react";

export type JobMode = "multiple_pdfs" | "multiple_logos";

export interface Step {
  id: number;
  label: string;
  icon: typeof ImageIcon;
}

export type SelectedLogo =
  | { kind: "file"; id: string; file: File; name: string; preview: string }
  | { kind: "existing"; id: string; logo: Logo; name: string; preview: string };

const ACCEPTED_LOGO = "image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/bmp,image/tiff";

const LOGO_EXT_RE = /\.(png|jpe?g|webp|svg|gif|bmp|tiff)$/i;

const DEFAULT_POSITION: Position = {
  x: 400,
  y: 50,
  width: 120,
  height: 40,
  page_width: 595,
  page_height: 842,
};

function fileObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

function uniqueFileId(file: File): string {
  return `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useJobCreator(initialMode?: JobMode | null, preset?: Preset | null) {
  const router = useRouter();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const logosInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const presetMode = preset ? (preset.mode === "multiple_logos" ? "multiple_logos" : "multiple_pdfs") : null;
  const [mode, setMode] = useState<JobMode | null>(presetMode ?? initialMode ?? null);
  const [step, setStep] = useState(1);
  const [selectedLogos, setSelectedLogos] = useState<SelectedLogo[]>([]);
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [pageSelection, setPageSelection] = useState<PageSelection>(
    preset?.page_selection ?? {
      mode: "all",
      first_count: 1,
      last_count: 1,
      specific_pages: [],
    }
  );
  const [positionMode, setPositionMode] = useState<"single" | "first_rest">(
    preset?.position_mode === "first_rest" ? "first_rest" : "single"
  );
  const [posStrategy, setPosStrategy] = useState<"shared" | "individual">(
    preset?.pos_strategy === "individual" ? "individual" : "shared"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const locked = preset != null;

  useEffect(() => {
    return () => {
      selectedLogos.forEach((l) => {
        if (l.preview) URL.revokeObjectURL(l.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showPositionStep = !locked && pageSelection.mode === "all";

  const steps: Step[] =
    mode === "multiple_logos"
      ? [
          { id: 1, label: "Logos", icon: ImageIcon },
          { id: 2, label: "Arquivo PDF", icon: FileText },
          { id: 3, label: "Páginas", icon: Layers },
          ...(showPositionStep ? [{ id: 4, label: "Posicionamento", icon: Move }] : []),
        ]
      : [
          { id: 1, label: "Logotipo", icon: ImageIcon },
          { id: 2, label: "Arquivos PDF", icon: FileText },
          { id: 3, label: "Páginas", icon: Layers },
          ...(showPositionStep ? [{ id: 4, label: "Posicionamento", icon: Move }] : []),
        ];

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedLogos((prev) => {
      prev.forEach((l) => {
        if (l.kind === "file") URL.revokeObjectURL(l.preview);
      });
      return [{ kind: "file", id: uniqueFileId(file), file, name: file.name, preview: fileObjectUrl(file) }];
    });
    if (e.target) e.target.value = "";
  }, []);

  const handleLogosChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => LOGO_EXT_RE.test(f.name));
    if (files.length === 0) return;
    setSelectedLogos((prev) => [
      ...prev,
      ...files.map((file) => ({
        kind: "file" as const,
        id: uniqueFileId(file),
        file,
        name: file.name,
        preview: fileObjectUrl(file),
      })),
    ]);
    if (e.target) e.target.value = "";
  }, []);

  const addSavedLogos = useCallback(async (logos: Logo[]) => {
    if (logos.length === 0) return;
    setSelectedLogos((prev) => {
      const existingIds = new Set(prev.filter((l) => l.kind === "existing").map((l) => l.logo.id));
      const upcoming = logos.filter((l) => !existingIds.has(l.id));
      return [
        ...prev,
        ...upcoming.map((logo) => ({ kind: "existing" as const, id: logo.id, logo, name: logo.name, preview: "" })),
      ];
    });
    const previewMap: Record<string, string> = {};
    await Promise.all(
      logos.map(async (logo) => {
        try {
          const blob = await api.getLogoThumbnail(logo.id);
          previewMap[logo.id] = URL.createObjectURL(blob);
        } catch {
          // thumbnail unavailable; leave blank
        }
      })
    );
    setSelectedLogos((prev) =>
      prev.map((l) => (l.kind === "existing" && previewMap[l.logo.id] ? { ...l, preview: previewMap[l.logo.id] } : l))
    );
  }, []);

  const removeSelected = useCallback((id: string) => {
    setSelectedLogos((prev) => {
      const target = prev.find((l) => l.id === id);
      if (target && target.kind === "file") URL.revokeObjectURL(target.preview);
      return prev.filter((l) => l.id !== id);
    });
  }, []);

  const replaceWithSaved = useCallback(async (logo: Logo) => {
    setSelectedLogos((prev) => {
      prev.forEach((l) => {
        if (l.kind === "file") URL.revokeObjectURL(l.preview);
      });
      return [{ kind: "existing", id: logo.id, logo, name: logo.name, preview: "" }];
    });
    try {
      const blob = await api.getLogoThumbnail(logo.id);
      const url = URL.createObjectURL(blob);
      setSelectedLogos((prev) =>
        prev.map((l) => (l.kind === "existing" && l.logo.id === logo.id ? { ...l, preview: url } : l))
      );
    } catch {
      // thumbnail unavailable; leave blank
    }
  }, []);

  const handlePdfChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const pdfFiles = files.filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    setPdfs((prev) => {
      const existing = new Set(
        prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
      );
      const fresh = pdfFiles.filter(
        (f) => !existing.has(`${f.name}-${f.size}-${f.lastModified}`)
      );
      return [...prev, ...fresh];
    });
    if (e.target) e.target.value = "";
  }, []);

  const handlePdfRemove = useCallback((index: number) => {
    setPdfs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handlePageSelectionChange = useCallback((v: PageSelection) => {
    if (locked) return;
    setPageSelection(v);
    if (v.mode !== "all") {
      setPosStrategy("shared");
      setPositionMode("single");
      setStep((s) => Math.min(s, 3));
    }
  }, [locked]);

  const selectMode = useCallback((m: JobMode) => {
    setMode(m);
    setError(null);
  }, []);

  const isStepDone = useCallback(
    (id: number) => {
      if (id === 1) return mode === "multiple_pdfs" ? selectedLogos.length === 1 : selectedLogos.length >= 2;
      if (id === 2) return pdfs.length > 0;
      return mode === "multiple_pdfs"
        ? selectedLogos.length === 1 && pdfs.length > 0
        : selectedLogos.length >= 2 && pdfs.length > 0;
    },
    [mode, selectedLogos.length, pdfs.length]
  );

  const goNext = useCallback(() => {
    setError(null);
    if (step === 1 && mode === "multiple_pdfs" && selectedLogos.length !== 1) {
      setError("Selecione um logo para continuar.");
      return;
    }
    if (step === 1 && mode === "multiple_logos" && selectedLogos.length < 2) {
      setError("Adicione pelo menos dois logos para continuar.");
      return;
    }
    if (step === 2 && pdfs.length === 0) {
      setError(
        mode === "multiple_pdfs"
          ? "Adicione pelo menos um PDF para continuar."
          : "Adicione um PDF para continuar."
      );
      return;
    }
    const next = Math.min(step + 1, steps.length);
    setStep(next);
  }, [step, mode, selectedLogos.length, pdfs.length, steps.length]);

  const goBack = useCallback(() => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!mode) return;
    if (mode === "multiple_pdfs" && selectedLogos.length !== 1) return;
    if (mode === "multiple_logos" && (selectedLogos.length < 2 || pdfs.length !== 1)) {
      setError("Selecione pelo menos dois logos e exatamente um PDF.");
      return;
    }
    setLoading(true);
    try {
      const isAll = pageSelection.mode === "all";
      const effectivePositionMode: "single" | "first_rest" = locked
        ? positionMode
        : isAll
          ? positionMode
          : "single";
      const effectiveStrategy: "shared" | "individual" = locked
        ? posStrategy
        : isAll
          ? posStrategy
          : "shared";

      const position =
        locked && effectiveStrategy === "shared" && preset?.position
          ? preset.position
          : DEFAULT_POSITION;
      const positionRest =
        locked && effectiveStrategy === "shared" && effectivePositionMode === "first_rest"
          ? (preset?.position_rest ?? null)
          : null;

      const config: JobConfig = {
        page_selection: pageSelection,
        position,
        position_mode: effectivePositionMode,
        mode,
        pos_strategy: effectiveStrategy,
        ...(positionRest ? { position_rest: positionRest } : {}),
      };
      const logoFiles = selectedLogos.filter((l) => l.kind === "file").map((l) => (l.kind === "file" ? l.file : null)).filter((f): f is File => f !== null);
      const logoIds = selectedLogos.filter((l) => l.kind === "existing").map((l) => (l.kind === "existing" ? l.logo.id : null)).filter((id): id is string => id !== null);
      const job = await api.createJob({ logoFiles, logoIds, config });
      await api.uploadFiles(job.id, pdfs);

      if (effectiveStrategy === "individual") {
        router.push(`/arrange/${job.id}`);
      } else if (locked && preset?.position) {
        router.push(`/review/${job.id}`);
      } else {
        router.push(`/position/${job.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar o job");
      setLoading(false);
    }
  }, [mode, selectedLogos, pdfs, pageSelection, positionMode, posStrategy, locked, preset, router]);

  const goesToReview = locked && posStrategy === "shared" && Boolean(preset?.position);
  const effectiveStrategyForLabel: "shared" | "individual" = locked
    ? posStrategy
    : pageSelection.mode !== "all"
      ? "shared"
      : posStrategy;
  const submitLabel =
    effectiveStrategyForLabel === "individual"
      ? "Posicionar um por um"
      : goesToReview
        ? "Revisar & baixar"
        : "Posicionar logo";

  return {
    logoInputRef,
    logosInputRef,
    pdfInputRef,
    ACCEPTED_LOGO,
    mode,
    selectMode,
    step,
    steps,
    totalSteps: steps.length,
    selectedLogos,
    pdfs,
    pageSelection,
    positionMode,
    setPositionMode,
    posStrategy,
    setPosStrategy,
    locked,
    preset,
    submitLabel,
    error,
    loading,
    handleLogoChange,
    handleLogosChange,
    addSavedLogos,
    removeSelected,
    replaceWithSaved,
    handlePdfChange,
    handlePdfRemove,
    handlePageSelectionChange,
    isStepDone,
    goNext,
    goBack,
    handleSubmit,
  };
}
