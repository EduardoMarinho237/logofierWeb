"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
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
  const [pageCount, setPageCount] = useState(0);
  const [targetSet, setTargetSet] = useState<Set<number>>(new Set());
  const [images, setImages] = useState<Record<number, string>>({});
  const [pageRatio, setPageRatio] = useState(595 / 842);
  const [thumbPage, setThumbPage] = useState(0);
  const [loadingThumb, setLoadingThumb] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(0);
  const [loadError, setLoadError] = useState(false);

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

  const stampedCount = targetSet.size;
  const hasMore = nextPage < pageCount;

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
          </p>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-[#0e525b]/50" /> : <ChevronDown className="h-5 w-5 text-[#0e525b]/50" />}
      </button>

      {expanded && (
        <div className="border-t border-[#d0d0dc]/50 bg-[#f7f7fa] p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: pageCount }).map((_, page) => {
              const url = images[page];
              const stamped = targetSet.has(page);
              return (
                <div key={page} className="flex flex-col gap-1.5">
                  <div
                    className="relative overflow-hidden rounded-lg bg-white shadow-md shadow-[#0e525b]/8"
                    style={{ aspectRatio: pageRatio }}
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="" loading="lazy" className="h-full w-full object-fill" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#e4e4eb]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#2b9aa8]" />
                      </div>
                    )}
                    {stamped && (
                      <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-[#2b9aa8] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                        <CheckCircle2 className="h-3 w-3" />
                        Logo
                      </span>
                    )}
                  </div>
                  <p className="text-center text-[11px] font-medium text-[#0e525b]/60">
                    Página {page + 1}
                  </p>
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
    </div>
  );
}
