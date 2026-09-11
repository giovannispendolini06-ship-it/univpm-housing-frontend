"use client";

import { useState, useTransition } from "react";
import { toggleOpenToGroupMatching } from "@/app/coinquilini/actions";

export default function OpenToMatchingToggle({
  initialOpen,
}: {
  initialOpen: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-xl2 border border-sea-100 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold text-ink">
            Matching coinquilini
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Se attivo, Vesta può proporti altri studenti compatibili prima di
            aver trovato casa. La ricerca classica per annuncio resta
            invariata. Contatti e chat solo dopo interesse reciproco.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={open}
          disabled={pending}
          onClick={() => {
            const next = !open;
            setError(null);
            startTransition(async () => {
              const res = await toggleOpenToGroupMatching(next);
              if (!res.ok) {
                setError(res.error);
                return;
              }
              setOpen(next);
            });
          }}
          className={[
            "relative h-7 w-12 shrink-0 rounded-full transition",
            open ? "bg-sea-600" : "bg-sea-100",
            pending ? "opacity-60" : "",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
              open ? "left-5" : "left-0.5",
            ].join(" ")}
          />
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-sunset-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
