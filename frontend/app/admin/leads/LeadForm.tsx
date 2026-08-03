"use client";

import { useState, useTransition } from "react";
import { createLead, fetchListingPreview, type ListingPreview } from "./actions";
import SubmitButton from "@/components/SubmitButton";

const SOURCE_OPTIONS = [
  { value: "idealista", label: "Idealista" },
  { value: "subito", label: "Subito" },
  { value: "immobiliare_it", label: "Immobiliare.it" },
  { value: "facebook_marketplace", label: "Facebook Marketplace" },
  { value: "altro", label: "Altro" },
];

export default function LeadForm() {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<ListingPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isFetching, startFetching] = useTransition();

  function handleFetchPreview() {
    setPreviewError(null);
    startFetching(async () => {
      try {
        const result = await fetchListingPreview(url);
        setPreview(result);
        if (!result.title && !result.image) {
          setPreviewError(
            "Nessuna anteprima trovata per questo link: compila i campi a mano.",
          );
        }
      } catch (err) {
        setPreview(null);
        setPreviewError(
          err instanceof Error ? err.message : "Errore nel recupero dell'anteprima.",
        );
      }
    });
  }

  return (
    <form action={createLead} className="grid gap-3 sm:grid-cols-2">
      {/* Link + tasto anteprima */}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Link dell&apos;annuncio *
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            name="external_url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.idealista.it/immobile/..."
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleFetchPreview}
            disabled={!url || isFetching}
            className="shrink-0 whitespace-nowrap rounded-xl bg-sea-600 px-3.5 py-2 text-xs font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
          >
            {isFetching ? "Recupero..." : "Recupera anteprima"}
          </button>
        </div>
        {previewError && (
          <p className="mt-1.5 text-xs text-sunset-600">{previewError}</p>
        )}
      </div>

      {/* Anteprima visiva, se trovata */}
      {preview && (preview.image || preview.title) && (
        <div className="flex gap-3 rounded-xl border border-sea-100 bg-bg p-3 sm:col-span-2">
          {preview.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.image}
              alt=""
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-ink">
              {preview.title || "Titolo non trovato"}
            </p>
            {preview.description && (
              <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-muted">
                {preview.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Campi nascosti: passano i dati dell'anteprima al server action */}
      <input type="hidden" name="image_url" value={preview?.image ?? ""} />
      <input type="hidden" name="description" value={preview?.description ?? ""} />

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Portale
        </label>
        <select
          name="source"
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Titolo annuncio
        </label>
        <input
          type="text"
          name="title"
          defaultValue={preview?.title ?? ""}
          key={preview?.title ?? "empty-title"}
          placeholder="Es. Singola in zona Torrette"
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Prezzo (€/mese)
        </label>
        <input
          type="number"
          name="price"
          min={0}
          step={1}
          placeholder="Verifica sempre a mano"
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Zona
        </label>
        <input
          type="text"
          name="zone"
          placeholder="Es. Torrette"
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Indirizzo (se noto)
        </label>
        <input
          type="text"
          name="address"
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <SubmitButton className="rounded-full bg-sea-600 px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50">
          Aggiungi annuncio
        </SubmitButton>
      </div>
    </form>
  );
}
