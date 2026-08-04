"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "forgot";
type SignupRole = "student" | "owner";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<SignupRole>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setForgotSent(true);
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        if (!consentGiven) {
          setError("Devi accettare Privacy e Termini di servizio per registrarti.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      // Il middleware si occupa di mandare ognuno alla schermata giusta
      // in base al ruolo (studente -> /dashboard, proprietario -> /owner,
      // admin -> /admin), quindi qui basta un punto di partenza generico.
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Qualcosa è andato storto, riprova.",
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: Mode) {
    setError(null);
    setForgotSent(false);
    setMode(newMode);
  }

  // --- Schermata "password dimenticata" -------------------------------------
  if (mode === "forgot") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg px-4">
        <div className="w-full max-w-sm space-y-4 rounded-xl2 bg-surface p-6 shadow-card">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">
              Password dimenticata
            </h1>
            <p className="text-sm text-ink-muted">
              Ti mandiamo un link per reimpostarla.
            </p>
          </div>

          {forgotSent ? (
            <div className="rounded-xl bg-sea-50 p-4 text-sm text-sea-700">
              ✓ Controlla la tua casella email — ti abbiamo mandato un link per
              scegliere una nuova password. Se non lo vedi, guarda anche nello
              spam.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email con cui ti sei registrato"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
              />

              {error && <p className="text-sm text-sunset-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
              >
                {loading ? "Un attimo..." : "Invia link di reset"}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => switchMode("signin")}
            className="w-full text-center text-xs text-ink-muted underline underline-offset-2"
          >
            ← Torna al login
          </button>
        </div>
      </main>
    );
  }

  // --- Schermate normali: accedi / registrati --------------------------------
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl2 bg-surface p-6 shadow-card"
      >
        <div>
          <h1 className="font-display text-xl font-bold text-ink">
            {mode === "signup" ? "Crea il tuo account" : "Bentornato"}
          </h1>
          <p className="text-sm text-ink-muted">
            {mode === "signup"
              ? "Per parlare con Vesta e vedere le stanze consigliate"
              : "Accedi per continuare"}
          </p>
        </div>

        {mode === "signup" && (
          <>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  role === "student"
                    ? "border-sea-600 bg-sea-50 text-sea-700"
                    : "border-sea-100 text-ink-muted"
                }`}
              >
                Sono studente
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  role === "owner"
                    ? "border-sea-600 bg-sea-50 text-sea-700"
                    : "border-sea-100 text-ink-muted"
                }`}
              >
                Sono proprietario
              </button>
            </div>

            <input
              type="text"
              placeholder="Nome e cognome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password (minimo 6 caratteri)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />

        {mode === "signin" && (
          <button
            type="button"
            onClick={() => switchMode("forgot")}
            className="-mt-2 block text-left text-xs text-sea-700 underline underline-offset-2"
          >
            Password dimenticata?
          </button>
        )}

        {error && <p className="text-sm text-sunset-600">{error}</p>}

        {mode === "signup" && (
          <label className="flex items-start gap-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>
              Ho letto e accetto la{" "}
              <a href="/privacy" target="_blank" className="text-sea-700 underline">
                Privacy Policy
              </a>{" "}
              e i{" "}
              <a href="/termini" target="_blank" className="text-sea-700 underline">
                Termini di Servizio
              </a>
              .
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
        >
          {loading ? "Un attimo..." : mode === "signup" ? "Registrati" : "Accedi"}
        </button>

        <button
          type="button"
          onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}
          className="w-full text-center text-xs text-ink-muted underline underline-offset-2"
        >
          {mode === "signup"
            ? "Hai già un account? Accedi"
            : "Non hai un account? Registrati"}
        </button>
      </form>
    </main>
  );
}
