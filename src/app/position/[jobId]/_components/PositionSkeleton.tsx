"use client";

import { Skeleton } from "@/components/Skeleton";

export function PositionSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6 lg:flex-row">
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#f7f7fa] p-4 shadow-xl shadow-[#0e525b]/5">
        <Skeleton className="h-full min-h-[320px] w-full" />
      </div>
      <div className="flex shrink-0 flex-col gap-3 lg:w-72">
        <div className="rounded-2xl bg-[#f7f7fa] p-4 shadow-xl shadow-[#0e525b]/5">
          <Skeleton className="mb-3 h-4 w-20" />
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-[#f7f7fa] p-4 shadow-xl shadow-[#0e525b]/5">
          <Skeleton className="mb-3 h-4 w-28" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="rounded-2xl bg-[#f7f7fa] p-4 shadow-xl shadow-[#0e525b]/5">
          <Skeleton className="mb-3 h-4 w-32" />
          <Skeleton className="mb-2 h-4 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="rounded-2xl bg-[#f7f7fa] p-4 shadow-xl shadow-[#0e525b]/5">
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-full" />
        </div>
        <Skeleton className="mt-1 h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}
