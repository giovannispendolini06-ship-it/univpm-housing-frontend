/**
 * Anteprima "onesta" del prodotto: invece di una foto stock di una casa
 * che non esiste, mostriamo una ricostruzione stilizzata della vera UI
 * (chat + scheda con match score). Non è legata a nessuna città in
 * particolare, quindi funziona sia per Ancona sia per l'espansione futura.
 */
export default function HeroMockup() {
  return (
    <div className="rounded-xl2 border border-sea-100 bg-white p-3 shadow-card sm:p-4">
      {/* Barra finta stile browser/app */}
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-sea-100" />
        <span className="h-2.5 w-2.5 rounded-full bg-sea-100" />
        <span className="h-2.5 w-2.5 rounded-full bg-sea-100" />
      </div>

      {/* Bolla assistente */}
      <div className="mb-2 max-w-[85%] rounded-xl2 rounded-tl-sm bg-bg px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
        Che facoltà fai, e quanto puoi spendere al mese?
      </div>

      {/* Bolla utente */}
      <div className="mb-4 ml-auto max-w-[75%] rounded-xl2 rounded-tr-sm bg-sea-600 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
        Ingegneria, secondo anno. Max 420€
      </div>

      {/* Mini scheda stanza con match score, coerente con la dashboard reale */}
      <div className="flex items-center gap-3 rounded-xl border border-sea-100 bg-bg p-3">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-sea-100" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink">
            Singola luminosa con balcone
          </p>
          <p className="text-[11px] text-ink-muted">380€/mese · 9 min dall&apos;ateneo</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sea-50 font-display text-xs font-bold text-sea-700">
          92%
        </div>
      </div>
    </div>
  );
}
