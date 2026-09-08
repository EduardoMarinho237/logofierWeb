"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  RotateCcw,
  FileArchive,
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/layout/PageHeader";

function DownloadSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-7 px-4 py-10">
      <Skeleton className="h-20 w-20 rounded-3xl" />
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="w-full max-w-md rounded-3xl bg-[#f7f7fa] p-6 shadow-xl shadow-[#0e525b]/5">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="mx-auto mt-4 h-4 w-56" />
      </div>
      <Skeleton className="h-5 w-40" />
    </div>
  );
}

function ProgressCard({
  done,
  total,
  percent,
}: {
  done: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="w-full max-w-md rounded-3xl bg-[#f7f7fa] p-6 shadow-xl shadow-[#0e525b]/5">
      <div className="mb-3 flex items-center justify-between text-sm font-medium text-[#0e525b]">
        <span>
          {done} de {total} arquivos
        </span>
        <span className="text-[#2b9aa8]">{percent}%</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-[#d0d0dc]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2b9aa8] to-[#0e525b] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-[#0e525b]/60">
        <Loader2 className="h-4 w-4 animate-spin text-[#2b9aa8]" />
        Processando arquivos em segundo plano...
      </p>
    </div>
  );
}

function DownloadContent({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [ready, setReady] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const s = await api.status(jobId);
        if (!active) return;
        setReady(true);
        setTotal(s.total_files);
        setDone(s.processed_files);
        if (s.status === "done") {
          setFinished(true);
          stop();
        } else if (s.status === "failed") {
          setError(s.error_message ?? "Processamento falhou");
          stop();
        }
      } catch (err: unknown) {
        if (active) {
          setReady(true);
          setError(err instanceof Error ? err.message : "Erro ao verificar status");
        }
        stop();
      }
    }

    function stop() {
      if (pollRef.current) {
        window.clearTimeout(pollRef.current);
        pollRef.current = null;
      }
    }

    async function schedule() {
      if (!active) return;
      pollRef.current = window.setTimeout(async () => {
        await poll();
        if (active && !finished && !error) schedule();
      }, 2000);
    }

    poll();
    schedule();

    return () => {
      active = false;
      stop();
    };
  }, [jobId, finished, error]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await api.download(jobId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logofier_${jobId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao baixar");
    } finally {
      setDownloading(false);
    }
  }

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  if (!ready) return <DownloadSkeleton />;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-7 px-4 py-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-[#0e525b] sm:text-4xl">
          {error ? "Ops!" : finished ? "Pronto!" : "Processando..."}
        </h1>
        <p className="mt-2 text-sm text-[#0e525b]/70">
          {finished
            ? `Seus ${total} arquivos foram processados com o logo.`
            : error
              ? "Algo deu errado durante o processamento."
              : "Aguarde enquanto processamos seus arquivos."}
        </p>
      </div>

      {!finished && !error && <ProgressCard done={done} total={total} percent={percent} />}

      {error && (
        <p className="w-full max-w-md rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      {finished && (
        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2b9aa8] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#2b9aa8]/30 transition hover:bg-[#248a97] active:scale-[0.98] disabled:opacity-60"
          >
            {downloading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Baixando...
              </>
            ) : (
              <>
                <FileArchive className="h-5 w-5" />
                Baixar ZIP
              </>
            )}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#f7f7fa] px-6 py-4 text-base font-semibold text-[#0e525b] shadow-lg shadow-[#0e525b]/8 transition hover:bg-white hover:shadow-xl active:scale-[0.98]"
          >
            <RotateCcw className="h-5 w-5 text-[#2b9aa8]" />
            Novo processamento
          </button>
        </div>
      )}

      {!finished && !error && (
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium text-[#0e525b]/60 transition hover:text-[#2b9aa8]"
        >
          <RotateCcw className="h-4 w-4" />
          Voltar ao início
        </button>
      )}
    </div>
  );
}

export default function DownloadPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;

  return (
    <AuthGuard>
      <div className="flex min-h-dvh w-full flex-col bg-[#e4e4eb]">
        <PageHeader title="Download" />
        <main className="flex flex-1">
          <DownloadContent jobId={jobId} />
        </main>
      </div>
    </AuthGuard>
  );
}
