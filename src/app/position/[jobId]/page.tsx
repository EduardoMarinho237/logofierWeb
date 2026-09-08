"use client";

import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AuthGuard } from "@/components/AuthGuard";
import { usePositionEditor } from "./_hooks/usePositionEditor";
import { PageHeader } from "@/components/layout/PageHeader";
import { PositionSkeleton } from "./_components/PositionSkeleton";
import { PositionError } from "./_components/PositionError";
import { StepTabs } from "./_components/StepTabs";
import { PositionControls } from "./_components/PositionControls";
import { PositionActions } from "./_components/PositionActions";

const PositionEditor = dynamic(() => import("@/components/PositionEditor"), {
  ssr: false,
});

export default function PositionPage() {
  const params = useParams<{ jobId: string }>();
  const searchParams = useSearchParams();
  const jobId = params.jobId;
  const logoParam = searchParams.get("logo");
  const logoIndex =
    logoParam !== null && !Number.isNaN(Number(logoParam)) ? Number(logoParam) : null;

  const editor = usePositionEditor(jobId, logoIndex);

  const headerTitle = editor.isPerLogo
    ? `Posicionar logo ${editor.logoIndex !== null ? editor.logoIndex + 1 : ""}${
        editor.logoCount > 0 ? ` de ${editor.logoCount}` : ""
      }`
    : "Posicionar logo";

  const headerSubtitle =
    editor.mode === "first_rest"
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
              <StepTabs
                mode={editor.mode}
                activeStep={editor.activeStep}
                onChange={editor.switchStep}
              />
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
                />
              </div>
              {editor.error && (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {editor.error}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-3 overflow-y-auto pb-2 lg:w-72">
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
              />
              <PositionActions
                mode={editor.mode}
                activeStep={editor.activeStep}
                isPerLogo={editor.isPerLogo}
                saving={editor.saving}
                logoIndex={editor.logoIndex}
                logoCount={editor.logoCount}
                onSwitchStep={editor.switchStep}
                onNavigateLogo={editor.navigateToLogo}
                onConfirm={editor.handleConfirm}
              />
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
