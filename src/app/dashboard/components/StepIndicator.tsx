"use client";

import type { Step } from "../hooks/useJobCreator";

export function StepIndicator({
  steps,
  step,
  isStepDone,
}: {
  steps: Step[];
  step: number;
  isStepDone: (id: number) => boolean;
}) {
  return (
    <nav className="mx-auto w-full max-w-2xl px-4 sm:px-8">
      <ol className="flex items-center justify-center gap-1 sm:gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = isStepDone(s.id);
          const active = s.id === step;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-1 sm:gap-2">
              <div
                className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-2xl px-2 py-1.5 text-left transition-all duration-200 select-none sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-2 ${
                  active
                    ? "bg-[#0e525b] text-white shadow-lg shadow-[#0e525b]/25"
                    : done
                      ? "bg-[#2b9aa8]/15 text-[#0e525b] shadow-sm"
                      : "bg-white/60 text-[#0e525b]/40 shadow-sm"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold sm:h-7 sm:w-7 ${
                    active
                      ? "bg-white/20 text-white"
                      : done
                        ? "bg-[#2b9aa8] text-white"
                        : "bg-[#e4e4eb] text-[#0e525b]/40"
                  }`}
                >
                  {done && !active ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.id
                  )}
                </span>
                <span className="hidden truncate text-xs font-medium sm:inline sm:text-sm">
                  {s.label}
                </span>
                <Icon
                  className={`ml-auto h-4 w-4 shrink-0 sm:hidden ${
                    active ? "text-white/80" : done ? "text-[#2b9aa8]" : "text-[#0e525b]/30"
                  }`}
                />
              </div>
              {i < steps.length - 1 && (
                <div className="h-px w-2 shrink-0 bg-[#d0d0dc] sm:w-4" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
