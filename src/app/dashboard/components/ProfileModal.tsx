"use client";

import { useRef, useState } from "react";
import { Camera, KeyRound, Mail, User as UserIcon } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
    setError(null);
    setDone(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (newPassword !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirm,
      });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha ao alterar a senha");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20";

  return (
    <Modal open={open} onClose={handleClose} title="Alterar senha" maxWidth="max-w-md">
      {done ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2b9aa8]/10">
            <KeyRound className="h-6 w-6 text-[#2b9aa8]" />
          </div>
          <p className="text-sm text-[#0e525b]">Senha alterada com sucesso.</p>
          <Button variant="primary" onClick={handleClose}>
            Concluir
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
            Senha atual
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Senha atual"
                className={inputClass}
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
            Nova senha
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className={inputClass}
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
            Confirmar nova senha
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repita a nova senha"
                className={inputClass}
              />
            </div>
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {!loading && <KeyRound className="h-4 w-4" />}
              Alterar senha
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const inputClass =
    "w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20";

  if (!user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.updateMe({ name: name.trim(), email: email.trim() });
      await refreshUser();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha ao salvar perfil");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(file: File) {
    setError(null);
    setUploadingAvatar(true);
    try {
      await api.uploadAvatar(file);
      await refreshUser();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar a foto");
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Meu perfil">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar src={user.avatar_url} name={user.name} size="lg" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label="Alterar foto"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#2b9aa8] text-white shadow-md shadow-[#2b9aa8]/30 transition hover:bg-[#248a97] active:scale-95 disabled:opacity-50"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarChange(file);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-[#0e525b]/50">Clique na câmera para trocar a foto</p>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[#0e525b]">
            Nome
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
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
                className={inputClass}
              />
            </div>
          </label>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setPasswordOpen(true)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#2b9aa8]" />
              Alterar senha
            </span>
          </Button>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
}
