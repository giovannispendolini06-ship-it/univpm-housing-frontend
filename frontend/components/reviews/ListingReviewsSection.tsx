import ReportReviewButton from "@/components/reviews/ReportReviewButton";
import type { ReviewPublic } from "@/lib/data/reviews";
import { VERIFIED_REVIEW_THRESHOLD } from "@/lib/data/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} su 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < Math.round(rating) ? "text-sunset-500" : "text-sea-100"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function ListingReviewsSection({
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
  return (
    <section className="space-y-3" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="reviews-heading" className="font-display text-sm font-bold text-ink">
          Recensioni verificate
        </h2>
        {verified && (
          <span className="rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-semibold text-sea-700">
            Verificato · {VERIFIED_REVIEW_THRESHOLD}+ soggiorni
          </span>
        )}
      </div>

      {count === 0 ? (
        <p className="text-sm text-ink-muted">
          Ancora nessuna recensione post-soggiorno. Su Coabito si recensisce solo a
          fine affitto — niente pressioni durante la convivenza.
        </p>
      ) : (
        <>
          <p className="flex flex-wrap items-center gap-2 text-sm text-ink">
            {average != null && (
              <>
                <Stars rating={average} />
                <span className="font-display font-bold tabular-nums">{average.toFixed(1)}</span>
              </>
            )}
            <span className="text-ink-muted">
              · {count} recension{count === 1 ? "e" : "i"} da inquilini
            </span>
          </p>
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-xl2 border border-sea-100 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars rating={r.rating} />
                  <time
                    className="text-[11px] text-ink-muted"
                    dateTime={r.createdAt}
                  >
                    {new Date(r.createdAt).toLocaleDateString("it-IT")}
                  </time>
                </div>
                <p className="mt-2 text-ink">{r.comment}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-ink-muted">
                    {r.authorDisplayName
                      ? `${r.authorDisplayName} · inquilino verificato`
                      : "Inquilino verificato"}
                  </p>
                  <ReportReviewButton reviewId={r.id} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
