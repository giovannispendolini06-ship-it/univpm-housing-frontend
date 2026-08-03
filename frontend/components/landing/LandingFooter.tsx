export default function LandingFooter() {
  return (
    <footer className="border-t border-sea-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sea-600 font-display text-sm font-bold text-white">
              D
            </div>
            <span className="font-display text-base font-bold text-ink">Dado</span>
          </div>

          <p className="max-w-sm text-xs leading-relaxed text-ink-muted">
            Piattaforma indipendente per studenti e proprietari ad Ancona.
            Non affiliata a UNIVPM.
          </p>

          <a
            href="mailto:info@dado-ancona.it"
            className="text-sm font-medium text-sea-700 underline underline-offset-2"
          >
            info@dado-ancona.it
          </a>
        </div>

        <p className="mt-8 text-xs text-ink-muted">
          © {new Date().getFullYear()} Dado. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
}
