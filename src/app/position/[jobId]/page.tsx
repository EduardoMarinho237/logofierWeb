"use client";

import { useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AuthGuard } from "@/components/AuthGuard";
import { usePositionEditor } from "./_hooks/usePositionEditor";
import { PageHeader } from "@/components/layout/PageHeader";
import { PositionSkeleton } from "./_components/PositionSkeleton";
import { PositionError } from "./_components/PositionError";
import { StepTabs } from "./_components/StepTabs";
import { PositionControls } from "./_components/PositionControls";
import { PositionActions } from "./_components/PositionActions";
import { LogoAxisControl } from "./_components/LogoAxisControl";

const PositionEditor = dynamic(() => import("@/components/PositionEditor"), {
  ssr: false,
});

export default function PositionPage() {
  const params = useParams<{ jobId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = params.jobId;

  const logoParam = searchParams.get("logo");
  const logoIndex =
    logoParam !== null && !Number.isNaN(Number(logoParam)) ? Number(logoParam) : null;

  const fileParam = searchParams.get("file");
  const fileIndex =
    fileParam !== null && !Number.isNaN(Number(fileParam)) ? Number(fileParam) : null;

  const pagesParam = searchParams.get("pages");
  const selectedPages = useMemo(
    () =>
      pagesParam && fileIndex !== null
        ? pagesParam
            .split(",")
            .map((p) => Number(p.trim()))
            .filter((p) => !Number.isNaN(p))
        : [],
    [pagesParam, fileIndex]
  );

  const returnTo = searchParams.get("returnTo");

  const editor = usePositionEditor(jobId, logoIndex, fileIndex, selectedPages, returnTo);

  const handleCancel = useCallback(() => {
    if (returnTo === "review") {
      router.push(`/review/${jobId}`);
    } else if (editor.isPerLogo) {
      router.push(`/arrange/${jobId}`);
    } else {
      router.push(`/review/${jobId}`);
    }
  }, [returnTo, editor.isPerLogo, router, jobId]);

  const headerTitle = editor.isPageEdit
    ? `Ajustar posição`
    : editor.isPerLogo
      ? `Posicionar logo ${editor.logoIndex !== null ? editor.logoIndex + 1 : ""}${
          editor.logoCount > 0 ? ` de ${editor.logoCount}` : ""
        }`
      : "Posicionar logo";

  const headerSubtitle = editor.isPageEdit
    ? selectedPages.length === 1
      ? `Página ${selectedPages[0] + 1} do arquivo ${fileIndex !== null ? fileIndex + 1 : ""}`
      : `${selectedPages.length} páginas selecionadas do arquivo ${fileIndex !== null ? fileIndex + 1 : ""}`
    : editor.mode === "first_rest"
      ? editor.activeStep === 0
        ? "Posicione a logo na 1ª página"
        : "Posicione a logo nas demais páginas"
      : "Arraste, redimensione e centralize o logo";

  return (
    <AuthGuard>
      <div className="flex h-dvh w-full flex-col bg-[#e4e4eb]">
        <PageHeader title={headerTitle} subtitle={headerSubtitle} />

        {editor.loading && <PositionSkeleton />}

        {editor.error && !editor.loading && (
          <PositionError message={editor.error} />
        )}

        {!editor.loading && editor.previewUrl && (
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:flex-row">
            <div className="flex min-h-0 flex-1 flex-col">
              {!editor.isPageEdit && (
                <StepTabs
                  mode={editor.mode}
                  activeStep={editor.activeStep}
                  onChange={editor.switchStep}
                />
              )}
              <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#f7f7fa] shadow-2xl shadow-[#0e525b]/10">
                <PositionEditor
                  previewImage={editor.previewUrl}
                  logoUrl={editor.logoUrl!}
                  pageWidthPoints={editor.pageW}
                  pageHeightPoints={editor.pageH}
                  position={editor.activePosition}
                  onChange={editor.setActivePosition}
                  onResetProportion={editor.resetProportion}
                  preserveAspect={editor.preserveAspect}
                  logoAxis={editor.activeLogoAxis}
                  isMultipleLogosShared={editor.isMultipleLogosShared}
                  allLogoAspects={editor.allLogoAspects}
                  placements={editor.activePlacements}
                  selectedPlacement={editor.selectedPlacement}
                  onSelectPlacement={editor.setSelectedPlacement}
                  onChangePlacement={editor.setActivePosition}
                />
              </div>
              {editor.error && (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {editor.error}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-3 overflow-y-auto pb-2 lg:w-72">
              {!editor.isPageEdit && (
                <div className="rounded-2xl bg-[#f7f7fa] p-4 shadow-xl shadow-[#0e525b]/5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#0e525b]">Logotipos na página</h2>
                    <span className="text-xs text-[#0e525b]/50">{editor.activePlacements.length}/3</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {editor.activePlacements.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => editor.setSelectedPlacement(index)}
                        className={`rounded-lg px-2 py-2 text-xs font-semibold ${editor.selectedPlacement === index ? "bg-[#2b9aa8] text-white" : "bg-white text-[#0e525b]"}`}
                      >
                        Logo {index + 1}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={editor.addPlacement} disabled={editor.activePlacements.length >= 3} className="flex-1 rounded-lg bg-[#0e525b] px-2 py-2 text-xs font-semibold text-white disabled:opacity-40">Adicionar</button>
                    <button type="button" onClick={editor.removePlacement} disabled={editor.activePlacements.length <= 1} className="rounded-lg bg-white px-2 py-2 text-xs font-semibold text-red-600 disabled:opacity-40">Remover</button>
                  </div>
                </div>
              )}
              <PositionControls
                activePosition={editor.activePosition}
                preserveAspect={editor.preserveAspect}
                logoAspect={editor.logoAspect}
                onMove={editor.move}
                onSetActivePosition={editor.setActivePosition}
                onCenterHoriz={editor.centerHoriz}
                onCenterVert={editor.centerVert}
                onCenterBoth={editor.centerBoth}
                onSetSize={editor.setSize}
                  onResetProportion={editor.resetProportion}
                  onTogglePreserveAspect={editor.togglePreserveAspect}
                />
              {!editor.isPageEdit && editor.preserveAspect && (
                <LogoAxisControl
                  value={editor.activeLogoAxis}
                  onChange={editor.setActiveLogoAxis}
                />
              )}
              <PositionActions
                mode={editor.mode}
                activeStep={editor.activeStep}
                isPerLogo={editor.isPerLogo}
                isPageEdit={editor.isPageEdit}
                saving={editor.saving}
                logoIndex={editor.logoIndex}
                logoCount={editor.logoCount}
                confirmLabel={editor.isPageEdit ? "Salvar ajuste" : undefined}
                onSwitchStep={editor.switchStep}
                onNavigateLogo={editor.navigateToLogo}
                onConfirm={editor.handleConfirm}
                onCancel={editor.isPageEdit ? handleCancel : undefined}
              />
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
