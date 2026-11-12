"use client";

import Image from "next/image";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  logoHref?: string;
}

export function PageHeader({ title, subtitle, logoHref = "/dashboard" }: PageHeaderProps) {
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
    </header>
  );
}
