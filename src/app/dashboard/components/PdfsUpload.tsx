"use client";

import { Upload, FileText, X, Plus } from "lucide-react";
import type { JobMode } from "../hooks/useJobCreator";

export function PdfsUpload({
  mode,
  pdfs,
  pdfInputRef,
  onPdfChange,
  removePdf,
}: {
  mode: JobMode;
  pdfs: File[];
  pdfInputRef: React.RefObject<HTMLInputElement | null>;
  onPdfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePdf: (index: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="rounded-2xl bg-[#f7f7fa] p-5 shadow-xl shadow-[#0e525b]/5 sm:p-7">
        <button
          onClick={() => pdfInputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-2xl bg-white/60 py-8 shadow-lg shadow-[#0e525b]/5 transition-all duration-150 hover:bg-white hover:shadow-xl hover:shadow-[#0e525b]/8 sm:py-10"
        >
          <Upload className="h-9 w-9 text-[#2b9aa8] sm:h-11 sm:w-11" />
          <span className="text-sm font-medium text-[#0e525b] sm:text-base">
            {mode === "multiple_pdfs"
              ? "Clique para adicionar vários PDFs"
              : "Clique para adicionar o PDF"}
          </span>
          <span className="text-xs text-[#0e525b]/50">
            {mode === "multiple_pdfs"
              ? "Selecione todos os PDFs que devem receber o logo"
              : "Selecione o único PDF que receberá todos os logos"}
          </span>
        </button>
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          multiple={mode === "multiple_pdfs"}
          onChange={onPdfChange}
          className="hidden"
        />
        {pdfs.length > 0 && (
          <ul className="mt-4 flex max-h-52 flex-col gap-2 overflow-y-auto pr-1">
            {pdfs.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm shadow-md shadow-[#0e525b]/5"
              >
                <FileText className="h-4 w-4 shrink-0 text-[#2b9aa8]" />
                <span className="truncate text-[#0e525b]">{f.name}</span>
                <button
                  onClick={() => removePdf(i)}
                  className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[#0e525b]/50 transition hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remover ${f.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#2b9aa8]">
          <Plus className="h-3.5 w-3.5" />
          {pdfs.length} arquivo(s) selecionado(s)
        </p>
      </div>
    </div>
  );
}
