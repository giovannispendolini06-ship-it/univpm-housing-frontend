"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteOwnReview } from "@/app/reviews/actions";

export default function DeleteOwnReviewButton({
  reviewId,
  createdAt,
}: {
  reviewId: string;
  createdAt: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ageMs = Date.now() - new Date(createdAt).getTime();
  const within48h = ageMs >= 0 && ageMs < 48 * 60 * 60 * 1000;
  if (!within48h) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await deleteOwnReview(reviewId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
        className="text-xs font-semibold text-sunset-600 underline hover:text-sunset-700 disabled:opacity-60"
      >
        {pending ? "Cancellazione…" : "Cancella entro 48 ore"}
      </button>
      {error && (
        <p className="mt-1 text-[11px] text-sunset-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
