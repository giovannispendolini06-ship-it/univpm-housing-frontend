"use client";

import { useEffect, useState, useTransition } from "react";
import VestaAvatar from "@/components/VestaAvatar";
import { generateAdminInsight } from "./actions";

export default function AdminInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
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
  }, []);

  return (
    <section className="rounded-xl2 bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        <VestaAvatar size={30} className="shrink-0" />
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            Il punto di Vesta
          </h2>
          <p className="text-xs text-ink-muted">
            Un commento generato da Vesta sui numeri qui sotto.
          </p>
        </div>
      </div>

      {isPending && !insight && (
        <p className="mt-4 text-sm text-ink-muted">Sto analizzando...</p>
      )}

      {error && <p className="mt-3 text-sm text-sunset-600">{error}</p>}

      {insight && (
        <p className="mt-4 rounded-xl bg-bg p-4 text-sm leading-relaxed text-ink">
          {insight}
        </p>
      )}
    </section>
  );
}
