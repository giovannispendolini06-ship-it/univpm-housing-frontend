"use client";

import { useState, useTransition } from "react";
import { generateAdminInsight } from "./actions";

export default function AdminInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
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

  return (
    <section className="rounded-xl2 bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            Analisi AI
          </h2>
          <p className="text-xs text-ink-muted">
            Un commento generato da Nomi sui numeri qui sotto.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="shrink-0 rounded-full bg-sea-600 px-4 py-2 text-xs font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
        >
          {isPending ? "Sto analizzando..." : insight ? "Rigenera" : "Genera analisi"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-sunset-600">{error}</p>}

      {insight && (
        <p className="mt-4 rounded-xl bg-bg p-4 text-sm leading-relaxed text-ink">
          {insight}
        </p>
      )}
    </section>
  );
}
