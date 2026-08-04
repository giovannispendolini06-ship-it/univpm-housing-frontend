import BindoLogo from "@/components/BindoLogo";

export default function LandingFooter() {
  return (
    <footer className="border-t border-sea-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <BindoLogo size={32} />
            <span className="font-display text-base font-bold text-ink">Bindo</span>
          </div>

          <p className="max-w-sm text-xs leading-relaxed text-ink-muted">
            Piattaforma indipendente per studenti fuori sede e proprietari di
            casa. Non affiliata a nessuna università.
          </p>

          <a
            href="mailto:info@bindo.it"
            className="text-sm font-medium text-sea-700 underline underline-offset-2"
          >
            info@bindo.it
          </a>
        </div>

        <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span>© {new Date().getFullYear()} Bindo. Tutti i diritti riservati.</span>
          <a href="/privacy" className="underline underline-offset-2">
            Privacy
          </a>
          <a href="/termini" className="underline underline-offset-2">
            Termini di servizio
          </a>
        </p>
      </div>
    </footer>
  );
}
