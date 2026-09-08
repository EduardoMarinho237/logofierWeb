"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Upload,
  Loader2,
  Trash2,
  Edit2,
  Check,
  X,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { api, type Logo } from "@/lib/api";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useLogoThumbnails } from "@/hooks/useLogoThumbnails";

const ACCEPTED_LOGO = "image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/bmp,image/tiff";

function LogoCard({
  logo,
  thumbnailUrl,
  editingId,
  editName,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  setEditName,
}: {
  logo: Logo;
  thumbnailUrl?: string;
  editingId: string | null;
  editName: string;
  onEdit: (logo: Logo) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onDelete: (logo: Logo) => void;
  setEditName: (v: string) => void;
}) {
  const isEditing = editingId === logo.id;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-[#f7f7fa] shadow-lg shadow-[#0e525b]/5 transition-shadow hover:shadow-xl hover:shadow-[#0e525b]/8">
      <div className="relative flex aspect-video items-center justify-center bg-white p-4">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={logo.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#0e525b]/20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 p-3 shadow-[0_1px_0_0_rgba(208,208,220,0.6)]">
        {isEditing ? (
          <div className="flex flex-1 items-center gap-1">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 rounded-xl bg-white px-2.5 py-1.5 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20"
              maxLength={255}
            />
            <IconButton variant="ghost" onClick={() => onSaveEdit(logo.id)}>
              <Check className="h-4 w-4 text-[#2b9aa8]" />
            </IconButton>
            <IconButton variant="ghost" onClick={onCancelEdit}>
              <X className="h-4 w-4 text-[#0e525b]/50" />
            </IconButton>
          </div>
        ) : (
          <>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#0e525b]">
              {logo.name}
            </p>
            <IconButton variant="ghost" onClick={() => onEdit(logo)} aria-label="Renomear">
              <Edit2 className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton variant="danger" onClick={() => onDelete(logo)} aria-label="Excluir">
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
}

function LogosManager() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Logo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbnailUrls = useLogoThumbnails(logos);

  const filteredLogos = logos.filter((logo) =>
    logo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        const data = await api.listLogos();
        if (active) setLogos(data);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchData();
    return () => { active = false; };
  }, []);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => api.createLogo(file))
      );
      setLogos((prev) => [...uploaded, ...prev]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar logo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const confirmDelete = useCallback((logo: Logo) => {
    setDeleteTarget(logo);
  }, []);

  async function executeDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteLogo(deleteTarget.id);
      setLogos((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  function startEdit(logo: Logo) {
    setEditingId(logo.id);
    setEditName(logo.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function saveEdit(id: string) {
    try {
      const updated = await api.renameLogo(id, editName);
      setLogos((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao renomear");
    }
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-[#e4e4eb] overflow-hidden">
      <PageHeader
        title="Meus logotipos"
        subtitle="Reutilize seus logotipos em novos processamentos"
      />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden px-4 py-5 sm:px-8 sm:py-6">
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-6 rounded-2xl bg-[#f7f7fa] p-6 text-center shadow-lg shadow-[#0e525b]/5">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_LOGO}
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button
            variant="primary"
            size="md"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Enviar novos logotipos
          </Button>
          <p className="mt-2 text-xs text-[#0e525b]/60">
            PNG, JPG, WebP, SVG, GIF, BMP, TIFF · máx. 5MB
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#2b9aa8]" />
          </div>
        ) : logos.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg shadow-[#0e525b]/5">
            <ImageIcon className="mx-auto mb-3 h-10 w-10 text-[#0e525b]/15" />
            <p className="text-[#0e525b]/70 font-medium">Nenhum logotipo salvo.</p>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0e525b]/40" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white py-2.5 pl-10 pr-4 text-sm text-[#0e525b] shadow-sm shadow-[#0e525b]/5 outline-none transition placeholder:text-[#0e525b]/30 focus:shadow-md focus:shadow-[#2b9aa8]/15 focus:ring-1 focus:ring-[#2b9aa8]/30"
              />
            </div>

            <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#0e525b20_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#0e525b]/20">
              {filteredLogos.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-lg shadow-[#0e525b]/5">
                  <Search className="mx-auto mb-3 h-10 w-10 text-[#0e525b]/15" />
                  <p className="text-[#0e525b]/70 font-medium">Nenhum resultado para &ldquo;{searchQuery}&rdquo;</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredLogos.map((logo) => (
                    <LogoCard
                      key={logo.id}
                      logo={logo}
                      thumbnailUrl={thumbnailUrls[logo.id]}
                      editingId={editingId}
                      editName={editName}
                      onEdit={startEdit}
                      onCancelEdit={cancelEdit}
                      onSaveEdit={saveEdit}
                      onDelete={confirmDelete}
                      setEditName={setEditName}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir logotipo?"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function LogosPage() {
  return (
    <AuthGuard>
      <LogosManager />
    </AuthGuard>
  );
}
