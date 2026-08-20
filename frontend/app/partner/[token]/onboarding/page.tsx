"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const STEPS = [
  "Informazioni",
  "Foto",
  "Prezzo",
  "Disponibilità",
  "Regole",
  "Pubblica",
] as const;

export default function PartnerOnboardingPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    address: "",
    city: "Ancona",
    price: "",
    bedrooms: "1",
    notes: "",
    claimCode: "",
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else {
      startTransition(async () => {
        setError(null);
        try {
          const res = await fetch("/api/crm/partner-onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, ...form }),
          });
          const json = await res.json();
          if (!res.ok) {
            setError(json.error || "Operazione non riuscita.");
            return;
          }
          setDone(true);
        } catch {
          setError("Operazione non riuscita. Riprova più tardi.");
        }
      });
    }
  }

  if (done) {
    return (
      <main className="mx-auto min-h-dvh max-w-lg px-4 py-12">
        <h1 className="font-display text-2xl font-bold text-ink">
          Richiesta ricevuta
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Abbiamo registrato i dati dell&apos;immobile. Il team Coabito ti
          ricontatterà per completare pubblicazione o claim.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-sea-700 underline">
          Torna a Coabito
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Onboarding immobile · Step {step + 1}/{STEPS.length}
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold text-ink">
        {STEPS[step]}
      </h1>

      <div className="mt-6 space-y-3 rounded-xl2 bg-surface p-5 shadow-card">
        {step === 0 && (
          <>
            <input
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
              placeholder="Indirizzo *"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <input
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
              placeholder="Città"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <input
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
              placeholder="Codice claim (se hai già un immobile)"
              value={form.claimCode}
              onChange={(e) => setForm({ ...form, claimCode: e.target.value })}
            />
          </>
        )}
        {step === 1 && (
          <p className="text-sm text-ink-muted">
            Le foto le caricherai con il team Coabito dopo la verifica. Per ora
            puoi procedere senza upload obbligatorio.
          </p>
        )}
        {step === 2 && (
          <input
            type="number"
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
            placeholder="Prezzo mensile (€)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        )}
        {step === 3 && (
          <input
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
            placeholder="Camere / posti letto"
            value={form.bedrooms}
            onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
          />
        )}
        {step === 4 && (
          <textarea
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
            rows={4}
            placeholder="Regole / note (fumatori, animali…)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        )}
        {step === 5 && (
          <div className="text-sm text-ink-muted">
            <p>Riepilogo:</p>
            <ul className="mt-2 list-disc pl-5">
              <li>
                {form.address || "—"} · {form.city}
              </li>
              <li>{form.price ? `${form.price}€/mese` : "Prezzo da definire"}</li>
              <li>{form.bedrooms} camere/posti</li>
            </ul>
          </div>
        )}
        {error && <p className="text-sm text-sunset-600">{error}</p>}
      </div>

      <div className="mt-4 flex gap-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-full bg-sea-50 px-4 py-2.5 text-sm font-semibold text-sea-700"
          >
            Indietro
          </button>
        )}
        <button
          type="button"
          disabled={pending || (step === 0 && !form.address.trim())}
          onClick={next}
          className="flex-1 rounded-full bg-sea-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending
            ? "Invio…"
            : step === STEPS.length - 1
              ? "Invia richiesta"
              : "Continua"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => router.push(`/partner/${token}`)}
        className="mt-3 text-xs text-ink-muted underline"
      >
        Torna alla presentazione
      </button>
    </main>
  );
}
