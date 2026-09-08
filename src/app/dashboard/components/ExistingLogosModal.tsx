"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCheck, Edit2, Loader2, Search, X, FolderOpen } from "lucide-react";
import { api, type Logo } from "@/lib/api";
import { useLogoThumbnails } from "@/hooks/useLogoThumbnails";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

type SelectionMode = "single" | "multiple";

interface ExistingLogosModalProps {
  open: boolean;
  onClose: () => void;
  mode: SelectionMode;
  onConfirm: (logos: Logo[]) => void;
  alreadySelectedIds?: string[];
}

const inputClass =
  "w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-[#0e525b]/5 outline-none transition focus:shadow-md focus:shadow-[#2b9aa8]/20";

export function ExistingLogosModal({
  open,
  onClose,
  mode,
  onConfirm,
  alreadySelectedIds = [],
}: ExistingLogosModalProps) {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbnails = useLogoThumbnails(logos);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      try {
        const data = await api.listLogos();
        if (active) setLogos(data);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar logos");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logos;
    return logos.filter((l) => l.name.toLowerCase().includes(q));
  }, [logos, query]);

  const selectedLogos = useMemo(
    () => logos.filter((l) => selectedIds.has(l.id)),
    [logos, selectedIds]
  );

  const toggle = useCallback(
    (logo: Logo) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (mode === "single") {
          return next.has(logo.id) ? new Set() : new Set([logo.id]);
        }
        if (next.has(logo.id)) next.delete(logo.id);
        else next.add(logo.id);
        return next;
      });
    },
    [mode]
  );

  const selectAll = useCallback(() => {
    const alreadyAdded = new Set(alreadySelectedIds);
    const selectable = filtered.filter((l) => !alreadyAdded.has(l.id));
    setSelectedIds(new Set(selectable.map((l) => l.id)));
  }, [filtered, alreadySelectedIds]);

  const startEdit = useCallback((logo: Logo) => {
    setEditingId(logo.id);
    setEditName(logo.name);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
  }, []);

  const saveEdit = useCallback(
    async (id: string) => {
      try {
        const updated = await api.renameLogo(id, editName);
        setLogos((prev) => prev.map((l) => (l.id === id ? updated : l)));
        setEditingId(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao renomear");
      }
    },
    [editName]
  );

  const confirm = useCallback(() => {
    if (selectedLogos.length === 0) return;
    setSaving(true);
    try {
      onConfirm(selectedLogos);
      onClose();
    } finally {
      setSaving(false);
    }
  }, [selectedLogos, onConfirm, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "single" ? "Escolher logo salvo" : "Adicionar logos salvos"}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2b9aa8]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome..."
            className={inputClass}
          />
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="max-h-[50vh] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#0e525b33_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#0e525b]/25">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#2b9aa8]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FolderOpen className="h-10 w-10 text-[#0e525b]/15" />
              <p className="text-sm text-[#0e525b]/60">
                {logos.length === 0
                  ? "Nenhum logo salvo ainda."
                  : "Nenhum logo encontrado para essa busca."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((logo) => {
                const isSelected = selectedIds.has(logo.id);
                const isAlreadyAdded = alreadySelectedIds.includes(logo.id) && !isSelected;
                return (
                  <div
                    key={logo.id}
                    role="button"
                    tabIndex={isAlreadyAdded ? -1 : 0}
                    aria-disabled={isAlreadyAdded}
                    onClick={() => toggle(logo)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(logo);
                      }
                    }}
                    className={`group flex flex-col overflow-hidden rounded-2xl text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-[#2b9aa8]/10 shadow-md shadow-[#2b9aa8]/10"
                        : "bg-white shadow-sm hover:shadow-md hover:shadow-[#0e525b]/8"
                    } ${isAlreadyAdded ? "pointer-events-none opacity-40" : "cursor-pointer"}`}
                  >
                    <div className="relative flex aspect-square items-center justify-center bg-white p-2">
                      {thumbnails[logo.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbnails[logo.id]}
                          alt={logo.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Loader2 className="h-6 w-6 animate-spin text-[#0e525b]/20" />
                      )}
                      {isSelected && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2b9aa8] text-white shadow-md shadow-[#2b9aa8]/30">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 p-2">
                      {editingId === logo.id ? (
                        <>
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="min-w-0 flex-1 rounded-lg bg-white px-2 py-1 text-xs shadow-inner shadow-[#0e525b]/5 outline-none focus:shadow-md focus:shadow-[#2b9aa8]/20"
                            maxLength={255}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEdit(logo.id);
                              }
                            }}
                          />
                          <IconButton
                            variant="ghost"
                            className="p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveEdit(logo.id);
                            }}
                            aria-label="Salvar nome"
                          >
                            <Check className="h-3.5 w-3.5 text-[#2b9aa8]" />
                          </IconButton>
                          <IconButton
                            variant="ghost"
                            className="p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEdit();
                            }}
                            aria-label="Cancelar edição"
                          >
                            <X className="h-3.5 w-3.5 text-[#0e525b]/50" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#0e525b]">
                            {logo.name}
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(logo);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.stopPropagation();
                                startEdit(logo);
                              }
                            }}
                            className="cursor-pointer rounded-lg p-1 text-[#0e525b]/40 transition hover:bg-[#0e525b]/5 hover:text-[#0e525b]"
                            aria-label="Renomear"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3">
            <p className="text-xs text-[#0e525b]/60">
              {selectedLogos.length > 0
                ? `${selectedLogos.length} selecionado(s)`
                : "Selecione os logos que deseja adicionar"}
            </p>
            {mode === "multiple" && filtered.length > 0 && (
              <Button variant="ghost" size="sm" onClick={selectAll} disabled={loading}>
                <CheckCheck className="h-4 w-4 text-[#2b9aa8]" />
                Selecionar todos
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={confirm}
              disabled={selectedLogos.length === 0 || saving}
              loading={saving}
            >
              {!saving && <Check className="h-4 w-4" />}
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
