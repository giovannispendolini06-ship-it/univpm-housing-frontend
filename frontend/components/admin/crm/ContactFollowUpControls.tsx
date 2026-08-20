"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  completeFollowUp,
  scheduleFollowUp,
} from "@/app/admin/crm/actions";

export default function ContactFollowUpControls({
  contactId,
  nextFollowUpAt,
}: {
  contactId: string;
  nextFollowUpAt: string | null;
}) {
  const router = useRouter();
  const [date, setDate] = useState(
    nextFollowUpAt ? nextFollowUpAt.slice(0, 10) : "",
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-xl2 bg-surface p-4 shadow-card">
      <h3 className="font-display text-sm font-bold text-ink">Follow-up</h3>
      <p className="mt-1 text-xs text-ink-muted">
        Prossimo:{" "}
        {nextFollowUpAt
          ? new Date(nextFollowUpAt).toLocaleDateString("it-IT")
          : "non impostato"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-sea-100 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={pending || !date}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await scheduleFollowUp(contactId, date);
              if (!res.ok) setError(res.error ?? "Errore");
              else router.refresh();
            });
          }}
          className="rounded-full bg-sea-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          Programma
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            const d = new Date();
            d.setDate(d.getDate() + 3);
            const v = d.toISOString().slice(0, 10);
            setDate(v);
            startTransition(async () => {
              await scheduleFollowUp(contactId, v);
              router.refresh();
            });
          }}
          className="rounded-full bg-sea-50 px-3 py-2 text-xs font-semibold text-sea-700"
        >
          Posticipa +3g
        </button>
        <button
          type="button"
          disabled={pending || !nextFollowUpAt}
          onClick={() => {
            startTransition(async () => {
              await completeFollowUp(contactId);
              router.refresh();
            });
          }}
          className="rounded-full bg-sea-50 px-3 py-2 text-xs font-semibold text-sea-700 disabled:opacity-50"
        >
          Completa
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-sunset-600">{error}</p>}
    </div>
  );
}
