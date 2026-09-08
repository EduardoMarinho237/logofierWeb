"use client";

import { useRouter } from "next/navigation";

export function PositionError({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{message}</p>
      <button
        onClick={() => router.push("/dashboard")}
        className="rounded-xl bg-[#f7f7fa] px-4 py-2 text-sm font-medium text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition hover:bg-white hover:shadow-lg"
      >
        Voltar ao início
      </button>
    </div>
  );
}
