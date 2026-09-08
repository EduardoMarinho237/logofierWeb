"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FileText,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { api, type ProcessingListItem } from "@/lib/api";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

function statusInfo(status: string) {
  switch (status) {
    case "done":
      return { label: "Concluído", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" };
    case "processing":
      return { label: "Processando", icon: RefreshCw, color: "text-[#2b9aa8]", bg: "bg-[#2b9aa8]/10" };
    case "failed":
      return { label: "Erro", icon: XCircle, color: "text-red-500", bg: "bg-red-50" };
    default:
      return { label: status, icon: Clock, color: "text-[#0e525b]/50", bg: "bg-[#0e525b]/5" };
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function JobCard({ job, onDelete }: { job: ProcessingListItem; onDelete: (job: ProcessingListItem) => void }) {
  const router = useRouter();
  const info = statusInfo(job.status);
  const Icon = info.icon;
  const canDownload = job.status === "done";
  const isProcessing = job.status === "processing";

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-md shadow-[#0e525b]/5 transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div className="flex items-center gap-3 sm:flex-1">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${info.bg}`}>
          <Icon className={`h-5 w-5 ${info.color} ${isProcessing ? "animate-spin" : ""}`} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0e525b]">
            {job.display_label}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#0e525b]/50">
            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-medium ${info.bg} ${info.color}`}>
              {info.label}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {job.processed_files}/{job.total_files} arquivo(s)
            </span>
            <span>{formatDate(job.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {canDownload && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/download/${job.id}`)}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
        )}
        {job.is_expired && (
          <span className="text-xs text-[#0e525b]/40 italic">Expirado</span>
        )}
        <IconButton
          variant="danger"
          onClick={() => onDelete(job)}
          aria-label="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}

function ProcessingsPage() {
  const [jobs, setJobs] = useState<ProcessingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProcessingListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await api.listJobs();
        if (active) setJobs(data.items);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar processamentos");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const confirmDelete = useCallback((job: ProcessingListItem) => {
    setDeleteTarget(job);
  }, []);

  async function executeDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteJob(deleteTarget.id);
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
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
        title="Processamentos"
        subtitle="Acompanhe seus jobs processados"
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
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg shadow-[#0e525b]/5">
            <FileText className="mx-auto mb-3 h-10 w-10 text-[#0e525b]/15" />
            <p className="text-[#0e525b]/70 font-medium">Nenhum processamento encontrado.</p>
            <p className="mt-1 text-xs text-[#0e525b]/50">
              Crie um novo job na dashboard para começar.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onDelete={confirmDelete} />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir processamento?"
        description={`Tem certeza que deseja excluir "${deleteTarget?.display_label}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function ProcessingsRoute() {
  return (
    <AuthGuard>
      <ProcessingsPage />
    </AuthGuard>
  );
}
