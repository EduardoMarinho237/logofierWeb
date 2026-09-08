"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type JobConfig, type PageSelection, type Position } from "@/lib/api";
import { clamp, loadImage } from "../utils";

const DEFAULT_POSITION: Position = {
  x: 0,
  y: 0,
  width: 120,
  height: 120,
  page_width: 595,
  page_height: 842,
};

export function usePositionEditor(jobId: string, logoIndex: number | null) {
  const router = useRouter();
  const isPerLogo = logoIndex !== null;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [pageW, setPageW] = useState(595);
  const [pageH, setPageH] = useState(842);
  const [logoAspect, setLogoAspect] = useState(1);
  const [logoCount, setLogoCount] = useState(0);
  const [pageSelection, setPageSelection] = useState<PageSelection>({
    mode: "all",
    first_count: 1,
    last_count: 1,
    specific_pages: [],
  });
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [positionRest, setPositionRest] = useState<Position | null>(null);
  const [mode, setMode] = useState<"single" | "first_rest">("single");
  const [preserveAspect, setPreserveAspect] = useState(false);
  const [activeStep, setActiveStep] = useState<0 | 1>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activePosition = useMemo(() => {
    if (mode === "single") return position;
    return activeStep === 0 ? position : positionRest ?? position;
  }, [mode, activeStep, position, positionRest]);

  const setActivePosition = useCallback(
    (p: Position) => {
      if (mode === "single" || activeStep === 0) setPosition(p);
      else setPositionRest(p);
    },
    [mode, activeStep]
  );

  // Load job/logo data
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [logoBlob, job, count] = await Promise.all([
          isPerLogo && logoIndex !== null ? api.getLogoN(jobId, logoIndex) : api.getLogo(jobId),
          api.getJob(jobId),
          isPerLogo ? api.getLogos(jobId) : Promise.resolve({ count: 0, keys: [] }),
        ]);
        if (!active) return;

        setLogoCount(count.count);

        const jobMode = job.config?.position_mode === "first_rest" ? "first_rest" : "single";
        const logoImg = await loadImage(URL.createObjectURL(logoBlob));
        const aspect = logoImg ? logoImg.naturalWidth / logoImg.naturalHeight : 1;

        const perLogo =
          isPerLogo && logoIndex !== null
            ? job.config?.logo_positions?.[String(logoIndex)]
            : undefined;

        const basePos = perLogo?.position ?? job.config?.position;
        const savedW = basePos?.width;
        const pw = basePos?.page_width || job.config?.position?.page_width || 595;
        const ph = basePos?.page_height || job.config?.position?.page_height || 842;
        const w = savedW && savedW > 0 ? savedW : pw * 0.2;

        setLogoAspect(aspect);
        setPageSelection((prev) => job.config?.page_selection ?? prev);
        setMode(jobMode);
        setPreserveAspect(job.config?.mode === "multiple_logos");

        const p1: Position = {
          x: basePos?.x ?? 0,
          y: basePos?.y ?? 0,
          width: w,
          height: job.config?.mode === "multiple_logos" ? w / aspect : basePos?.height || w / aspect,
          page_width: pw,
          page_height: ph,
        };
        setPosition(p1);

        if (jobMode === "first_rest" && (perLogo?.position_rest ?? job.config?.position_rest)) {
          const rest = perLogo?.position_rest ?? job.config?.position_rest;
          const rw = rest && rest.width > 0 ? rest.width : p1.width;
          setPositionRest({
            x: rest?.x ?? p1.x,
            y: rest?.y ?? p1.y,
            width: rw,
            height: job.config?.mode === "multiple_logos" ? rw / aspect : rest?.height || rw / aspect,
            page_width: rest?.page_width || pw,
            page_height: rest?.page_height || ph,
          });
        } else {
          setPositionRest(null);
        }

        setLogoUrl(URL.createObjectURL(logoBlob));
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar preview");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId, logoIndex, isPerLogo]);

  // Load preview page
  useEffect(() => {
    if (loading || !logoUrl) return;
    let active = true;
    (async () => {
      const pageIndex = mode === "first_rest" && activeStep === 1 ? 1 : 0;
      try {
        setError(null);
        const preview = await api.getPreviewPage(jobId, pageIndex);
        if (!active) return;
        setPageW(preview.width || 595);
        setPageH(preview.height || 842);
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(preview.blob);
        });
      } catch (err: unknown) {
        if (!active) return;
        if (pageIndex === 1) {
          try {
            const preview = await api.getPreviewPage(jobId, 0);
            if (!active) return;
            setPageW(preview.width || 595);
            setPageH(preview.height || 842);
            setPreviewUrl((old) => {
              if (old) URL.revokeObjectURL(old);
              return URL.createObjectURL(preview.blob);
            });
            return;
          } catch {
            /* ignore */
          }
        }
        setError(err instanceof Error ? err.message : "Erro ao carregar preview");
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId, loading, logoUrl, mode, activeStep]);

  const move = useCallback(
    (dx: number, dy: number) => {
      setActivePosition({
        ...activePosition,
        x: clamp(activePosition.x + dx, 0, Math.max(0, activePosition.page_width - activePosition.width)),
        y: clamp(activePosition.y + dy, 0, Math.max(0, activePosition.page_height - activePosition.height)),
      });
    },
    [activePosition, setActivePosition]
  );

  const centerHoriz = useCallback(() => {
    setActivePosition({
      ...activePosition,
      x: Math.max(0, (activePosition.page_width - activePosition.width) / 2),
    });
  }, [activePosition, setActivePosition]);

  const centerVert = useCallback(() => {
    setActivePosition({
      ...activePosition,
      y: Math.max(0, (activePosition.page_height - activePosition.height) / 2),
    });
  }, [activePosition, setActivePosition]);

  const centerBoth = useCallback(() => {
    setActivePosition({
      ...activePosition,
      x: Math.max(0, (activePosition.page_width - activePosition.width) / 2),
      y: Math.max(0, (activePosition.page_height - activePosition.height) / 2),
    });
  }, [activePosition, setActivePosition]);

  const setSize = useCallback(
    (w: number, h: number) => {
      const width = Math.max(10, w);
      setActivePosition({
        ...activePosition,
        width,
        height: preserveAspect ? width / logoAspect : Math.max(10, h),
      });
    },
    [activePosition, preserveAspect, logoAspect, setActivePosition]
  );

  const resetProportion = useCallback(() => {
    setActivePosition({
      ...activePosition,
      height: activePosition.width / logoAspect,
    });
  }, [activePosition, logoAspect, setActivePosition]);

  const switchStep = useCallback(
    (next: 0 | 1) => {
      if (next === 1 && !positionRest) {
        setPositionRest({ ...position });
      }
      setActiveStep(next);
    },
    [position, positionRest]
  );

  const saveCurrent = useCallback(async () => {
    if (isPerLogo && logoIndex !== null) {
      await api.updateLogoPosition(jobId, logoIndex, {
        position,
        ...(mode === "first_rest" && positionRest ? { position_rest: positionRest } : {}),
      });
    } else {
      const job = await api.getJob(jobId);
      const existing = job.config ?? {};
      const config: JobConfig = {
        ...existing,
        page_selection: pageSelection,
        position,
        position_mode: mode,
        ...(mode === "first_rest" && positionRest ? { position_rest: positionRest } : {}),
      };
      await api.updateConfig(jobId, config);
    }
  }, [isPerLogo, logoIndex, jobId, pageSelection, position, positionRest, mode]);

  const handleConfirm = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      await saveCurrent();
      if (isPerLogo) {
        router.push(`/arrange/${jobId}`);
      } else {
        router.push(`/review/${jobId}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
      setSaving(false);
    }
  }, [isPerLogo, jobId, router, saveCurrent]);

  const navigateToLogo = useCallback(
    async (next: number) => {
      if (next < 0 || next >= logoCount) return;
      setError(null);
      try {
        await saveCurrent();
        router.push(`/position/${jobId}?logo=${next}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao salvar");
      }
    },
    [jobId, logoCount, router, saveCurrent]
  );

  return {
    previewUrl,
    logoUrl,
    pageW,
    pageH,
    logoAspect,
    logoCount,
    mode,
    activeStep,
    activePosition,
    preserveAspect,
    error,
    loading,
    saving,
    isPerLogo,
    logoIndex,
    setActivePosition,
    move,
    centerHoriz,
    centerVert,
    centerBoth,
    setSize,
    resetProportion,
    switchStep,
    handleConfirm,
    navigateToLogo,
  };
}
