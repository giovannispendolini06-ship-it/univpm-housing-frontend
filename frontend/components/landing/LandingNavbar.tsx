"use client";

import { useState } from "react";
import Link from "next/link";
import CoabitoLogo from "@/components/CoabitoLogo";

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-sea-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <CoabitoLogo size={32} />
          <span className="font-display text-base font-bold text-ink">Coabito</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#studenti" className="text-sm text-ink-muted transition hover:text-ink">
            Per gli studenti
          </a>
          <a href="#proprietari" className="text-sm text-ink-muted transition hover:text-ink">
            Per i proprietari
          </a>
          <Link href="/esempi" className="text-sm text-ink-muted transition hover:text-ink">
            Come funziona
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/installa"
            aria-label="Installa l'app"
            title="Installa l'app"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-sea-100 text-ink-muted transition hover:border-sea-400 hover:text-sea-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="7" y="2" width="10" height="20" rx="2" />
              <path d="M11 18h2" />
              <path d="M9 8l3 3 3-3" />
              <path d="M12 5v6" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sea-700"
          >
            Accedi
          </Link>
        </div>

        {/* Toggle mobile */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Apri menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-sea-100 md:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {isOpen ? <path d="M6 6 18 18M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <nav className="flex flex-col gap-1 border-t border-sea-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <a
            href="#studenti"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm text-ink-muted"
          >
            Per gli studenti
          </a>
          <a
            href="#proprietari"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm text-ink-muted"
          >
            Per i proprietari
          </a>
          <Link
            href="/esempi"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm text-ink-muted"
          >
            Come funziona
          </Link>
          <Link
            href="/installa"
            onClick={() => setIsOpen(false)}
            className="rounded-lg border-t border-sea-100 px-3 py-2.5 pt-3 text-sm text-ink-muted"
          >
            📲 Installa l&apos;app
          </Link>
          <Link
            href="/login"
            className="mt-2 rounded-full bg-sea-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            Accedi
          </Link>
        </nav>
      )}
    </header>
  );
}
