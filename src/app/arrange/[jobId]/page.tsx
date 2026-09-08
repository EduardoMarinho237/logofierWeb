"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  CheckCircle2,
  Pencil,
  Settings2,
  Sparkles,
} from "lucide-react";
import { api, type LogoPositionConfig, type Position } from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { AuthGuard } from "@/components/AuthGuard";

type LogoData = {
  index: number;
  url: string;
  aspect: number;
  name: string;
};

export default function ArrangePage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId;

  const [logoCount, setLogoCount] = useState(0);
  const [logos, setLogos] = useState<LogoData[]>([]);
  const [pagePreview, setPagePreview] = useState<string | null>(null);
  const [pageW, setPageW] = useState(595);
  const [pageH, setPageH] = useState(842);
  const [config, setConfig] = useState<{
    position: Position;
    position_mode?: string;
    logo_positions?: Record<string, LogoPositionConfig>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;    (async () => {
      try {
        const [logosRes, job, preview] = await Promise.all([
          api.getLogos(jobId),
          api.getJob(jobId),
          api.getPreviewPage(jobId, 0),
        ]);
        if (!active) return;
        setLogoCount(logosRes.count);
        setConfig({
          position: job.config?.position ?? {
            x: 0,
            y: 0,
            width: 120,
            height: 120,
            page_width: preview.width || 595,
            page_height: preview.height || 842,
          },
          position_mode: job.config?.position_mode,
          logo_positions: job.config?.logo_positions,
        });
        setPagePreview(URL.createObjectURL(preview.blob));
        setPageW(preview.width || 595);
        setPageH(preview.height || 842);

        const items: LogoData[] = [];
        for (let i = 0; i < logosRes.count; i++) {
          const blob = await api.getLogoN(jobId, i);
          if (!active) return;
          const url = URL.createObjectURL(blob);
          const img = await loadImage(url);
          items.push({
            index: i,
            url,
            aspect: img ? img.naturalWidth / img.naturalHeight : 1,
            name: `Logo ${i + 1}`,
          });
        }
        if (!active) return;
        setLogos(items);
      } catch (err: unknown) {
        if (active)
          setError(err instanceof Error ? err.message : "Erro ao carregar os logos");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId]);

  function effectivePosition(index: number): Position | null {
    const lp = config?.logo_positions?.[String(index)];
    return lp?.position ?? config?.position ?? null;
  }

  async function handleProcess() {
    setError(null);
    router.push(`/review/${jobId}`);
  }

  const definedCount = logos.filter((_, i) => config?.logo_positions?.[String(i)]).length;
  const allDefined = logoCount > 0 && definedCount === logoCount;

  return (
    <AuthGuard>
      <div className="flex min-h-dvh w-full flex-col bg-[#e4e4eb]">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-display text-lg font-semibold text-[#0e525b] sm:text-xl">
              Posicionar cada logo
            </h1>
            <p className="text-xs text-[#0e525b]/60">
              Ajuste a posição de cada logo individualmente sobre o PDF
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#f7f7fa] px-3 py-2 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:bg-white hover:shadow-lg active:scale-[0.98]"
        >
          <ArrowLeftIcon className="h-4 w-4 text-[#2b9aa8]" />
          <span className="hidden sm:inline">Voltar</span>
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6">
        {/* Progress summary */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2b9aa8] sm:text-xs">
                Um por um · {logoCount} logo(s)
              </p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-[#0e525b] sm:text-3xl">
                Revise e ajuste cada logo
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#f7f7fa] px-4 py-2.5 text-sm shadow-sm">
              <CheckCircle2
                className={`h-4 w-4 ${allDefined ? "text-[#2b9aa8]" : "text-[#0e525b]/40"}`}
              />
              <span className="font-medium text-[#0e525b]">
                {definedCount} de {logoCount} definidos
              </span>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#d0d0dc]/60">
            <div
              className="h-full rounded-full bg-[#2b9aa8] transition-all duration-500"
              style={{
                width: logoCount > 0 ? `${Math.round((definedCount / logoCount) * 100)}%` : "0%",
              }}
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {logos.map((logo) => {
              const pos = effectivePosition(logo.index);
              const isDefined = !!config?.logo_positions?.[String(logo.index)];
              return (
                <div
                  key={logo.index}
                  className="flex flex-col overflow-hidden rounded-2xl bg-[#f7f7fa] shadow-xl shadow-[#0e525b]/5"
                >
                  <div className="relative flex-1 bg-white p-3">
                    {pos ? (
                      <LogoThumb
                        pageUrl={pagePreview}
                        logoUrl={logo.url}
                        pageW={pageW}
                        pageH={pageH}
                        position={pos}
                        aspect={logo.aspect}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#e4e4eb] text-sm text-[#0e525b]/50">
                        Carregando...
                      </div>
                    )}
                    <span
                      className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
                        isDefined
                          ? "bg-[#2b9aa8] text-white"
                          : "bg-[#e4e4eb] text-[#0e525b]/70"
                      }`}
                    >
                      {isDefined ? <CheckCircle2 className="h-3 w-3" /> : <Settings2 className="h-3 w-3" />}
                      {isDefined ? "Definido" : "Padrão"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-[#f7f7fa] px-4 py-3 shadow-[0_-1px_0_0_rgba(208,208,220,0.6)]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0e525b]">
                        {logo.name}
                      </p>
                      <p className="text-xs text-[#0e525b]/60">
                        {isDefined ? "Posição personalizada" : "Usando posição padrão"}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/position/${jobId}?logo=${logo.index}`)}
                      className="flex shrink-0 items-center gap-2 rounded-lg bg-[#2b9aa8] px-3 py-2 text-sm font-semibold text-white shadow-md shadow-[#2b9aa8]/25 transition hover:bg-[#248a97] active:scale-[0.98]"
                    >
                      <Pencil className="h-4 w-4" />
                      {isDefined ? "Editar" : "Posicionar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info + process footer */}
        <div className="mt-8 rounded-2xl bg-[#f7f7fa] p-5 shadow-xl shadow-[#0e525b]/5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2b9aa8]/15">
              <Sparkles className="h-4 w-4 text-[#2b9aa8]" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0e525b]">
                Pronto para gerar {logoCount} PDF(s)
              </p>
              <p className="mt-0.5 text-xs text-[#0e525b]/70">
                Cada logo será aplicado ao PDF em sua própria posição. Os logos sem
                posição personalizada usarão a posição padrão.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:bg-[#e4e4eb] hover:shadow-lg active:scale-[0.98]"
            >
              <ArrowLeftIcon className="h-4 w-4 text-[#2b9aa8]" />
              Voltar
            </button>
            <button
              onClick={handleProcess}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2b9aa8] px-4 py-3 text-base font-semibold text-white shadow-lg shadow-[#2b9aa8]/30 transition hover:bg-[#248a97] active:scale-[0.98]"
            >
              Revisar &amp; baixar
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}

function LogoThumb({
  pageUrl,
  logoUrl,
  pageW,
  pageH,
  position,
  aspect,
}: {
  pageUrl: string | null;
  logoUrl: string;
  pageW: number;
  pageH: number;
  position: Position;
  aspect: number;
}) {
  const w = Math.max(1, position.width);
  const h = w / aspect;
  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-xl bg-white shadow-lg shadow-[#0e525b]/8"
      style={{ aspectRatio: pageW / pageH }}
    >
      {pageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pageUrl} alt="" className="absolute inset-0 h-full w-full object-fill" />
      ) : (
        <div className="absolute inset-0 bg-[#e4e4eb]" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt=""
        className="absolute"
        style={{
          left: `${(position.x / pageW) * 100}%`,
          top: `${(position.y / pageH) * 100}%`,
          width: `${(w / pageW) * 100}%`,
          height: `${(h / pageH) * 100}%`,
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
