"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Persone" },
  { href: "/admin/conversations", label: "Conversazioni" },
  { href: "/admin/waitlist", label: "Lista d'attesa" },
  { href: "/admin/inquiries", label: "Richieste" },
  { href: "/admin/pipeline", label: "Pipeline proprietari" },
  { href: "/admin/leads", label: "Annunci esterni" },
  { href: "/admin/properties", label: "Immobili" },
  { href: "/admin/payments", label: "Pagamenti" },
];

export default function AdminNav({
  newInquiriesCount,
  newLeadsCount,
  latePaymentsCount = 0,
  pendingWaitlistCount = 0,
}: {
  newInquiriesCount: number;
  newLeadsCount: number;
  latePaymentsCount?: number;
  pendingWaitlistCount?: number;
}) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  function linkLabel(href: string, label: string) {
    if (href === "/admin/waitlist" && pendingWaitlistCount > 0) {
      return `${label} (${pendingWaitlistCount})`;
    }
    return label;
  }

  return (
    <>
      {/* Su schermi stretti (telefono) il menu testuale sparisce del
          tutto: sei sei righe di testo affiancate non ci stanno mai in
          orizzontale su un iPhone. La navigazione mobile passa tutta dal
          pannello a scomparsa, aperto dall'unica icona sempre visibile. */}
      <nav className="hidden items-center gap-1 md:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isActive(link.href)
                ? "bg-sea-600 text-white"
                : "text-ink-muted hover:bg-sea-50 hover:text-ink"
            }`}
          >
            {linkLabel(link.href, link.label)}
          </Link>
        ))}
      </nav>

      {/* Icona menu: sempre visibile, mobile e desktop */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        aria-label="Apri menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-sea-50 hover:text-ink md:h-8 md:w-8"
      >
        <Menu size={18} />
      </button>

      {/* Overlay + pannello a scomparsa */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="fixed right-0 top-0 z-50 h-dvh w-full max-w-xs animate-fade-in-up overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-ink">Menu</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Chiudi"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-sea-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigazione completa: su mobile è l'UNICO modo per
                spostarsi tra le sezioni, quindi sta qui in cima, ben
                visibile, non in fondo dopo i riepiloghi. */}
            <nav className="mb-6 space-y-1 md:hidden">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsDrawerOpen(false)}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive(link.href)
                      ? "bg-sea-600 text-white"
                      : "text-ink hover:bg-sea-50"
                  }`}
                >
                  {linkLabel(link.href, link.label)}
                </Link>
              ))}
            </nav>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Riepilogo veloce
            </p>
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
              <Link
                href="/admin/waitlist"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between rounded-xl2 bg-sea-50 px-4 py-3 text-sm font-medium text-ink transition hover:bg-sea-100"
              >
                <span>Lista d&apos;attesa</span>
                <span className="rounded-full bg-sea-600 px-2 py-0.5 text-xs font-bold text-white">
                  {pendingWaitlistCount}
                </span>
              </Link>
              <Link
                href="/admin/payments"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between rounded-xl2 bg-sea-50 px-4 py-3 text-sm font-medium text-ink transition hover:bg-sea-100"
              >
                <span>Pagamenti in ritardo</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${
                    latePaymentsCount > 0 ? "bg-sunset-500" : "bg-sea-600"
                  }`}
                >
                  {latePaymentsCount}
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
