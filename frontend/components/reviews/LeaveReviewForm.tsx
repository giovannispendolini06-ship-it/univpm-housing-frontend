"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/app/reviews/actions";
import type { ReviewTargetType } from "@/lib/data/reviews";

export default function LeaveReviewForm({
  tenancyId,
  targetType,
  targetLabel,
}: {
  tenancyId: string;
  targetType: ReviewTargetType;
  targetLabel: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div
        className="rounded-xl2 border border-sea-100 bg-sea-50 px-4 py-4 text-sm text-ink"
        role="status"
      >
        <p className="font-display font-bold text-sea-700">Recensione pubblicata</p>
        <p className="mt-1 text-ink-muted">
          Grazie — aiuti a rendere più trasparente il mercato degli affitti per
          fuori sede.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4 rounded-xl2 border border-sea-100 bg-white p-4 shadow-card"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await submitReview({
            tenancyId,
            targetType,
            rating,
            comment,
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setDone(true);
          router.refresh();
        });
      }}
    >
      <div>
        <p className="font-display text-sm font-bold text-ink">
          Recensisci {targetLabel}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          {targetType === "landlord"
            ? "Visibile pubblicamente sulla pagina dell'annuncio."
            : "Visibile solo ad altri proprietari quando ricevono una candidatura — mai in pubblico."}
        </p>
      </div>

      <fieldset>
        <legend className="text-xs font-medium text-ink-muted">Voto (1–5)</legend>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-pressed={rating === n}
              aria-label={`${n} stelle`}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
                n <= rating
                  ? "bg-sunset-500/15 text-sunset-600"
                  : "bg-bg text-ink-muted hover:bg-sea-50"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block text-xs font-medium text-ink-muted">
        Commento (max 500 caratteri)
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          required
          className="mt-1 w-full rounded-xl border border-sea-100 px-3 py-2 text-sm text-ink focus:border-sea-400 focus:outline-none"
          placeholder={
            targetType === "landlord"
              ? "Es. stanza come da annuncio, proprietario disponibile, zona comoda per l'uni…"
              : "Es. inquilino puntuale, rispettoso delle regole della casa…"
          }
        />
        <span className="mt-0.5 block text-[10px] text-ink-muted">
          {comment.length}/500
        </span>
      </label>

      {error && (
        <p className="text-xs text-sunset-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sea-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sea-700 disabled:opacity-60"
      >
        {pending ? "Pubblicazione…" : "Pubblica recensione"}
      </button>
    </form>
  );
}
