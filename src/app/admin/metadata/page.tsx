"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  FileText,
  CheckCircle2,
  HardDrive,
  Database,
  ImageIcon,
  FileArchive,
  Package,
  Layers,
  Trash2,
  UsersRound,
} from "lucide-react";
import { api, type AdminMetadata, type AdminStorageUsage } from "@/lib/api";
import { formatBytes } from "@/lib/format";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DonutChart, type DonutSlice } from "./DonutChart";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg shadow-[#0e525b]/5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b9aa8]/10">
          <Icon className="h-5 w-5 text-[#2b9aa8]" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-[#0e525b]">{value}</p>
      <p className="text-xs font-medium text-[#0e525b]/50">{label}</p>
      {sub && <p className="mt-1 text-xs text-[#0e525b]/40">{sub}</p>}
    </div>
  );
}

const STORAGE_ITEMS = [
  { key: "avatars", label: "Avatares", icon: ImageIcon, color: "#0e525b" },
  { key: "logos", label: "Logos", icon: Layers, color: "#2b9aa8" },
  { key: "pdfs", label: "PDFs de origem", icon: FileText, color: "#4ecdc4" },
  { key: "zips", label: "Resultados (ZIP)", icon: FileArchive, color: "#e8a838" },
  { key: "other", label: "Outros", icon: Package, color: "#8c5bbf" },
] as const;

type CategoryKey = keyof AdminStorageUsage;

function buildCategorySlices(data: AdminMetadata): DonutSlice[] {
  return STORAGE_ITEMS.map((item) => ({
    label: item.label,
    value: data.storage[item.key as CategoryKey],
    color: item.color,
  }));
}

function buildUserSlices(data: AdminMetadata): DonutSlice[] {
  const slices: DonutSlice[] = data.users.map((user, i) => ({
    label: user.name,
    value: user.storage_total,
    color: ["#0e525b", "#2b9aa8", "#4ecdc4", "#e8a838", "#8c5bbf", "#d96a4f", "#5f8ce0", "#7a9e6a"][
      i % 8
    ],
  }));
  if (data.orphans > 0) {
    slices.push({ label: "Órfãos", value: data.orphans, color: "#cbd5e1" });
  }
  return slices;
}

function DonutBlock({ data }: { data: AdminMetadata }) {
  const [view, setView] = useState<"category" | "user">("category");
  const slices = view === "category" ? buildCategorySlices(data) : buildUserSlices(data);
  const total = slices.reduce((s, x) => s + x.value, 0);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-lg shadow-[#0e525b]/5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-[#0e525b]">
          Distribuição do armazenamento
        </h2>
        <div className="flex rounded-xl bg-[#f7f7fa] p-1">
          <button
            type="button"
            onClick={() => setView("category")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              view === "category" ? "bg-white text-[#0e525b] shadow" : "text-[#0e525b]/50 hover:text-[#0e525b]"
            }`}
          >
            Categoria
          </button>
          <button
            type="button"
            onClick={() => setView("user")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              view === "user" ? "bg-white text-[#0e525b] shadow" : "text-[#0e525b]/50 hover:text-[#0e525b]"
            }`}
          >
            Usuário
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <DonutChart
          slices={slices}
          centerValue={formatBytes(total)}
          centerLabel="total"
        />
        <ul className="w-full min-w-0 space-y-2">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2.5 text-sm">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="truncate text-[#0e525b]/70">{s.label}</span>
              <span className="ml-auto shrink-0 text-xs font-semibold text-[#0e525b]">
                {formatBytes(s.value)}
              </span>
            </li>
          ))}
          {slices.length === 0 && (
            <li className="text-sm text-[#0e525b]/40">Sem dados para exibir.</li>
          )}
        </ul>
      </div>
    </section>
  );
}

