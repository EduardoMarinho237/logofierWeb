"use client";

import { Move } from "lucide-react";

export function ControlSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Move;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-[#f7f7fa] p-4 shadow-xl shadow-[#0e525b]/5 sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0e525b]">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2b9aa8]/15">
          <Icon className="h-3.5 w-3.5 text-[#2b9aa8]" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
