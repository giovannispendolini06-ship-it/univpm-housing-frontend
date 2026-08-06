"use client";

import { useState, useTransition } from "react";
import {
  EMPTY_LANDLORD_LEAD_DRAFT,
  LANDLORD_SOURCE_OPTIONS,
  LANDLORD_ZONE_OPTIONS,
  type LandlordLeadDraft,
} from "@/lib/landlord-leads";
import { extractLandlordLeadFromText, quickAddLandlordLead } from "./actions";

type Mode = "manual" | "from-text";

const fieldClass =
  "rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none";

export default function QuickAddForm() {
  const [mode, setMode] = useState<Mode>("manual");
  const [draft, setDraft] = useState<LandlordLeadDraft>(EMPTY_LANDLORD_LEAD_DRAFT);
  const [listingText, setListingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [extractHint, setExtractHint] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isExtracting, startExtract] = useTransition();

  function setModeAndReset(next: Mode) {
    setMode(next);
    setError(null);
    setExtractHint(null);
    if (next === "manual") {
      setListingText("");
      setDraft(EMPTY_LANDLORD_LEAD_DRAFT);
    }
  }

  function updateField<K extends keyof LandlordLeadDraft>(key: K, value: LandlordLeadDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleExtract() {
    setError(null);
    setExtractHint(null);
    startExtract(async () => {
      const result = await extractLandlordLeadFromText(listingText);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraft(result.draft);
      setExtractHint(
        "Dati estratti: controlla zona, fonte e telefono, poi conferma con Aggiungi. Nessun salvataggio automatico.",
      );
    });
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startSave(async () => {
      const result = await quickAddLandlordLead(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraft(EMPTY_LANDLORD_LEAD_DRAFT);
      setListingText("");
      setExtractHint(null);
      setMode("manual");
    });
  }

  return (
    <div className="space-y-3 rounded-xl2 bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-sm font-bold text-ink">+ Nuovo lead</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setModeAndReset("manual")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              mode === "manual" ? "bg-sea-600 text-white" : "bg-sea-50 text-sea-700"
            }`}
          >
            Manuale
          </button>
          <button
            type="button"
            onClick={() => setModeAndReset("from-text")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              mode === "from-text" ? "bg-sea-600 text-white" : "bg-sea-50 text-sea-700"
            }`}
          >
            Aggiungi da testo annuncio
          </button>
        </div>
      </div>

      {mode === "from-text" && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-ink-muted">
            Incolla il testo dell&apos;annuncio (non solo il link)
          </label>
          <textarea
            value={listingText}
            onChange={(e) => setListingText(e.target.value)}
            rows={8}
            placeholder="Copia da Idealista/Subito: indirizzo, prezzo, descrizione, contatto…"
            className={`w-full ${fieldClass}`}
          />
          <button
            type="button"
            onClick={handleExtract}
            disabled={isExtracting || listingText.trim().length < 40}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-ink/90 disabled:opacity-50"
          >
            {isExtracting ? "Estraggo…" : "Estrai dati"}
          </button>
          {extractHint && (
            <p className="text-xs text-sea-700">{extractHint}</p>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-sunset-600">
          {error}
        </p>
      )}

      <form action={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            name="nome"
            required
            value={draft.nome}
            onChange={(e) => updateField("nome", e.target.value)}
            placeholder="Nome *"
            className={fieldClass}
          />
          <input
            name="telefono"
            required
            type="tel"
            value={draft.telefono}
            onChange={(e) => updateField("telefono", e.target.value)}
            placeholder="Telefono *"
            className={fieldClass}
          />
          <input
            name="indirizzo_immobile"
            value={draft.indirizzo_immobile}
            onChange={(e) => updateField("indirizzo_immobile", e.target.value)}
            placeholder="Indirizzo"
            className={`sm:col-span-2 ${fieldClass}`}
          />
          <select
            name="zona"
            value={draft.zona}
            onChange={(e) => updateField("zona", e.target.value)}
            className={fieldClass}
          >
            <option value="">Zona</option>
            {LANDLORD_ZONE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            name="fonte"
            value={draft.fonte}
            onChange={(e) => updateField("fonte", e.target.value)}
            className={fieldClass}
          >
            <option value="">Fonte</option>
            {LANDLORD_SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            name="prezzo_richiesto"
            type="number"
            min={0}
            value={draft.prezzo_richiesto}
            onChange={(e) => updateField("prezzo_richiesto", e.target.value)}
            placeholder="Prezzo €"
            className={fieldClass}
          />
          <select
            name="arredato"
            value={draft.arredato}
            onChange={(e) =>
              updateField("arredato", e.target.value as LandlordLeadDraft["arredato"])
            }
            className={fieldClass}
          >
            <option value="">Arredato?</option>
            <option value="true">Sì</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSaving || isExtracting}
            className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
          >
            {isSaving ? "Salvo..." : "Aggiungi"}
          </button>
          {mode === "from-text" && (
            <p className="text-xs text-ink-muted">
              L&apos;AI precompila; salvi solo tu con Aggiungi.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
