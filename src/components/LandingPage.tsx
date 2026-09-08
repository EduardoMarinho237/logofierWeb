"use client";

import Link from "next/link";
import Image from "next/image";
import { LogIn, UserPlus, ArrowRight } from "lucide-react";

interface LandingPageProps {
  whatsappUrl?: string | null;
}

export function LandingPage({ whatsappUrl }: LandingPageProps) {
  return (
    <div className="relative flex-1 overflow-y-auto overflow-x-clip overscroll-none md:overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#2b9aa8]/15 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[#0e525b]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-[#2b9aa8]/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-full flex-col">
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Image
            src="/logo-logofier.png"
            alt="Logofier"
            width={240}
            height={96}
            priority
            className="h-11 w-auto sm:h-14"
          />
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-[#f7f7fa]/80 px-4 py-2 text-sm font-semibold text-[#0e525b] shadow-md shadow-[#0e525b]/8 backdrop-blur transition hover:bg-white/90 hover:shadow-lg active:scale-[0.98]"
          >
            <LogIn className="h-4 w-4 text-[#2b9aa8]" />
            Entrar
          </Link>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:py-14">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <h1 className="font-display text-4xl font-semibold leading-tight text-[#0e525b] sm:text-6xl">
              Seu logotipo{" "}
              <span className="text-[#2b9aa8]">em cada página</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#0e525b]/65 sm:text-lg">
              Com o Logofier, você adiciona seu logo em PDFs em lote, com posição exata e resultado profissional de forma rápida e simples.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#2b9aa8] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2b9aa8]/30 transition hover:bg-[#248a97] active:scale-[0.98] sm:w-auto"
                >
                  <UserPlus className="h-4 w-4" />
                  Solicitar uma conta
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              )}
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#f7f7fa] px-8 py-3.5 text-sm font-semibold text-[#0e525b] shadow-lg shadow-[#0e525b]/8 transition hover:bg-white hover:shadow-xl active:scale-[0.98] sm:w-auto"
              >
                <LogIn className="h-4 w-4 text-[#2b9aa8]" />
                Entrar
              </Link>
            </div>
          </div>
        </main>

        <footer className="flex items-center justify-center gap-2 px-6 pb-8 text-xs font-medium uppercase tracking-[0.2em] text-[#0e525b]/40">
          <span>Feito para impressão em escala</span>
        </footer>
      </div>
    </div>
  );
}
