"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();

  // Il link che arriva via email contiene un "token di recupero" che il
  // client Supabase legge da solo dall'URL. Finché non lo trova, non
  // mostriamo il form (evita di far scrivere una password che poi non
  // sappiamo a chi assegnare).
  const [isReady, setIsReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsReady(true);
      }
    });

    // Se la sessione di recupero è già presente al caricamento (capita
    // spesso), controlliamo anche subito, senza aspettare l'evento.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Le due password non coincidono.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Qualcosa è andato storto, riprova.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl2 bg-surface p-6 shadow-card">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">
            Nuova password
          </h1>
          <p className="text-sm text-ink-muted">Scegline una nuova per il tuo account.</p>
        </div>

        {success ? (
          <div className="rounded-xl bg-sea-50 p-4 text-sm text-sea-700">
            ✓ Password aggiornata! Ti stiamo portando dentro...
          </div>
        ) : !isReady ? (
          <p className="text-sm text-ink-muted">
            Verifica del link in corso... Se questa schermata resta ferma,
            il link potrebbe essere scaduto: torna al{" "}
            <a href="/login" className="text-sea-700 underline">
              login
            </a>{" "}
            e richiedine uno nuovo.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Nuova password (minimo 6 caratteri)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Ripeti la nuova password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />

            {error && <p className="text-sm text-sunset-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
            >
              {loading ? "Un attimo..." : "Salva nuova password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
