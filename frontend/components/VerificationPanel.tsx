"use client";

import { useState, useTransition } from "react";
import VerifiedBadge from "@/components/VerifiedBadge";
import {
  requestOwnerVerification,
  requestStudentVerification,
} from "@/app/verification/actions";
import type { VerificationStatus } from "@/lib/verification";

export default function VerificationPanel({
  role,
  status,
  email,
}: {
  role: "student" | "owner";
  status: VerificationStatus | string;
  email?: string | null;
}) {
  const [current, setCurrent] = useState(status);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (current === "verified") {
    return (
      <div className="rounded-xl2 border border-sea-100 bg-white px-4 py-3 shadow-card">
        <VerifiedBadge status="verified" role={role} />
        <p className="mt-1.5 text-xs text-ink-muted">
          Il badge è visibile sul tuo profilo marketplace.
        </p>
      </div>
    );
  }

  function onRequest() {
    setMessage(null);
    startTransition(async () => {
      const result =
        role === "student"
          ? await requestStudentVerification()
          : await requestOwnerVerification();
      if (result.ok) {
        setCurrent(role === "student" ? "verified" : "pending");
        setMessage(
          role === "student"
            ? "Badge attivato: studente verificato."
            : "Richiesta inviata: ti ricontattiamo per il documento di proprietà/delega.",
        );
      } else {
        setMessage(result.error);
      }
    });
  }

  return (
    <div className="rounded-xl2 border border-sea-100 bg-white px-4 py-3 shadow-card">
      <p className="font-display text-sm font-bold text-ink">
        {role === "student" ? "Badge studente verificato" : "Badge proprietario verificato"}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        {role === "student"
          ? `Conferma l’iscrizione universitaria con email istituzionale UNIVPM${email ? ` (account: ${email})` : ""}.`
          : "Richiedi la verifica del documento di proprietà o delega: un admin la revisiona manualmente."}
      </p>
      {current === "pending" ? (
        <p className="mt-2 text-xs font-medium text-sea-700">Richiesta in revisione…</p>
      ) : (
        <button
          type="button"
          onClick={onRequest}
          disabled={pending}
          className="mt-3 rounded-full bg-sea-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sea-700 disabled:opacity-60"
        >
          {pending ? "Invio…" : "Richiedi verifica"}
        </button>
      )}
      {message && <p className="mt-2 text-xs text-ink-muted">{message}</p>}
    </div>
  );
}
