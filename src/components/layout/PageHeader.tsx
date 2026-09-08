"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  logoHref?: string;
}

export function PageHeader({ title, subtitle, backHref = "/dashboard", logoHref = "/dashboard" }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5">
      <div className="flex items-center gap-3">
        <Link
          href={logoHref}
          className="cursor-pointer transition-opacity hover:opacity-80"
          aria-label="Ir para o Dashboard"
        >
          <Image
            src="/logo-logofier.png"
            alt="Logofier"
            width={800}
            height={320}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>
        <div className="h-8 w-px bg-[#d0d0dc]" />
        <div>
          <h1 className="font-display text-lg font-semibold text-[#0e525b] sm:text-xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#0e525b]/60">{subtitle}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => router.push(backHref)}
        className="flex h-11 shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-white/60 px-4 text-sm font-semibold text-[#0e525b] shadow-md shadow-[#0e525b]/8 transition-all duration-150 hover:bg-white hover:shadow-lg hover:shadow-[#0e525b]/10 active:scale-[0.98]"
      >
        <ArrowLeft className="h-4 w-4 text-[#2b9aa8]" />
        <span className="hidden sm:inline">Voltar</span>
      </button>
    </header>
  );
}
