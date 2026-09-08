"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { api, type Preset } from "@/lib/api";
import { DashboardHeader } from "../components/DashboardHeader";
import { StepIndicator } from "../components/StepIndicator";
import { LogoUpload } from "../components/LogoUpload";
import { PdfsUpload } from "../components/PdfsUpload";
import { PagesStep } from "../components/PagesStep";
import { PositioningStep } from "../components/PositioningStep";
import { WizardFooter } from "../components/WizardFooter";
import { useJobCreator, type JobMode } from "../hooks/useJobCreator";

const VALID_MODES: JobMode[] = ["multiple_pdfs", "multiple_logos"];

function Loading() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-[#e4e4eb]">
      <Loader2 className="h-10 w-10 animate-spin text-[#2b9aa8]" />
    </div>
  );
}

function NewJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const presetIdParam = searchParams.get("presetId");

  const [preset, setPreset] = useState<Preset | null>(null);
  const [loadingPreset, setLoadingPreset] = useState(Boolean(presetIdParam));

  const queryMode: JobMode | null =
    modeParam !== null && VALID_MODES.includes(modeParam as JobMode)
      ? (modeParam as JobMode)
      : null;

  useEffect(() => {
    if (!presetIdParam) return;
    let active = true;
    (async () => {
      try {
        const p = await api.getPreset(presetIdParam);
        if (active) setPreset(p);
      } catch {
        if (active) router.replace("/dashboard");
      } finally {
        if (active) setLoadingPreset(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [presetIdParam, router]);

  const mode: JobMode | null = preset
    ? (preset.mode as JobMode)
    : queryMode;

  useEffect(() => {
    if (!presetIdParam && !mode) router.replace("/dashboard");
    if (presetIdParam && !loadingPreset && !preset) {
      // redirect handled in fetch error path
    }
  }, [presetIdParam, mode, loadingPreset, preset, router]);

  if (loadingPreset) return <Loading />;
  if (!mode) return <Loading />;

  return (
    <AuthGuard>
      <NewJobWizard mode={mode} preset={preset} />
    </AuthGuard>
  );
}

export default function NewJobPage() {
  return (
    <Suspense fallback={<Loading />}>
      <NewJobContent />
    </Suspense>
  );
}

function NewJobWizard({ mode, preset }: { mode: JobMode; preset: Preset | null }) {
  const creator = useJobCreator(mode, preset);

  return (
    <div className="flex h-dvh w-full flex-col bg-[#e4e4eb]">
      <DashboardHeader />

      <StepIndicator
        steps={creator.steps}
        step={creator.step}
        isStepDone={creator.isStepDone}
      />

      <main className="flex w-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6">
          <div className="mb-4 sm:mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2b9aa8] sm:text-xs">
              Passo {creator.step} de {creator.steps.length}
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#0e525b] sm:text-3xl">
              {creator.steps[creator.step - 1].label}
            </h2>
          </div>

          <div className="flex flex-1 flex-col">
            {creator.step === 1 && (
              <LogoUpload
                mode={mode}
                selectedLogos={creator.selectedLogos}
                acceptedLogo={creator.ACCEPTED_LOGO}
                logoInputRef={creator.logoInputRef}
                logosInputRef={creator.logosInputRef}
                onLogoChange={creator.handleLogoChange}
                onLogosChange={creator.handleLogosChange}
                onRemove={creator.removeSelected}
                onAddSaved={creator.addSavedLogos}
                onReplaceSaved={creator.replaceWithSaved}
              />
            )}

            {creator.step === 2 && (
              <PdfsUpload
                mode={mode}
                pdfs={creator.pdfs}
                pdfInputRef={creator.pdfInputRef}
                onPdfChange={creator.handlePdfChange}
                removePdf={creator.handlePdfRemove}
              />
            )}

            {creator.step === 3 && (
              <PagesStep
                pageSelection={creator.pageSelection}
                onPageSelectionChange={creator.handlePageSelectionChange}
                locked={creator.locked}
              />
            )}

            {creator.step === 4 && !creator.locked && (
              <PositioningStep
                mode={mode}
                positionMode={creator.positionMode}
                setPositionMode={creator.setPositionMode}
                posStrategy={creator.posStrategy}
                setPosStrategy={creator.setPosStrategy}
              />
            )}
          </div>

          {creator.error && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {creator.error}
            </p>
          )}
        </div>

        <WizardFooter
          step={creator.step}
          totalSteps={creator.totalSteps}
          submitLabel={creator.submitLabel}
          loading={creator.loading}
          onBack={creator.goBack}
          onNext={creator.goNext}
          onSubmit={creator.handleSubmit}
        />
      </main>
    </div>
  );
}
