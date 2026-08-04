"use client";

import { useState, useTransition } from "react";
import { Sparkles, Image as ImageIcon, X } from "lucide-react";
import { parsePropertyFromInput } from "../actions";

/**
 * Scrive i valori estratti dall'AI direttamente nei campi veri del form,
 * usando i loro attributi "name" — funziona con il form HTML classico
 * che già avevamo, senza doverlo riscrivere come form controllato da
 * React. Gestisce anche i checkbox multipli (es. servizi inclusi).
 */
function fillForm(form: HTMLFormElement, data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === "") continue;
    const elements = form.elements.namedItem(key);
    if (!elements) continue;

    if (elements instanceof RadioNodeList) {
      const values = Array.isArray(value) ? value.map(String) : [String(value)];
      elements.forEach((el) => {
        if (el instanceof HTMLInputElement && el.type === "checkbox") {
          el.checked = values.includes(el.value);
        }
      });
    } else if (elements instanceof HTMLInputElement) {
      if (elements.type === "checkbox") {
        elements.checked = Boolean(value);
      } else {
        elements.value = String(value);
      }
    } else if (
      elements instanceof HTMLSelectElement ||
      elements instanceof HTMLTextAreaElement
    ) {
      elements.value = String(value);
    }
  }
}

export default function AIFillAssistant({ formId }: { formId: string }) {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function removeImage() {
    setImage(null);
    setImagePreview(null);
  }

  function handleFill() {
    if (!description.trim() && !image) return;
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("description", description);
        if (image) formData.set("image", image);

        const data = await parsePropertyFromInput(formData);
        const form = document.getElementById(formId) as HTMLFormElement | null;
        if (!form) throw new Error("Modulo non trovato nella pagina.");
        fillForm(form, data);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore nell'interpretazione.");
      }
    });
  }

  return (
    <div className="mb-6 rounded-xl2 border border-dashed border-sea-300 bg-sea-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={16} className="text-sea-600" />
        <h3 className="font-display text-sm font-bold text-ink">Compila con l&apos;AI</h3>
      </div>
      <p className="mb-3 text-xs text-ink-muted">
        Scrivi una descrizione libera e/o carica una foto (planimetria, documento, foto di
        un annuncio) — Vesta prova a riempire i campi qui sotto da solo. Controlla sempre
        tutto prima di salvare.
      </p>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Es: Appartamento in via del Verziere zona Torrette, 100mq al 3° piano con ascensore, arredato. Due stanze, canone 1000€/mese..."
        className="mb-3 w-full rounded-xl border border-sea-200 bg-white px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
      />

      {imagePreview ? (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-sea-200 bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Anteprima"
            className="h-16 w-16 rounded-lg object-cover"
          />
          <span className="flex-1 truncate text-xs text-ink-muted">{image?.name}</span>
          <button
            type="button"
            onClick={removeImage}
            aria-label="Rimuovi immagine"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-sunset-500/10 hover:text-sunset-600"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="mb-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-sea-700">
          <ImageIcon size={15} />
          Carica una foto (planimetria, documento, annuncio...)
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      )}

      {error && <p className="mb-2 text-xs text-sunset-600">{error}</p>}
      {success && (
        <p className="mb-2 text-xs text-sea-700">
          ✓ Campi compilati qui sotto — controllali prima di salvare.
        </p>
      )}

      <button
        type="button"
        onClick={handleFill}
        disabled={isPending || (!description.trim() && !image)}
        className="rounded-full bg-sea-600 px-4 py-2 text-xs font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
      >
        {isPending ? "Sto leggendo..." : "Compila i campi"}
      </button>
    </div>
  );
}
