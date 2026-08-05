"use client";

import { useEffect, useState } from "react";
import { generateOwnerInsight } from "./actions";
import VestaAvatar from "@/components/VestaAvatar";

export default function OwnerInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    setIsPending(true);
    setError(null);
    generateOwnerInsight()
      .then(setInsight)
      .catch((err) => setError(err instanceof Error ? err.message : "Errore nella generazione."))
      .finally(() => setIsPending(false));
  }, []);

  return (
    <section className="mb-6 rounded-xl2 bg-gradient-to-br from-sea-600 to-sea-700 p-5 text-white shadow-card">
      <div className="flex items-center gap-2.5">
        <VestaAvatar size={28} />
        <div>
          <h2 className="font-display text-sm font-bold">Il punto di Vesta</h2>
          <p className="text-xs text-sea-100">Aggiornato ora</p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-white/90">{error}</p>}

      {isPending && !insight ? (
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-white/20" />
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/20" />
        </div>
      ) : insight ? (
        <p className="mt-3 animate-fade-in-up text-sm leading-relaxed text-white">{insight}</p>
      ) : null}
    </section>
  );
}
