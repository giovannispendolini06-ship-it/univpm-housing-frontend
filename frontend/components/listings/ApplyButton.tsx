"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitRoomApplication } from "@/app/applications/actions";
import { track } from "@/lib/analytics";

export default function ApplyButton({
  roomId,
  roomTitle,
}: {
  roomId: string;
  roomTitle: string;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    track("application_started", { roomId, roomTitle });

    startTransition(async () => {
      const result = await submitRoomApplication({ roomId, message });
      if (!result.ok) {
        if (result.code === "unauthenticated") setNeedsLogin(true);
        setError(result.error);
        return;
      }
      setSuccess(true);
      track("application_submitted", { roomId, applicationId: result.applicationId });
    });
  }

  if (success) {
    return (
      <div
        className="rounded-xl2 border border-sea-100 bg-sea-50 px-4 py-4 text-sm text-ink"
        role="status"
      >
        <p className="font-display font-bold text-sea-700">Candidatura inviata</p>
        <p className="mt-1 text-ink-muted">
          Ti aggiorneremo appena il proprietario (o il team Coabito) la esamina.
          Il contratto di locazione, se si procede, resta diretto tra le parti.
        </p>
        <Link href="/dashboard" className="mt-3 inline-block text-sm font-semibold text-sea-700 underline">
          Vai alla dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl2 border border-sea-100 bg-white p-4 shadow-card">
      <p className="font-display text-sm font-bold text-ink">Candidati a questa stanza</p>
      <p className="text-xs text-ink-muted">
        Inviamo la tua candidatura al flusso marketplace. Non è un contratto: serve a
        far partire il contatto con il proprietario.
      </p>
      <label className="block text-xs font-medium text-ink-muted">
        Messaggio (opzionale)
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={1000}
          className="mt-1 w-full rounded-xl border border-sea-100 px-3 py-2 text-sm text-ink focus:border-sea-400 focus:outline-none"
          placeholder="Es. facoltà, data di ingresso, cosa cerchi in un coinquilino…"
        />
      </label>
      {error && (
        <p className="text-xs text-sunset-600" role="alert">
          {error}
          {needsLogin && (
            <>
              {" "}
              <Link href={`/login?next=/stanza/${roomId}`} className="font-semibold underline">
                Accedi
              </Link>
            </>
          )}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700 disabled:opacity-60"
      >
        {pending ? "Invio in corso…" : "Invia candidatura"}
      </button>
    </form>
  );
}
