"use client";

import { useRef, useState, useTransition } from "react";
import { Sparkles, ImageIcon, X } from "lucide-react";
import { parsePropertyFromInput } from "../actions";

interface AIFillAssistantProps {
  formId: string;
}

function setFieldValue(form: HTMLFormElement, name: string, value: unknown) {
  if (value === null || value === undefined) return;

  const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `[name="${name}"]`,
  );

  if (fields.length === 0) return;

  const first = fields[0];

  if (first instanceof HTMLInputElement && first.type === "checkbox") {
    const checked = Boolean(value);
    fields.forEach((field) => {
      if (field instanceof HTMLInputElement) field.checked = checked;
    });
    return;
  }

  const stringValue = String(value);
  if (first instanceof HTMLSelectElement || first instanceof HTMLInputElement || first instanceof HTMLTextAreaElement) {
    first.value = stringValue;
    first.dispatchEvent(new Event("input", { bubbles: true }));
    first.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function setServicesIncluded(form: HTMLFormElement, services: unknown) {
  if (!Array.isArray(services)) return;
  const checkboxes = form.querySelectorAll<HTMLInputElement>(
    'input[name="services_included"]',
  );
  checkboxes.forEach((cb) => {
    cb.checked = services.includes(cb.value);
  });
}

export default function AIFillAssistant({ formId }: AIFillAssistantProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  }

  function clearImage() {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFill() {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) {
      setError("Form non trovato.");
      return;
    }

    if (!description.trim() && !image) {
      setError("Aggiungi una descrizione o almeno una foto.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("description", description);
      if (image) formData.set("image", image);
      // parsePropertyFromInput expects text + images
      formData.set("text", description);
      if (image) formData.append("images", image);

      const result = await parsePropertyFromInput(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!result.data) return;

      const data = result.data;
      const fieldMap: Record<string, unknown> = {
        address: data.address,
        city: data.city,
        zone: data.zone,
        contract_type: data.contract_type,
        monthly_rent_to_owner: data.monthly_rent_to_owner,
        deposit_amount: data.deposit_amount,
        total_rooms: data.total_rooms,
        bathrooms: data.bathrooms,
        size_sqm: data.size_sqm,
        floor: data.floor,
        room_label: data.room_label,
        price_monthly: data.price_monthly,
        estimated_utilities: data.estimated_utilities,
        room_size_sqm: data.room_size_sqm,
        available_from: data.available_from,
      };

      for (const [name, value] of Object.entries(fieldMap)) {
        setFieldValue(form, name, value);
      }

      setFieldValue(form, "has_elevator", data.has_elevator);
      setFieldValue(form, "is_furnished", data.is_furnished);
      setFieldValue(form, "has_private_bathroom", data.has_private_bathroom);
      setFieldValue(form, "has_balcony", data.has_balcony);
      setServicesIncluded(form, data.services_included);
    });
  }

  return (
    <section className="rounded-xl2 border border-sea-100 bg-sea-50/50 p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-sea-600" />
        <h2 className="font-display text-sm font-bold text-ink">
          Compila con Vesta
        </h2>
      </div>
      <p className="mb-4 text-xs text-ink-muted">
        Incolla la descrizione dell&apos;annuncio o carica uno screenshot: Vesta
        prova a riempire i campi del form sotto.
      </p>

      <div className="space-y-3">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrizione dell'immobile (testo libero, copia-incolla da Idealista/Subito…)"
          rows={4}
          className="w-full rounded-xl border border-sea-100 bg-white px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-sea-200 bg-white px-4 py-2 text-xs font-medium text-ink transition hover:bg-sea-50">
            <ImageIcon className="h-4 w-4 text-sea-600" />
            Carica immagine
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {imagePreview && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Anteprima"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-2 -top-2 rounded-full bg-ink p-0.5 text-white"
                aria-label="Rimuovi immagine"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleFill}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-sea-600 px-5 py-2.5 text-xs font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {isPending ? "Vesta sta analizzando…" : "Vesta prova a riempire i campi"}
        </button>

        {error && <p className="text-xs text-sunset-600">{error}</p>}
      </div>
    </section>
  );
}
