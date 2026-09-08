"use client";

import { useState } from "react";
import { KeyRound, Lock, Mail, User as UserIcon, UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api, type User } from "@/lib/api";

interface UserFormModalProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSaved: (user: User) => void;
}

export function UserFormModal({ open, user, onClose, onSaved }: UserFormModalProps) {
  const isEdit = !!user;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resettingPassword = isEdit ? passwordResetOpen : true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (resettingPassword) {
      if (password.length < 8) {
        setError("A senha deve ter pelo menos 8 caracteres");
        return;
      }
      if (password !== passwordConfirm) {
        setError("As senhas não coincidem");
        return;
      }
    }

    setLoading(true);
    try {
      if (isEdit && user) {
        const payload: { name: string; email: string; password?: string } = { name, email };
        if (resettingPassword) payload.password = password;
        const updated = await api.updateUser(user.id, payload);
        onSaved(updated);
      } else {
        const created = await api.createUser({ name, email, password });
        onSaved(created);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha ao salvar usuário");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar usuário" : "Novo usuário"}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
          Nome
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do usuário"
              className="w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
          Email
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
            />
          </div>
        </label>

        {isEdit ? (
          <div className="flex flex-col gap-3">
            {!passwordResetOpen ? (
              <button
                type="button"
                onClick={() => setPasswordResetOpen(true)}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#0e525b]/5 px-4 py-2 text-sm font-semibold text-[#0e525b] transition hover:bg-[#0e525b]/10"
              >
                <KeyRound className="h-4 w-4" />
                Trocar senha
              </button>
            ) : (
              <>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
                  Nova senha
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
                    <input
                      type="password"
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
                  Confirmar nova senha
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
                    <input
                      type="password"
                      minLength={8}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
                    />
                  </div>
                </label>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
              Senha
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
              Confirmar senha
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
                />
              </div>
            </label>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-1 flex gap-3">
          <Button type="button" variant="secondary" size="md" onClick={onClose} className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading} className="flex-1">
            {!loading && <UserPlus className="h-4 w-4" />}
            {isEdit ? "Salvar" : "Criar usuário"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}