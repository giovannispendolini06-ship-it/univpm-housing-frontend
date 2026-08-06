"use client";

import { useState, useTransition } from "react";
import {
  LANDLORD_SOURCE_OPTIONS,
  LANDLORD_ZONE_OPTIONS,
} from "@/lib/landlord-leads";
import { quickAddLandlordLead } from "./actions";

export default function QuickAddForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await quickAddLandlordLead(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const form = document.getElementById("pipeline-quick-add") as HTMLFormElement | null;
      form?.reset();
    });
  }

  return (
    <form
      id="pipeline-quick-add"
      action={handleSubmit}
      className="rounded-xl2 bg-surface p-4 shadow-card"
    >
      <p className="mb-3 font-display text-sm font-bold text-ink">+ Nuovo lead rapido</p>
      {error && (
        <p role="alert" className="mb-3 text-sm text-sunset-600">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          name="nome"
          required
          placeholder="Nome *"
          className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
        <input
          name="telefono"
          required
          type="tel"
          placeholder="Telefono *"
          className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
        <input
          name="indirizzo_immobile"
          placeholder="Indirizzo"
          className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
        <select
          name="zona"
          defaultValue=""
          className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
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
          defaultValue=""
          className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none sm:col-span-2 lg:col-span-3"
        >
          <option value="">Fonte</option>
          {LANDLORD_SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
        >
          {isPending ? "Salvo..." : "Aggiungi"}
        </button>
      </div>
    </form>
  );
}
