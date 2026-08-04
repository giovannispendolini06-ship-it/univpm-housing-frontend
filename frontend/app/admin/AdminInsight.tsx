"use client";

import { useEffect, useState, useTransition } from "react";
import { generateAdminInsight } from "./actions";
import NomiAvatar from "@/components/NomiAvatar";

export default function AdminInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      try {
        const text = await generateAdminInsight();
        setInsight(text);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Errore nella generazione dell'analisi.",
        );
      }
    });
  }

  // Si genera da sola appena la pagina si apre: nessun bottone da
  // cliccare, l'analisi è già pronta quando arrivi al mattino.
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="rounded-xl2 bg-gradient-to-br from-sea-600 to-sea-700 p-5 text-white shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <NomiAvatar size={30} />
          <div>
            <h2 className="font-display text-base font-bold">Il punto di Nomi</h2>
            <p className="text-xs text-sea-100">La lettura di oggi, aggiornata in automatico</p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={isPending}
          className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25 disabled:opacity-50"
        >
          {isPending ? "..." : "Aggiorna"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-white/90">{error}</p>}

      {isPending && !insight ? (
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-white/20" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/20" />
          <div className="h-3 w-4/6 animate-pulse rounded-full bg-white/20" />
        </div>
      ) : insight ? (
        <p className="mt-4 animate-fade-in-up text-sm leading-relaxed text-white">{insight}</p>
      ) : null}
    </section>
  );
}
