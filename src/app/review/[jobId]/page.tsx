"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft as ArrowLeftIcon, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { api, type JobConfig, type ReviewFile } from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { AuthGuard } from "@/components/AuthGuard";
import { PdfReviewCard } from "./_components/PdfReviewCard";
import { SavePresetModal } from "./_components/SavePresetModal";

export default function ReviewPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId;

  const [files, setFiles] = useState<ReviewFile[]>([]);
  const [config, setConfig] = useState<JobConfig | null>(null);
  const [jobMode, setJobMode] = useState<string>("multiple_pdfs");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [manifest, job] = await Promise.all([
          api.getReviewManifest(jobId),
          api.getJob(jobId),
        ]);
        if (!active) return;
        setFiles(manifest.files);
        setConfig(job.config);
        setJobMode(job.config?.mode ?? manifest.mode ?? "multiple_pdfs");
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId]);

  const toggleExpanded = useCallback((index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleProceed = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    try {
      await api.process(jobId);
      router.push(`/download/${jobId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao processar");
      processingRef.current = false;
      setProcessing(false);
    }
  }, [jobId, router]);

  const summary = useMemo(() => {
    const totalPages = files.length;
    return {
      files: totalPages,
      modeLabel: jobMode === "multiple_logos" ? "Múltiplos logos" : "Múltiplos PDFs",
    };
  }, [files.length, jobMode]);

  return (
    <AuthGuard>
      <div className="flex min-h-dvh w-full flex-col bg-[#e4e4eb]">
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <h1 className="font-display text-lg font-semibold text-[#0e525b] sm:text-xl">
              Revisar &amp; baixar
            </h1>
            <p className="text-xs text-[#0e525b]/60">
              Confira o resultado final antes de gerar os arquivos
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#f7f7fa] px-3 py-2 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:bg-white hover:shadow-lg active:scale-[0.98]"
          >
            <ArrowLeftIcon className="h-4 w-4 text-[#2b9aa8]" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </header>

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6">
          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-lg shadow-[#0e525b]/5">
              <p className="font-medium text-[#0e525b]/70">Nenhum arquivo para revisar.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2b9aa8] sm:text-xs">
                    {summary.modeLabel} · {summary.files} arquivo(s)
                  </p>
                  <h2 className="font-display mt-1 text-2xl font-semibold text-[#0e525b] sm:text-3xl">
                    Resultado final
                  </h2>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f7f7fa] px-4 py-2.5 text-sm shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#2b9aa8]" />
                  <span className="font-medium text-[#0e525b]">
                    Clique para expandir cada arquivo
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {files.map((file) => (
                  <PdfReviewCard
                    key={file.index}
                    jobId={jobId}
                    file={file}
                    config={config}
                    expanded={expanded.has(file.index)}
                    onToggleExpanded={() => toggleExpanded(file.index)}
                  />
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-[#f7f7fa] p-5 shadow-xl shadow-[#0e525b]/5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2b9aa8]/15">
                    <Sparkles className="h-4 w-4 text-[#2b9aa8]" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0e525b]">
                      Tudo certo?
                    </p>
                    <p className="mt-0.5 text-xs text-[#0e525b]/70">
                      Os arquivos serão gerados exatamente como aparecem acima.
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
                    onClick={() => setModalOpen(true)}
                    disabled={processing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2b9aa8] px-4 py-3 text-base font-semibold text-white shadow-lg shadow-[#2b9aa8]/30 transition hover:bg-[#248a97] active:scale-[0.98] disabled:opacity-60"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        Baixar
                        <Sparkles className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>

        <SavePresetModal
          open={modalOpen && !loading}
          config={config}
          onProceed={handleProceed}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </AuthGuard>
  );
}
