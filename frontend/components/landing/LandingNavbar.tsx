"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-sea-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sea-600 font-display text-sm font-bold text-white">
            D
          </div>
          <span className="font-display text-base font-bold text-ink">Bindo</span>
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

        <div className="hidden md:block">
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
