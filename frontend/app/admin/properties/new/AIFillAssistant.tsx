"use client";

import { useState, useTransition } from "react";
import VestaAvatar from "@/components/VestaAvatar";
import { parsePropertyFromInput } from "../actions";

type ParsedProperty = Record<string, unknown>;

function setInputValue(form: HTMLFormElement, name: string, value: string | number | boolean) {
  const el = form.elements.namedItem(name);
  if (!el) return;

  if (el instanceof HTMLInputElement) {
    if (el.type === "checkbox") {
      el.checked = Boolean(value);
    } else {
      el.value = String(value);
    }
  } else if (el instanceof HTMLSelectElement) {
    el.value = String(value);
  } else if (el instanceof HTMLTextAreaElement) {
    el.value = String(value);
  }
}

function applyParsedData(form: HTMLFormElement, data: ParsedProperty) {
  const stringFields = [
    "address",
    "city",
    "zone",
    "contract_type",
    "guarantee_status",
    "floor",
    "status",
    "owner_contact_name",
    "owner_contact_phone",
    "owner_contact_email",
    "room_label",
    "available_from",
  ] as const;

  for (const field of stringFields) {
    const value = data[field];
    if (typeof value === "string" && value.trim()) {
      setInputValue(form, field, value);
    }
  }

  const numberFields = [
    "distance_monte_dago_km",
    "distance_torrette_km",
    "distance_centro_km",
    "monthly_rent_to_owner",
    "deposit_amount",
    "total_rooms",
    "bathrooms",
    "size_sqm",
    "price_monthly",
    "estimated_utilities",
    "room_size_sqm",
    "max_occupants",
  ] as const;

  for (const field of numberFields) {
    const value = data[field];
    if (typeof value === "number" && Number.isFinite(value)) {
      setInputValue(form, field, value);
    }
  }

  const booleanFields = ["has_elevator", "is_furnished", "has_private_bathroom", "has_balcony"] as const;
  for (const field of booleanFields) {
    if (typeof data[field] === "boolean") {
      setInputValue(form, field, data[field] as boolean);
    }
  }

  const services = data.services_included;
  if (Array.isArray(services)) {
    const checkboxes = form.querySelectorAll<HTMLInputElement>(
      'input[name="services_included"]',
    );
    const selected = new Set(services.map(String));
    checkboxes.forEach((cb) => {
      cb.checked = selected.has(cb.value);
    });
  }
}

export default function AIFillAssistant() {
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFill() {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const parsed = await parsePropertyFromInput(rawText);
        const form = document.querySelector("form");
        if (!form) {
          throw new Error("Form non trovato nella pagina.");
        }
        applyParsedData(form, parsed);
        setSuccess(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Non sono riuscita a leggere l'annuncio. Riprova con un testo più completo.",
        );
      }
    });
  }

  return (
    <section className="rounded-xl2 border border-sea-100 bg-sea-50/60 p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2.5">
        <VestaAvatar size={30} />
        <div>
          <h2 className="font-display text-base font-bold text-ink">Compilazione assistita</h2>
          <p className="text-xs text-ink-muted">
            Incolla il testo di un annuncio: Vesta prova a riempire i campi sotto.
          </p>
        </div>
      </div>

      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        rows={5}
        placeholder="Es. Stanza singola in via Vanvitelli, Torrette, 380€ + 45 spese, arredata, wifi e lavatrice..."
        className="w-full rounded-xl border border-sea-100 bg-white px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleFill}
          disabled={isPending || !rawText.trim()}
          className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
        >
          {isPending ? "Sto leggendo l'annuncio..." : "Riempi i campi"}
        </button>
        {success && (
          <p className="text-xs text-sea-700">
            Fatto — controlla i valori prima di salvare.
          </p>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-sunset-600">{error}</p>}
    </section>
  );
}
