"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPendingReviewsForCurrentUser } from "@/app/reviews/actions";

/** Soft prompt on dashboard when ended stays still need a review. */
export default function PendingReviewsBanner() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getPendingReviewsForCurrentUser()
      .then((pending) => {
        if (!cancelled) setCount(pending.length);
      })
      .catch(() => {
        /* unauthenticated or table missing */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === 0) return null;

  return (
    <div className="shrink-0 px-3 pt-2 sm:px-4">
      <Link
        href="/recensioni"
        className="flex items-center justify-between gap-3 rounded-xl2 border border-sea-100 bg-sea-50 px-3.5 py-2.5 text-sm text-ink transition hover:border-sea-200"
      >
        <span>
          <span className="font-display font-bold text-sea-700">
            {count === 1
              ? "1 recensione da lasciare"
              : `${count} recensioni da lasciare`}
          </span>
          <span className="mt-0.5 block text-xs text-ink-muted">
            Solo a fine soggiorno — aiuti chi cerca casa dopo di te.
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-sea-700 underline">
          Apri
        </span>
      </Link>
    </div>
  );
}
