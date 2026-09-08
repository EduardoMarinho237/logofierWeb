"use client";

import { useState } from "react";
import { ImageIcon, Upload, X, CheckCircle2, Plus, FolderOpen } from "lucide-react";
import type { Logo } from "@/lib/api";
import type { JobMode, SelectedLogo } from "../hooks/useJobCreator";
import { ExistingLogosModal } from "./ExistingLogosModal";

interface LogoUploadProps {
  mode: JobMode;
  selectedLogos: SelectedLogo[];
  acceptedLogo: string;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  logosInputRef: React.RefObject<HTMLInputElement | null>;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogosChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
  onAddSaved: (logos: Logo[]) => void;
  onReplaceSaved: (logo: Logo) => void;
}

export function LogoUpload({
  mode,
  selectedLogos,
  acceptedLogo,
  logoInputRef,
  logosInputRef,
  onLogoChange,
  onLogosChange,
  onRemove,
  onAddSaved,
  onReplaceSaved,
}: LogoUploadProps) {
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const current = selectedLogos[0];

  return (
    <>
      <div className="flex flex-1 flex-col justify-center">
        <div className="rounded-2xl bg-[#f7f7fa] p-5 shadow-xl shadow-[#0e525b]/5 sm:p-7">
          {mode === "multiple_pdfs" ? (
            <>
              <button
                onClick={() => logoInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl bg-white/60 py-10 shadow-lg shadow-[#0e525b]/5 transition-all duration-150 hover:bg-white hover:shadow-xl hover:shadow-[#0e525b]/8 sm:py-14"
              >
                {current && current.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.preview}
                    alt={current.name}
                    className="h-24 w-24 rounded-xl bg-white object-contain p-1.5 shadow-md shadow-[#0e525b]/8 sm:h-32 sm:w-32"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#e4e4eb] text-[#0e525b]/50 shadow-inner sm:h-32 sm:w-32">
                    <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12" />
                  </div>
                )}
                <span className="text-sm font-medium text-[#0e525b] sm:text-base">
                  {current ? current.name : "Clique para selecionar o logotipo"}
                </span>
                <span className="text-xs text-[#0e525b]/60">PNG, JPG, SVG, WEBP, GIF, BMP, TIFF</span>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept={acceptedLogo}
                onChange={onLogoChange}
                className="hidden"
              />
              {current && (
                <p className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#2b9aa8]/10 px-4 py-2.5 text-sm font-medium text-[#0e525b] shadow-sm shadow-[#2b9aa8]/10">
                  <CheckCircle2 className="h-4 w-4 text-[#2b9aa8]" />
                  Logotipo selecionado com sucesso
                </p>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => logosInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl bg-white/60 py-10 shadow-lg shadow-[#0e525b]/5 transition-all duration-150 hover:bg-white hover:shadow-xl hover:shadow-[#0e525b]/8 sm:py-12"
              >
                <Upload className="h-9 w-9 text-[#2b9aa8] sm:h-11 sm:w-11" />
                <span className="text-sm font-medium text-[#0e525b] sm:text-base">
                  Clique para adicionar vários logos
                </span>
                <span className="text-xs text-[#0e525b]/50">
                  Selecione todos os logos. Um PDF será gerado para cada um.
                </span>
              </button>
              <input
                ref={logosInputRef}
                type="file"
                accept={acceptedLogo}
                multiple
                onChange={onLogosChange}
                className="hidden"
              />
            </>
          )}

          <button
            onClick={() => setSavedModalOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0e525b]/5 px-4 py-3 text-sm font-semibold text-[#0e525b] shadow-sm shadow-[#0e525b]/5 transition-all duration-150 hover:bg-[#0e525b]/10 hover:shadow-md hover:shadow-[#0e525b]/8 active:scale-[0.99]"
          >
            <FolderOpen className="h-4 w-4 text-[#2b9aa8]" />
            {mode === "multiple_pdfs" ? "Escolher dos meus logos" : "Adicionar dos meus logos"}
          </button>

          {selectedLogos.length > 0 && (
            <div className="mt-4 max-h-[18rem] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#0e525b33_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#0e525b]/25">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {selectedLogos.map((item) => (
                  <li
                    key={item.id}
                    className="relative flex flex-col items-center gap-1.5 rounded-xl bg-white p-2 pt-3 shadow-md shadow-[#0e525b]/5"
                  >
                    {item.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="h-24 w-full rounded-lg bg-white object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-24 w-full items-center justify-center rounded-lg bg-white">
                        <ImageIcon className="h-6 w-6 text-[#0e525b]/20" />
                      </div>
                    )}
                    <span className="w-full truncate text-center text-[10px] text-[#0e525b]/70">
                      {item.name}
                    </span>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md shadow-red-500/25 transition hover:bg-red-600 active:scale-90"
                      aria-label={`Remover ${item.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mode === "multiple_logos" && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#2b9aa8]">
              <Plus className="h-3.5 w-3.5" />
              {selectedLogos.length} logo(s) selecionado(s)
            </p>
          )}
        </div>
      </div>

      <ExistingLogosModal
        key={savedModalOpen ? "open" : "closed"}
        open={savedModalOpen}
        onClose={() => setSavedModalOpen(false)}
        mode={mode === "multiple_pdfs" ? "single" : "multiple"}
        alreadySelectedIds={selectedLogos
          .filter((l) => l.kind === "existing")
          .map((l) => (l.kind === "existing" ? l.logo.id : ""))}
        onConfirm={(logos) => {
          if (mode === "multiple_pdfs") {
            onReplaceSaved(logos[0]);
          } else {
            onAddSaved(logos);
          }
        }}
      />
    </>
  );
}
