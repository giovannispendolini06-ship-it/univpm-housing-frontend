"use client";

import { useState, useTransition } from "react";
import { reportReview } from "@/app/reviews/actions";

export default function ReportReviewButton({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="text-[11px] text-ink-muted" role="status">
        Segnalazione inviata. Grazie.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-medium text-ink-muted underline hover:text-ink"
      >
        Segnala
      </button>
    );
  }

  return (
    <form
      className="mt-2 space-y-2 rounded-xl bg-bg px-3 py-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await reportReview({ reviewId, reason });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setDone(true);
        });
      }}
    >
      <label className="block text-[11px] font-medium text-ink-muted">
        Perché segnali questa recensione?
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          maxLength={500}
          required
          className="mt-1 w-full rounded-lg border border-sea-100 px-2 py-1.5 text-xs text-ink focus:border-sea-400 focus:outline-none"
          placeholder="Es. linguaggio offensivo, spam…"
        />
      </label>
      {error && (
        <p className="text-[11px] text-sunset-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sunset-500 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
        >
          {pending ? "…" : "Invia segnalazione"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-3 py-1 text-[11px] font-semibold text-ink-muted"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}