function MetadataPage() {
  const [data, setData] = useState<AdminMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orphansOpen, setOrphansOpen] = useState(false);
  const [orphansBusy, setOrphansBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await api.getAdminMetadata();
        if (active) setData(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar metadados");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function removeOrphans() {
    setOrphansBusy(true);
    setError(null);
    try {
      await api.deleteOrphanFiles();
      const fresh = await api.getAdminMetadata();
      setData(fresh);
      setOrphansOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao remover arquivos órfãos");
    } finally {
      setOrphansBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#e4e4eb]">
      <PageHeader
        title="Metadados"
        subtitle="Visão geral do sistema e armazenamento"
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-8 sm:py-6">
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
            <Database className="mx-auto mb-3 h-10 w-10 text-[#0e525b]/15" />
            <p className="font-medium text-[#0e525b]/70">Sem dados disponíveis.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatCard
                icon={FileText}
                label="Processamentos"
                value={String(data.totals.processings)}
                sub={`${data.totals.processings_done} concluídos`}
              />
              <StatCard
                icon={CheckCircle2}
                label="PDFs gerados"
                value={String(data.totals.pdfs_generated)}
              />
              <StatCard
                icon={HardDrive}
                label="Armazenamento total"
                value={formatBytes(data.storage_total)}
              />
              <StatCard
                icon={Package}
                label="Arquivos órfãos"
                value={formatBytes(data.orphans)}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DonutBlock data={data} />

              <section className="rounded-2xl bg-white p-5 shadow-lg shadow-[#0e525b]/5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-base font-semibold text-[#0e525b]">
                    Armazenamento por categoria
                  </h2>
                  {data.orphans > 0 && (
                    <Button variant="danger" size="sm" onClick={() => setOrphansOpen(true)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Limpar órfãos ({formatBytes(data.orphans)})
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {STORAGE_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const bytes = data.storage[item.key as CategoryKey];
                    const pct = data.storage_total > 0 ? (bytes / data.storage_total) * 100 : 0;
                    return (
                      <div key={item.key} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 text-[#2b9aa8]" />
                        <span className="w-40 shrink-0 text-sm text-[#0e525b]/70">{item.label}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e4e4eb]">
                          <div
                            className="h-full rounded-full bg-[#2b9aa8] transition-all"
                            style={{ width: `${Math.max(pct, bytes > 0 ? 1 : 0)}%` }}
                          />
                        </div>
                        <span className="w-20 shrink-0 text-right text-xs font-semibold text-[#0e525b]">
                          {formatBytes(bytes)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="mt-1 flex items-center justify-between border-t border-[#e4e4eb] pt-3 text-sm font-semibold text-[#0e525b]">
                    <span>Total</span>
                    <span>{formatBytes(data.storage_total)}</span>
                  </div>
                </div>
              </section>
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-lg shadow-[#0e525b]/5">
              <div className="flex items-center justify-between px-5 py-4 sm:px-6">
                <h2 className="font-display text-base font-semibold text-[#0e525b]">
                  Uso por usuário
                </h2>
                <span className="text-xs text-[#0e525b]/50">{data.users.length} usuário(s)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-y border-[#e4e4eb] bg-[#f7f7fa] text-xs font-semibold uppercase tracking-wide text-[#0e525b]/50">
                      <th className="px-5 py-3 sm:px-6">Usuário</th>
                      <th className="px-4 py-3 text-right">Jobs</th>
                      <th className="px-4 py-3 text-right">Avatares</th>
                      <th className="px-4 py-3 text-right">Logos</th>
                      <th className="px-4 py-3 text-right">PDFs</th>
                      <th className="px-4 py-3 text-right">ZIPs</th>
                      <th className="px-5 py-3 text-right sm:px-6">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e4eb]">
                    {data.users.map((user) => (
                      <tr key={user.user_id} className="hover:bg-[#f7f7fa]">
                        <td className="px-5 py-3 sm:px-6">
                          <Link
                            href={`/admin/metadata/users/${user.user_id}`}
                            className="group inline-flex items-center gap-2"
                          >
                            <span className="rounded-lg bg-[#2b9aa8]/10 p-1.5 text-[#2b9aa8] transition group-hover:bg-[#2b9aa8]/20">
                              <UsersRound className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block font-semibold text-[#0e525b] group-hover:text-[#2b9aa8]">
                                {user.name}
                                {!user.is_active && (
                                  <span className="ml-1.5 text-xs font-normal text-red-500">(restrito)</span>
                                )}
                              </span>
                              <span className="block text-xs text-[#0e525b]/50">{user.email}</span>
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right text-[#0e525b]">{user.jobs_count}</td>
                        <td className="px-4 py-3 text-right text-[#0e525b]/70">{formatBytes(user.storage.avatars)}</td>
                        <td className="px-4 py-3 text-right text-[#0e525b]/70">{formatBytes(user.storage.logos)}</td>
                        <td className="px-4 py-3 text-right text-[#0e525b]/70">{formatBytes(user.storage.pdfs)}</td>
                        <td className="px-4 py-3 text-right text-[#0e525b]/70">{formatBytes(user.storage.zips)}</td>
                        <td className="px-5 py-3 text-right font-semibold text-[#0e525b] sm:px-6">
                          {formatBytes(user.storage_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      <ConfirmDialog
        open={orphansOpen}
        title="Remover arquivos órfãos?"
        description={`Serão excluídos permanentemente ${formatBytes(data?.orphans ?? 0)} em arquivos sem dono ativo. Essa ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="danger"
        loading={orphansBusy}
        onConfirm={removeOrphans}
        onCancel={() => setOrphansOpen(false)}
      />
    </div>
  );
}

export default function AdminMetadataRoute() {
  return (
    <AuthGuard requireAdmin>
      <MetadataPage />
    </AuthGuard>
  );
}