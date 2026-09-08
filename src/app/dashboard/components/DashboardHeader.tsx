"use client";

import Image from "next/image";
import Link from "next/link";
import { UserProfile } from "./UserProfile";

export function DashboardHeader() {
  return (
    <header className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="cursor-pointer transition-opacity hover:opacity-80"
          aria-label="Ir para o Dashboard"
        >
          <Image
            src="/logo-logofier.png"
            alt="Logofier"
            width={2000}
            height={800}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>
        <div className="h-8 w-px bg-[#d0d0dc]" />
        <h1 className="font-display text-lg font-semibold text-[#0e525b] sm:text-xl">
          Dashboard
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <UserProfile />
      </div>
    </header>
  );
}
