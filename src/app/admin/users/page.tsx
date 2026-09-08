"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  UsersRound,
  Search,
  UserPlus,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  ShieldCheck,
  ShieldBan,
} from "lucide-react";
import { api, type User } from "@/lib/api";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuthStore } from "@/stores/authStore";
import { AdminUserAvatar } from "@/app/admin/components/AdminUserAvatar";
import { UserFormModal } from "./UserFormModal";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminUsersPage() {
  const me = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await api.listUsers();
        if (active) setUsers(data);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar usuários");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  async function toggleRestrict(user: User) {
    setBusyId(user.id);
    setError(null);
    try {
      const updated = await api.updateUser(user.id, { is_active: !user.is_active });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar usuário");
    } finally {
      setBusyId(null);
    }
  }

  async function executeDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await api.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir usuário");
    } finally {
      setBusyId(null);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setFormOpen(true);
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#e4e4eb]">
      <PageHeader
        title="Administrar usuários"
        subtitle="Área restrita ao administrador"
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-8 sm:py-6">
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0e525b]/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou e-mail"
              className="w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
            />
          </div>
          <Button variant="primary" size="md" onClick={openCreate}>
            <UserPlus className="h-4 w-4" />
            Novo usuário
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#2b9aa8]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg shadow-[#0e525b]/5">
            <UsersRound className="mx-auto mb-3 h-10 w-10 text-[#0e525b]/15" />
            <p className="font-medium text-[#0e525b]/70">
              {query ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-[#0e525b]/5">
            <div className="hidden grid-cols-12 gap-4 border-b border-[#e4e4eb] bg-[#f7f7fa] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#0e525b]/50 md:grid">
              <div className="col-span-4">Usuário</div>
              <div className="col-span-4">Status</div>
              <div className="col-span-2">Criado em</div>
              <div className="col-span-2 text-right">Ações</div>
            </div>

            <ul className="divide-y divide-[#e4e4eb]">
              {filtered.map((user) => {
                const isSelf = user.id === me?.id;
                const restricted = !user.is_active;
                return (
                  <li
                    key={user.id}
                    className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#f7f7fa] md:grid md:grid-cols-12 md:items-center md:gap-4"
                  >
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <AdminUserAvatar user={user} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#0e525b]">
                          {user.name}
                          {isSelf && <span className="ml-1.5 text-xs font-normal text-[#0e525b]/40">(você)</span>}
                        </p>
                        <p className="truncate text-xs text-[#0e525b]/50">{user.email}</p>
                      </div>
                    </div>

                    <div className="col-span-4 flex flex-wrap items-center gap-1.5">
                      {user.role === "admin" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#0e525b]/10 px-2 py-0.5 text-xs font-medium text-[#0e525b]">
                          <ShieldCheck className="h-3 w-3" />
                          Admin
                        </span>
                      )}
                      {restricted ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          <ShieldBan className="h-3 w-3" />
                          Restrito
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Ativo
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 text-xs text-[#0e525b]/50">
                      {formatDate(user.created_at)}
                    </div>

                    <div className="col-span-2 flex items-center gap-1.5 md:justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSelf || busyId === user.id}
                        loading={busyId === user.id}
                        onClick={() => toggleRestrict(user)}
                        className={restricted ? "text-emerald-600 hover:text-emerald-700" : "text-[#0e525b]/70 hover:text-red-600"}
                      >
                        {restricted ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Reativar
                          </>
                        ) : (
                          <>
                            <Ban className="h-3.5 w-3.5" />
                            Restringir
                          </>
                        )}
                      </Button>
                      <IconButton
                        variant="ghost"
                        onClick={() => openEdit(user)}
                        aria-label="Editar"
                        className="hidden sm:inline-flex"
                      >
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        variant="danger"
                        disabled={isSelf || busyId === user.id}
                        onClick={() => setDeleteTarget(user)}
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>

      {formOpen && (
        <UserFormModal
          open
          user={editing}
          onClose={() => setFormOpen(false)}
          onSaved={(updated) => {
            setUsers((prev) => {
              const exists = prev.some((u) => u.id === updated.id);
              return exists
                ? prev.map((u) => (u.id === updated.id ? updated : u))
                : [updated, ...prev];
            });
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir usuário?"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={busyId === deleteTarget?.id}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function AdminUsersRoute() {
  return (
    <AuthGuard requireAdmin>
      <AdminUsersPage />
    </AuthGuard>
  );
}