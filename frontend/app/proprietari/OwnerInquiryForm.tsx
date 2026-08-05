"use client";

import { useState, useTransition } from "react";
import { submitOwnerInquiry } from "./actions";

export default function OwnerInquiryForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Timestamp di quando il form è comparso a schermo: usato lato server
  // per capire se è stato compilato "troppo in fretta" per essere un umano.
  const [renderedAt] = useState(() => Date.now());

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitOwnerInquiry(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="animate-pop-in rounded-xl2 bg-sea-50 p-6 text-center shadow-card">
        <p className="font-display text-base font-bold text-sea-700">
          Richiesta ricevuta! 🎉
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Ti contattiamo entro 24-48 ore per parlare del tuo immobile.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl2 bg-surface p-6 shadow-card">
      {/* Campo trappola: invisibile per un umano, spesso compilato dai bot.
          Se arriva pieno, il server scarta la richiesta senza dirlo. */}
      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor="website">Non compilare questo campo</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="rendered_at" value={renderedAt} />

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Nome e cognome *
        </label>
        <input
          type="text"
          name="full_name"
          required
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Telefono *
        </label>
        <input
          type="tel"
          name="phone"
          required
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Email
        </label>
        <input
          type="email"
          name="email"
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Indirizzo dell&apos;immobile
        </label>
        <input
          type="text"
          name="property_address"
          placeholder="Anche solo la zona, se preferisci"
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          Messaggio (facoltativo)
        </label>
        <textarea
          name="message"
          rows={3}
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-sunset-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
      >
        {isPending ? "Invio..." : "Invia richiesta"}
      </button>
    </form>
  );
}
