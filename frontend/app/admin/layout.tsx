import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 border-b border-sea-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="font-display text-sm font-bold text-ink">
              Pannello admin
            </span>
            <nav className="flex items-center gap-1">
              <Link
                href="/admin"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-sea-50 hover:text-ink"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-sea-50 hover:text-ink"
              >
                Persone
              </Link>
              <Link
                href="/admin/leads"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-sea-50 hover:text-ink"
              >
                Annunci esterni
              </Link>
              <Link
                href="/admin/properties"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-sea-50 hover:text-ink"
              >
                Immobili
              </Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-ink-muted underline underline-offset-2"
          >
            ← Torna al sito
          </Link>
        </div>
      </header>

      {children}
    </div>
  );
}
