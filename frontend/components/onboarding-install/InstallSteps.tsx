function MiniLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0F6E6A" />
      <path
        d="M16 6.5 Q16 3.5 19 4.5"
        stroke="#ffffff"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M13 8 L16 10.2 L19 8 L24.5 12 L21 15.2 L21 26 L11 26 L11 15.2 L7.5 12 Z"
        fill="#ffffff"
      />
      <circle cx="16" cy="18" r="1.3" fill="#FF6B4A" />
    </svg>
  );
}

// --- Passo 1: il sito aperto nel browser -----------------------------------
export function BrowserStep() {
  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex items-center gap-1.5 border-b border-sea-100 bg-white px-2 py-2">
        <div className="flex-1 rounded-full bg-bg px-2 py-1 text-center text-[7px] text-ink-muted">
          coabito.it
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <MiniLogo />
        <div className="h-1.5 w-16 rounded-full bg-ink/15" />
        <div className="h-1.5 w-12 rounded-full bg-ink/10" />
      </div>
    </div>
  );
}

// --- iOS · Passo 2: evidenzia l'icona di condivisione -----------------------
export function IosShareStep() {
  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex items-center gap-1.5 border-b border-sea-100 bg-white px-2 py-2">
        <div className="flex-1 rounded-full bg-bg px-2 py-1 text-center text-[7px] text-ink-muted">
          coabito.it
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <MiniLogo />
        <div className="h-1.5 w-16 rounded-full bg-ink/15" />
      </div>
      <div className="flex items-center justify-around border-t border-sea-100 bg-white px-2 py-2.5">
        <div className="h-3 w-3 rounded-sm border border-ink-muted/40" />
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sunset-500 ring-4 ring-sunset-500/25">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
            <path
              d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="h-3 w-3 rounded-sm border border-ink-muted/40" />
      </div>
    </div>
  );
}

// --- iOS · Passo 3: il foglio di condivisione con l'opzione evidenziata -----
export function IosShareSheetStep() {
  return (
    <div className="flex h-full flex-col justify-end bg-ink/10">
      <div className="rounded-t-2xl bg-white p-2.5">
        <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-ink-muted/20" />
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5">
            <div className="h-3 w-3 shrink-0 rounded bg-ink-muted/15" />
            <div className="h-1.5 w-16 rounded-full bg-ink-muted/15" />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-sunset-500/10 px-1.5 py-1.5 ring-2 ring-sunset-500">
            <div className="flex h-3 w-3 shrink-0 items-center justify-center rounded bg-sunset-500 text-[7px] font-bold text-white">
              +
            </div>
            <p className="text-[7px] font-bold text-sunset-600">
              Aggiungi alla schermata Home
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5">
            <div className="h-3 w-3 shrink-0 rounded bg-ink-muted/15" />
            <div className="h-1.5 w-11 rounded-full bg-ink-muted/15" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Android · Passo 2: evidenzia il menu a tre puntini ---------------------
export function AndroidMenuStep() {
  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex items-center gap-1.5 border-b border-sea-100 bg-white px-2 py-2">
        <div className="flex-1 rounded-full bg-bg px-2 py-1 text-center text-[7px] text-ink-muted">
          coabito.it
        </div>
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sunset-500 text-[9px] font-bold text-white ring-4 ring-sunset-500/25">
          ⋮
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <MiniLogo />
        <div className="h-1.5 w-16 rounded-full bg-ink/15" />
      </div>
    </div>
  );
}

// --- Android · Passo 3: il menu a tendina con l'opzione evidenziata --------
export function AndroidDropdownStep() {
  return (
    <div className="relative h-full bg-bg">
      <div className="absolute right-2 top-2 w-28 rounded-lg bg-white p-1.5 shadow-card">
        <div className="mb-1.5 h-1.5 w-16 rounded-full bg-ink-muted/15" />
        <div className="mb-1.5 flex items-center gap-1 rounded bg-sunset-500/10 px-1 py-1 ring-2 ring-sunset-500">
          <p className="text-[7px] font-bold text-sunset-600">Installa app</p>
        </div>
        <div className="h-1.5 w-12 rounded-full bg-ink-muted/15" />
      </div>
    </div>
  );
}

// --- Passo finale (comune a entrambi): l'icona è sulla schermata Home ------
export function HomeScreenStep() {
  return (
    <div className="grid h-full grid-cols-3 content-start gap-2.5 bg-gradient-to-b from-sea-50 to-white p-3 pt-7">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl bg-white/70" />
      ))}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-sea-600 ring-2 ring-sunset-500">
        <MiniLogo />
      </div>
    </div>
  );
}
