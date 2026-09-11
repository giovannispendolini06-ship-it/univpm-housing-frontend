"use client";

import { useState, useTransition } from "react";
import {
  canUseBulkListingImport,
  importListingsFromCsv,
  type BulkImportRowResult,
} from "@/app/owner/properties/wizard-actions";

const TEMPLATE_CSV = `indirizzo,citta,tipo_alloggio,prezzo,mq,stanze
Via Indipendenza 12,Bologna,stanza_singola,450,14,3
Via Emilia 88,Bologna,appartamento_intero,900,55,2
`;

type Props = {
  initiallyAllowed: boolean;
};

export default function BulkCsvImport({ initiallyAllowed }: Props) {
  const [open, setOpen] = useState(false);
  const [allowed, setAllowed] = useState(initiallyAllowed);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<BulkImportRowResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function ensureAllowed() {
    if (allowed) return true;
    const gate = await canUseBulkListingImport();
    setAllowed(gate.allowed);
    if (!gate.allowed) {
      setError(
        "Import multiplo disponibile per Partner/Fondatrice o proprietari con almeno un annuncio attivo.",
      );
      return false;
    }
    return true;
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "coabito-template-annunci.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    setMessage(null);
    setResults([]);
    startTransition(async () => {
      if (!(await ensureAllowed())) return;
      const fd = new FormData();
      fd.set("file", file);
      const res = await importListingsFromCsv(fd);
      if ("error" in res && res.error && !("imported" in res)) {
        setError(res.error);
        return;
      }
      setResults(res.results ?? []);
      setMessage(
        res.message ??
          `Importate ${res.imported ?? 0} bozze. Nessun annuncio pubblicato automaticamente.`,
      );
    });
  }

  if (!allowed && !open) {
    return null;
  }

  return (
    <div className="rounded-xl2 border border-sea-100 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-bold text-ink">
            Importa più annunci da file
          </h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            CSV/Excel-compatibile. Ogni riga diventa una bozza da rivedere — mai
            pubblicata automaticamente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold text-sea-700 underline"
        >
          {open ? "Chiudi" : "Apri import"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          <button
            type="button"
            onClick={downloadTemplate}
            className="text-xs font-semibold text-sunset-600 underline"
          >
            Scarica template CSV
          </button>
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={pending}
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-ink-muted"
          />
          {pending && (
            <p className="text-xs text-ink-muted">Import in corso…</p>
          )}
          {error && (
            <p className="text-sm text-sunset-600" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-sea-700" role="status">
              {message}
            </p>
          )}
          {results.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-auto text-xs">
              {results.map((r) => (
                <li
                  key={r.row}
                  className={r.ok ? "text-sea-700" : "text-sunset-600"}
                >
                  Riga {r.row}:{" "}
                  {r.ok
                    ? `bozza creata${r.address ? ` — ${r.address}` : ""}`
                    : r.error || "errore"}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
