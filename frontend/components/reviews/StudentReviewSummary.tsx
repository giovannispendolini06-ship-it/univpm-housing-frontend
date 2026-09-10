import { VERIFIED_REVIEW_THRESHOLD, type ReviewPublic } from "@/lib/data/reviews";

/** Compact student reputation for owners viewing candidature — never public. */
export default function StudentReviewSummary({
  reviews,
  average,
  count,
  verified,
}: {
  reviews: ReviewPublic[];
  average: number | null;
  count: number;
  verified: boolean;
}) {
  if (count === 0) {
    return (
      <p className="mt-2 text-[11px] text-ink-muted">
        Nessuna recensione da proprietari precedenti.
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-xl bg-sea-50/80 px-2.5 py-2">
      <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink">
        <span className="font-semibold text-sea-700">
          {average?.toFixed(1)}★
        </span>
        <span className="text-ink-muted">
          · {count} recension{count === 1 ? "e" : "i"} da proprietari
        </span>
        {verified && (
          <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-sea-700">
            Verificato ({VERIFIED_REVIEW_THRESHOLD}+)
          </span>
        )}
      </p>
      <ul className="mt-1.5 space-y-1">
        {reviews.slice(0, 2).map((r) => (
          <li key={r.id} className="text-[11px] leading-snug text-ink-muted">
            <span className="font-semibold text-ink">{r.rating}★</span>{" "}
            {r.comment.length > 120 ? `${r.comment.slice(0, 117)}…` : r.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}
