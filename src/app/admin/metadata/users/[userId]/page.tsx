"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  ImageIcon,
  Layers,
  FileText,
  FileArchive,
  HardDrive,
} from "lucide-react";
import { api, type AdminUserFile, type AdminUserFilesResponse } from "@/lib/api";
import { formatBytes } from "@/lib/format";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { IconButton } from "@/components/ui/IconButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AdminUserAvatar } from "@/app/admin/components/AdminUserAvatar";

const CATEGORY_LABELS: Record<string, string> = {
  avatars: "Avatar",
  logos: "Logo",
  pdfs: "PDF",
  zips: "ZIP",
};

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  avatars: ImageIcon,
  logos: Layers,
  pdfs: FileText,
  zips: FileArchive,
};

function isJobArtifact(file: AdminUserFile): boolean {
  return (
    file.category === "pdfs" ||
    file.category === "zips" ||
    (file.category === "logos" && file.label.includes("de processamento"))
  );
}

function deleteDescription(file: AdminUserFile): string {
  if (isJobArtifact(file)) {
    return `Este arquivo pertence a um processamento. Ao excluí-lo, todo o processamento será removido (logos, PDFs de origem e ZIP de resultado).`;
  }
  if (file.category === "avatars") {
    return "O avatar do usuário será removido.";
  }
  return "A logo da biblioteca do usuário será removida.";
}

function UserFilesPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const [data, setData] = useState<AdminUserFilesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserFile | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await api.getUserFiles(userId);
        if (active) setData(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar arquivos");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [userId]);

  async function executeDelete() {
    if (!deleteTarget) return;
    setBusyKey(deleteTarget.key);
    setError(null);
    try {
      await api.deleteUserFile(userId, deleteTarget.key);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          files: prev.files.filter((f) => f.key !== deleteTarget.key),
          total_bytes: prev.total_bytes - deleteTarget.size,
        };
      });
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir arquivo");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#e4e4eb]">
      <PageHeader
        title="Arquivos do usuário"
        subtitle="Explorar armazenamento e excluir arquivos"
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:px-8 sm:py-6">
        <Link
          href="/admin/metadata"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#0e525b]/60 transition hover:text-[#0e525b]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Metadados
        </Link>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#2b9aa8]" />
          </div>
        ) : !data ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg shadow-[#0e525b]/5">
            <p className="font-medium text-[#0e525b]/70">Usuário não encontrado.</p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-[#0e525b]/5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <AdminUserAvatar user={data.user} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-[#0e525b]">{data.user.name}</p>
                  <p className="truncate text-sm text-[#0e525b]/50">{data.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-[#f7f7fa] px-4 py-2.5">
                <HardDrive className="h-4 w-4 text-[#2b9aa8]" />
                <span className="text-sm text-[#0e525b]/60">Armazenamento</span>
                <span className="text-sm font-bold text-[#0e525b]">{formatBytes(data.total_bytes)}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-[#0e525b]/5">
              <div className="hidden grid-cols-12 gap-4 border-b border-[#e4e4eb] bg-[#f7f7fa] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#0e525b]/50 md:grid">
                <div className="col-span-6">Arquivo</div>
                <div className="col-span-2">Categoria</div>
                <div className="col-span-2 text-right">Tamanho</div>
                <div className="col-span-2 text-right">Ações</div>
              </div>

              <ul className="divide-y divide-[#e4e4eb]">
                {data.files.map((file) => {
                  const Icon = CATEGORY_ICONS[file.category] ?? FileText;
                  return (
                    <li
                      key={file.key}
                      className="flex flex-col gap-2 px-5 py-4 transition hover:bg-[#f7f7fa] md:grid md:grid-cols-12 md:items-center md:gap-4"
                    >
                      <div className="col-span-6 min-w-0">
                        <p className="truncate text-sm font-semibold text-[#0e525b]">{file.label}</p>
                        <p className="truncate font-mono text-xs text-[#0e525b]/40">{file.key}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#2b9aa8]/10 px-2 py-0.5 text-xs font-medium text-[#0e525b]">
                          <Icon className="h-3 w-3" />
                          {CATEGORY_LABELS[file.category] ?? file.category}
                        </span>
                      </div>
                      <div className="col-span-2 text-right text-xs text-[#0e525b]/70">
                        {formatBytes(file.size)}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <IconButton
                          variant="danger"
                          disabled={busyKey === file.key}
                          onClick={() => setDeleteTarget(file)}
                          aria-label="Excluir arquivo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {data.files.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-[#0e525b]/70">Nenhum arquivo encontrado.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir arquivo?"
        description={deleteTarget ? deleteDescription(deleteTarget) : undefined}
        confirmLabel="Excluir"
        variant="danger"
        loading={busyKey === deleteTarget?.key}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function AdminUserFilesRoute() {
  return (
    <AuthGuard requireAdmin>
      <UserFilesPage />
    </AuthGuard>
  );
}