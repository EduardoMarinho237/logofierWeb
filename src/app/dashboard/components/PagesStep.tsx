"use client";

import { Lock } from "lucide-react";
import { PageSelectionPanel } from "@/components/PageSelector";
import type { PageSelection } from "@/lib/api";

export function PagesStep({
  pageSelection,
  onPageSelectionChange,
  locked = false,
}: {
  pageSelection: PageSelection;
  onPageSelectionChange: (v: PageSelection) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center overflow-y-auto sm:overflow-visible">
      <div className="rounded-2xl bg-[#f7f7fa] p-5 shadow-xl shadow-[#0e525b]/5 sm:p-7">
        {locked && (
          <p className="mb-4 flex items-center gap-2 text-sm font-medium text-[#0e525b]/70">
            <Lock className="h-4 w-4 text-[#2b9aa8]" />
            Seleção de páginas definida pelo preset selecionado.
          </p>
        )}
        {!locked && (
          <p className="mb-4 text-sm text-[#0e525b]/70">
            Escolha em quais páginas o logo deve ser aplicado.
          </p>
        )}
        <div className={locked ? "pointer-events-none opacity-70" : ""}>
          <PageSelectionPanel value={pageSelection} onChange={onPageSelectionChange} />
        </div>
      </div>
    </div>
  );
}
