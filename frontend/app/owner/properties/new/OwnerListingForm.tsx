"use client";

import { useState, useTransition } from "react";
import { createOwnerListing } from "../actions";

export default function OwnerListingForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createOwnerListing(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-xl2 bg-white p-5 shadow-card">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Indirizzo completo (privato) *
        </label>
        <input
          name="address"
          required
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
          placeholder="Via…, Ancona"
        />
        <p className="mt-1 text-[11px] text-ink-muted">
          Non viene mostrato nell&apos;annuncio pubblico.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Zona *</label>
          <input
            name="zone"
            required
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
            placeholder="es. Torrette"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Città</label>
          <input
            name="city"
            defaultValue="Ancona"
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Titolo stanza *
        </label>
        <input
          name="room_label"
          required
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
          placeholder="es. Singola luminosa"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            Canone €/mese *
          </label>
          <input
            name="price_monthly"
            type="number"
            min={50}
            required
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            Utenze stimate €
          </label>
          <input
            name="estimated_utilities"
            type="number"
            min={0}
            defaultValue={40}
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Cauzione €</label>
          <input
            name="deposit_amount"
            type="number"
            min={0}
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            Disponibile da
          </label>
          <input
            name="available_from"
            type="date"
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Contratto</label>
          <select
            name="contract_type"
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
            defaultValue="stanza_singola"
          >
            <option value="stanza_singola">Stanza singola</option>
            <option value="stanza_doppia">Stanza doppia</option>
            <option value="intero_appartamento">Intero appartamento</option>
            <option value="transitorio">Transitorio</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-ink">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_furnished" defaultChecked /> Arredato
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="has_private_bathroom" /> Bagno privato
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="has_balcony" /> Balcone
        </label>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-ink-muted">Servizi</p>
        <div className="flex flex-wrap gap-3 text-sm">
          {["Wifi", "Lavatrice", "Riscaldamento", "Ascensore"].map((s) => (
            <label key={s} className="flex items-center gap-1.5">
              <input type="checkbox" name="services_included" value={s} /> {s}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">Foto</label>
        <input type="file" name="photo" accept="image/*" className="text-xs text-ink-muted" />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input type="checkbox" name="publish" defaultChecked />
        Pubblica subito su /stanze
      </label>
      <p className="text-[11px] text-ink-muted">
        Nessun Stripe richiesto per pubblicare. L&apos;escrow (quando sarà attivo)
        resterà opzionale e separato dalla messa online dell&apos;annuncio.
      </p>
      {error && (
        <p className="text-sm text-sunset-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Salvataggio…" : "Salva immobile"}
      </button>
    </form>
  );
}
