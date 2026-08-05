"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Persone" },
  { href: "/admin/inquiries", label: "Richieste" },
  { href: "/admin/leads", label: "Annunci esterni" },
  { href: "/admin/properties", label: "Immobili" },
];

export default function AdminNav({
  newInquiriesCount,
  newLeadsCount,
}: {
  newInquiriesCount: number;
  newLeadsCount: number;
}) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isActive(link.href)
                ? "bg-sea-600 text-white"
                : "text-ink-muted hover:bg-sea-50 hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        ))}

        {/* Tasto per aprire il pannello a scomparsa */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Apri riepilogo veloce"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-sea-50 hover:text-ink"
        >
          <Menu size={16} />
        </button>
      </nav>

      {/* Overlay + pannello a scomparsa */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="fixed right-0 top-0 z-50 h-dvh w-full max-w-xs animate-fade-in-up bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-ink">
                Riepilogo veloce
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Chiudi"
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition hover:bg-sea-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <Link
                href="/admin/inquiries"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between rounded-xl2 bg-sea-50 px-4 py-3 text-sm font-medium text-ink transition hover:bg-sea-100"
              >
                <span>Richieste nuove</span>
                <span className="rounded-full bg-sea-600 px-2 py-0.5 text-xs font-bold text-white">
                  {newInquiriesCount}
                </span>
              </Link>
              <Link
                href="/admin/leads"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between rounded-xl2 bg-sea-50 px-4 py-3 text-sm font-medium text-ink transition hover:bg-sea-100"
              >
                <span>Annunci da lavorare</span>
                <span className="rounded-full bg-sea-600 px-2 py-0.5 text-xs font-bold text-white">
                  {newLeadsCount}
                </span>
              </Link>
            </div>

            <div className="mt-6 border-t border-sea-100 pt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Azioni rapide
              </p>
              <Link
                href="/admin/properties/new"
                onClick={() => setIsDrawerOpen(false)}
                className="block rounded-full bg-sunset-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-sunset-600"
              >
                + Nuovo immobile
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
