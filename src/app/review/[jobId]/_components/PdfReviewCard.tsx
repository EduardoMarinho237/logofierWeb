"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Square,
  SquareCheck,
} from "lucide-react";
import { api, type JobConfig, type ReviewFile } from "@/lib/api";
import { getTargetPages } from "@/lib/targetPages";

const CHUNK = 12;

export function PdfReviewCard({
  jobId,
  file,
  config,
  expanded,
  onToggleExpanded,
}: {
  jobId: string;
  file: ReviewFile;
  config: JobConfig | null;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const router = useRouter();
  const [pageCount, setPageCount] = useState(0);
  const [targetSet, setTargetSet] = useState<Set<number>>(new Set());
  const [images, setImages] = useState<Record<number, string>>({});
  const [pageRatio, setPageRatio] = useState(595 / 842);
  const [thumbPage, setThumbPage] = useState(0);
  const [loadingThumb, setLoadingThumb] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [previewPage, setPreviewPage] = useState<number | null>(null);

  const customPages = useMemo(() => {
    const map = config?.file_page_positions?.[String(file.index)]?.page_positions;
    return map ? new Set(Object.keys(map).map(Number)) : new Set<number>();
  }, [config?.file_page_positions, file.index]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.getReviewPreview(jobId, file.index, [0]);
        if (!active) return;
        setPageCount(res.page_count);
        setPageRatio(res.width && res.height ? res.width / res.height : 595 / 842);
        const target = new Set(
          getTargetPages(res.page_count, config?.page_selection ?? { mode: "all" })
        );
        setTargetSet(target);
        const firstStamped = target.size ? [...target][0] : 0;
        const map: Record<number, string> = {};
        const p0 = res.pages.find((p) => p.page === 0);
        if (p0) map[0] = `data:image/png;base64,${p0.image_base64}`;
        if (firstStamped !== 0) {
          const r2 = await api.getReviewPreview(jobId, file.index, [firstStamped]);
          if (!active) return;
          const pp = r2.pages.find((x) => x.page === firstStamped);
          if (pp) map[firstStamped] = `data:image/png;base64,${pp.image_base64}`;
        }
        setImages(map);
        setThumbPage(firstStamped);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoadingThumb(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, file.index]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const chunk: number[] = [];
      for (let p = nextPage; p < pageCount && chunk.length < CHUNK; p++) {
        if (!(p in images)) chunk.push(p);
      }
      if (chunk.length === 0) {
        setLoadingMore(false);
        return;
      }
      const res = await api.getReviewPreview(jobId, file.index, chunk);
      setImages((prev) => {
        const map = { ...prev };
        for (const p of res.pages) map[p.page] = `data:image/png;base64,${p.image_base64}`;
        return map;
      });
      setNextPage(chunk[chunk.length - 1] + 1);
    } catch {
      // keep partial; sentinel will retry
    } finally {
      setLoadingMore(false);
    }
  }, [jobId, file.index, pageCount, nextPage, images, loadingMore]);

  useEffect(() => {
    if (!expanded) return;
    const el = document.getElementById(`sentinel-${file.index}`);
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [expanded, file.index, loadMore]);

  const togglePageSelection = useCallback(
    (page: number, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      setSelectedPages((prev) => {
        const next = new Set(prev);
        if (next.has(page)) next.delete(page);
        else next.add(page);
        return next;
      });
    },
    []
  );

  const handleAdjustPosition = useCallback(() => {
    if (selectedPages.size === 0) return;
    const pages = Array.from(selectedPages).sort((a, b) => a - b).join(",");
    router.push(`/position/${jobId}?file=${file.index}&pages=${pages}&returnTo=review`);
  }, [router, jobId, file.index, selectedPages]);

  const stampedCount = targetSet.size;
  const hasMore = nextPage < pageCount;
  const selectedCount = selectedPages.size;
  const previewImage = previewPage === null ? undefined : images[previewPage];

  const changePreviewPage = useCallback(
    async (nextPage: number) => {
      if (nextPage < 0 || nextPage >= pageCount) return;
      if (!images[nextPage]) {
        try {
          const response = await api.getReviewPreview(jobId, file.index, [nextPage]);
          const pageData = response.pages.find((item) => item.page === nextPage);
          if (pageData) {
            setImages((previous) => ({
              ...previous,
              [nextPage]: `data:image/png;base64,${pageData.image_base64}`,
            }));
          }
        } catch {
          return;
        }
      }
      setPreviewPage(nextPage);
    },
    [file.index, images, jobId, pageCount]
  );

  useEffect(() => {
    if (previewPage === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewPage(null);
      if (event.key === "ArrowLeft") void changePreviewPage(previewPage - 1);
      if (event.key === "ArrowRight") void changePreviewPage(previewPage + 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changePreviewPage, previewPage]);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-[#0e525b]/5">
      <button
        type="button"
        onClick={onToggleExpanded}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-[#f7f7fa] sm:p-5"
      >
        <div className="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#e4e4eb] shadow-inner">
          {loadingThumb ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#2b9aa8]" />
          ) : loadError || images[thumbPage] === undefined ? (
            <FileText className="h-6 w-6 text-[#0e525b]/40" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[thumbPage]}
              alt=""
              className="h-full w-full object-fill"
              style={{ aspectRatio: pageRatio }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0e525b]">{file.name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#0e525b]/60">
            <span>
              {pageCount} página{pageCount === 1 ? "" : "s"}
            </span>
            {stampedCount > 0 && (
              <span className="flex items-center gap-1 text-[#2b9aa8]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {stampedCount} com logo
              </span>
            )}
            {customPages.size > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <Settings2 className="h-3.5 w-3.5" />
                {customPages.size} ajustada{customPages.size === 1 ? "" : "s"}
              </span>
            )}
          </p>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-[#0e525b]/50" /> : <ChevronDown className="h-5 w-5 text-[#0e525b]/50" />}
      </button>

      {expanded && (
        <div className="border-t border-[#d0d0dc]/50 bg-[#f7f7fa] p-4 sm:p-5">
          {selectedCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm">
              <p className="text-sm font-medium text-[#0e525b]">
                {selectedCount} página{selectedCount === 1 ? "" : "s"} selecionada
                {selectedCount === 1 ? "" : "s"}
              </p>
              <button
                onClick={handleAdjustPosition}
                className="flex items-center gap-2 rounded-lg bg-[#2b9aa8] px-3 py-2 text-sm font-semibold text-white shadow-md shadow-[#2b9aa8]/25 transition hover:bg-[#248a97] active:scale-[0.98]"
              >
                <Settings2 className="h-4 w-4" />
                Ajustar posição
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: pageCount }).map((_, page) => {
              const url = images[page];
              const stamped = targetSet.has(page);
              const selected = selectedPages.has(page);
              const hasCustom = customPages.has(page);
              return (
                <div key={page} className="flex flex-col gap-1.5">
                  <div className="flex min-h-5 items-center justify-between gap-2 px-1">
                    {hasCustom ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                        <Settings2 className="h-3 w-3" />
                        Ajustada
                      </span>
                    ) : <span />}
                    {stamped && (
                      <span className="flex items-center gap-1 rounded-full bg-[#2b9aa8] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                        <CheckCircle2 className="h-3 w-3" />
                        Logo
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => url && setPreviewPage(page)}
                    className={`relative block w-full overflow-hidden rounded-lg bg-white shadow-md shadow-[#0e525b]/8 ${
                      selected ? "ring-2 ring-[#2b9aa8]" : ""
                    }`}
                    style={{ aspectRatio: pageRatio }}
                    aria-label={`Visualizar página ${page + 1}`}
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-fill"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#e4e4eb]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#2b9aa8]" />
                      </div>
                    )}
                  </button>
                  <div className="flex min-h-6 items-center justify-between gap-2 px-1">
                    <button
                      type="button"
                      onClick={(e) => togglePageSelection(page, e)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-[#0e525b] transition hover:bg-white"
                      aria-label={selected ? "Desselecionar página" : "Selecionar página"}
                    >
                      {selected ? (
                        <SquareCheck className="h-4 w-4 text-[#2b9aa8]" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <p className="text-center text-[11px] font-medium text-[#0e525b]/60">
                      Página {page + 1}
                    </p>
                    <span className="w-6" />
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div
              id={`sentinel-${file.index}`}
              className="flex items-center justify-center py-4"
            >
              {loadingMore && <Loader2 className="h-5 w-5 animate-spin text-[#2b9aa8]" />}
            </div>
          )}
        </div>
      )}

      {previewPage !== null && previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e525b]/75"
          role="dialog"
          aria-modal="true"
          aria-label={`Visualização ampliada da página ${previewPage + 1}`}
          onClick={() => setPreviewPage(null)}
        >
          <div className="flex h-full w-full items-center justify-center">
            {/* Controls are fixed to the viewport, never to the page image. */}
            <button
              type="button"
              onClick={() => setPreviewPage(null)}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-[#0e525b] shadow-md transition hover:bg-white sm:right-8 sm:top-8"
              aria-label="Fechar visualização"
            >
              ×
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void changePreviewPage(previewPage - 1);
              }}
              disabled={previewPage === 0}
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0e525b] shadow-md transition hover:bg-white disabled:invisible sm:left-8"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            {/* The image keeps its aspect ratio and has only a slight corner radius. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt={`Página ${previewPage + 1}`}
              onClick={(event) => event.stopPropagation()}
              className="h-[88vh] w-auto max-w-[88vw] rounded-md object-contain"
            />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void changePreviewPage(previewPage + 1);
              }}
              disabled={previewPage === pageCount - 1}
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0e525b] shadow-md transition hover:bg-white disabled:invisible sm:right-8"
              aria-label="Próxima página"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
