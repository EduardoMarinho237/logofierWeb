"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type JobConfig, type PageSelection, type Position } from "@/lib/api";
import { clamp, loadImage } from "../utils";
import type { LogoAxis } from "../_components/LogoAxisControl";

const DEFAULT_POSITION: Position = {
  x: 0,
  y: 0,
  width: 120,
  height: 120,
  page_width: 595,
  page_height: 842,
};

export function usePositionEditor(
  jobId: string,
  logoIndex: number | null,
  fileIndex: number | null = null,
  selectedPages: number[] = [],
  returnTo: string | null = null
) {
  const router = useRouter();
  const isPerLogo = logoIndex !== null;
  const isPageEdit = selectedPages.length > 0 && fileIndex !== null;

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
  const [jobModeType, setJobModeType] = useState<string>("multiple_pdfs");
  const [preserveAspect, setPreserveAspect] = useState(true);
  const [logoAxis, setLogoAxis] = useState<LogoAxis>("top_left");
  const [logoAxisRest, setLogoAxisRest] = useState<LogoAxis>("top_left");
  const [activeStep, setActiveStep] = useState<0 | 1>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allLogoAspects, setAllLogoAspects] = useState<number[]>([]);

  const isMultipleLogosShared = useMemo(
    () => !isPerLogo && !isPageEdit && jobModeType === "multiple_logos",
    [isPerLogo, isPageEdit, jobModeType]
  );

  const activePosition = useMemo(() => {
    if (mode === "single" || isPageEdit) return position;
    return activeStep === 0 ? position : positionRest ?? position;
  }, [mode, activeStep, position, positionRest, isPageEdit]);

  const activeLogoAxis = useMemo(() => {
    if (mode === "single" || isPageEdit) return logoAxis;
    return activeStep === 0 ? logoAxis : logoAxisRest;
  }, [mode, activeStep, logoAxis, logoAxisRest, isPageEdit]);

  const setActivePosition = useCallback(
    (p: Position) => {
      if (mode === "single" || activeStep === 0 || isPageEdit) setPosition(p);
      else setPositionRest(p);
    },
    [mode, activeStep, isPageEdit]
  );

  const setActiveLogoAxis = useCallback(
    (axis: LogoAxis) => {
      if (mode === "single" || activeStep === 0) setLogoAxis(axis);
      else setLogoAxisRest(axis);
    },
    [mode, activeStep]
  );

  // Resolve the effective position for a page, mirroring the backend rule.
  const resolvePagePosition = useCallback(
    (jobConfig: JobConfig | undefined, idx: number, page: number): Position => {
      const custom = jobConfig?.file_page_positions?.[String(idx)]?.page_positions?.[String(page)];
      if (custom) return custom;

      const jobMode = jobConfig?.position_mode === "first_rest" ? "first_rest" : "single";
      const base =
        jobMode === "first_rest" && page > 0 && jobConfig?.position_rest
          ? jobConfig.position_rest
          : jobConfig?.position;
      return base ?? DEFAULT_POSITION;
    },
    []
  );

  // Load job/logo data
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [job, count] = await Promise.all([
          api.getJob(jobId),
          isPerLogo && !isPageEdit ? api.getLogos(jobId) : Promise.resolve({ count: 0, keys: [] }),
        ]);
        if (!active) return;

        setLogoCount(count.count);

        const jobMode = job.config?.position_mode === "first_rest" ? "first_rest" : "single";
        const currentJobModeType = job.config?.mode ?? "multiple_pdfs";
        setJobModeType(currentJobModeType);

        // Determine which logo to load. In page-edit mode:
        // - multiple_logos: fileIndex points to the logo index.
        // - multiple_pdfs: the job has a single logo, so always load logo 0.
        let logoIndexToLoad: number | null = logoIndex;
        if (isPageEdit && fileIndex !== null) {
          logoIndexToLoad = currentJobModeType === "multiple_logos" ? fileIndex : 0;
        }

        const logoBlob =
          isPerLogo && logoIndexToLoad !== null
            ? await api.getLogoN(jobId, logoIndexToLoad)
            : await api.getLogo(jobId);
        if (!active) return;

        const logoImg = await loadImage(URL.createObjectURL(logoBlob));
        const aspect = logoImg ? logoImg.naturalWidth / logoImg.naturalHeight : 1;

        const perLogo =
          isPerLogo && logoIndex !== null && !isPageEdit
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
        setPreserveAspect(true);
        setLogoAxis((job.config?.logo_axis as LogoAxis) ?? "top_left");
        setLogoAxisRest((job.config?.logo_axis_rest as LogoAxis) ?? "top_left");

        let initialPosition: Position;
        if (isPageEdit && fileIndex !== null && selectedPages.length > 0) {
          const firstPage = selectedPages[0];
          const resolved = resolvePagePosition(job.config, fileIndex, firstPage);
          const rw = resolved.width && resolved.width > 0 ? resolved.width : pw * 0.2;
          initialPosition = {
            x: resolved.x ?? 0,
            y: resolved.y ?? 0,
            width: rw,
            height: resolved.height || rw / aspect,
            page_width: resolved.page_width || pw,
            page_height: resolved.page_height || ph,
          };
        } else {
          initialPosition = {
            x: basePos?.x ?? 0,
            y: basePos?.y ?? 0,
            width: w,
            height: basePos?.height || w / aspect,
            page_width: pw,
            page_height: ph,
          };
        }

        setPosition(initialPosition);

        if (jobMode === "first_rest" && (perLogo?.position_rest ?? job.config?.position_rest)) {
          const rest = perLogo?.position_rest ?? job.config?.position_rest;
          const rw = rest && rest.width > 0 ? rest.width : initialPosition.width;
          const restPos: Position = {
            x: rest?.x ?? initialPosition.x,
            y: rest?.y ?? initialPosition.y,
            width: rw,
            height: rest?.height || rw / aspect,
            page_width: rest?.page_width || pw,
            page_height: rest?.page_height || ph,
          };
          setPositionRest(restPos);
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
  }, [jobId, logoIndex, isPerLogo, isPageEdit, fileIndex, selectedPages, resolvePagePosition]);

  // Load aspect ratios of all logos for the dotted bounding box in multiple logos shared mode.
  useEffect(() => {
    if (!isMultipleLogosShared) return;
    let active = true;
    (async () => {
      try {
        const { count } = await api.getLogos(jobId);
        const aspects: number[] = [];
        for (let i = 0; i < count; i++) {
          const blob = await api.getLogoN(jobId, i);
          const img = await loadImage(URL.createObjectURL(blob));
          aspects.push(img && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1);
        }
        if (active) setAllLogoAspects(aspects);
      } catch {
        // ignore; bounding box will just use the current logo's aspect
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId, isMultipleLogosShared]);

  // Load preview page
  useEffect(() => {
    if (loading || !logoUrl) return;
    let active = true;
    (async () => {
      const pageIndex =
        isPageEdit && selectedPages.length > 0
          ? selectedPages[0]
          : mode === "first_rest" && activeStep === 1
            ? 1
            : 0;
      const previewFileIndex = isPageEdit && fileIndex !== null ? fileIndex : 0;
      try {
        setError(null);
        const preview = await api.getPreviewPage(jobId, pageIndex, previewFileIndex);
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
            const preview = await api.getPreviewPage(jobId, 0, previewFileIndex);
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
  }, [jobId, loading, logoUrl, mode, activeStep, isPageEdit, fileIndex, selectedPages]);

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

  const togglePreserveAspect = useCallback(
    (checked: boolean) => {
      setPreserveAspect(checked);
      if (checked) {
        if (mode === "single" || activeStep === 0 || isPageEdit) {
          setPosition((prev) => ({ ...prev, height: prev.width / logoAspect }));
        } else {
          setPositionRest((prev) =>
            prev ? { ...prev, height: prev.width / logoAspect } : prev
          );
        }
      }
    },
    [logoAspect, mode, activeStep, isPageEdit]
  );

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
    if (isPageEdit && fileIndex !== null) {
      const pagePositions: Record<string, Position> = {};
      for (const p of selectedPages) {
        pagePositions[String(p)] = position;
      }
      await api.updateFilePagePositions(jobId, fileIndex, pagePositions);
    } else if (isPerLogo && logoIndex !== null) {
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
        logo_axis: logoAxis,
        logo_axis_rest: logoAxisRest,
        ...(mode === "first_rest" && positionRest ? { position_rest: positionRest } : {}),
      };
      await api.updateConfig(jobId, config);
    }
  }, [
    isPageEdit,
    fileIndex,
    selectedPages,
    position,
    isPerLogo,
    logoIndex,
    jobId,
    pageSelection,
    positionRest,
    mode,
    logoAxis,
    logoAxisRest,
  ]);

  const handleConfirm = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      await saveCurrent();
      if (returnTo === "review") {
        router.push(`/review/${jobId}`);
      } else if (isPerLogo) {
        router.push(`/arrange/${jobId}`);
      } else {
        router.push(`/review/${jobId}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
      setSaving(false);
    }
  }, [isPerLogo, jobId, router, saveCurrent, returnTo]);

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
    logoAxis,
    activeLogoAxis,
    isPageEdit,
    isMultipleLogosShared,
    allLogoAspects,
    error,
    loading,
    saving,
    isPerLogo,
    logoIndex,
    setActivePosition,
    setActiveLogoAxis,
    move,
    centerHoriz,
    centerVert,
    centerBoth,
    setSize,
    resetProportion,
    togglePreserveAspect,
    switchStep,
    handleConfirm,
    navigateToLogo,
  };
}
