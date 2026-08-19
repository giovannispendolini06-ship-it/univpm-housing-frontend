"use client";

import { useTransition, useState } from "react";
import { setApplicationStatus } from "@/app/applications/actions";

export default function ApplicationStatusButtons({
  applicationId,
}: {
  applicationId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function act(status: "under_review" | "accepted" | "rejected") {
    setError(null);
    startTransition(async () => {
      const res = await setApplicationStatus({ applicationId, status });
      if (!res.ok) setError(res.error);
      else setDone(status);
    });
  }

  if (done) {
    return (
      <p className="text-xs font-semibold text-sea-700" role="status">
        Aggiornato: {done}
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => act("under_review")}
        className="rounded-full border border-sea-200 px-2.5 py-1 text-[11px] font-semibold text-ink disabled:opacity-50"
      >
        In revisione
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => act("accepted")}
        className="rounded-full bg-sea-600 px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
      >
        Accetta
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => act("rejected")}
        className="rounded-full bg-sunset-500/15 px-2.5 py-1 text-[11px] font-semibold text-sunset-600 disabled:opacity-50"
      >
        Rifiuta
      </button>
      {error && (
        <p className="w-full text-[11px] text-sunset-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
