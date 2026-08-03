"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";
type SignupRole = "student" | "owner";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<SignupRole>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
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
              ? "Per parlare con Nomi e vedere le stanze consigliate"
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

        {error && <p className="text-sm text-sunset-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
        >
          {loading ? "Un attimo..." : mode === "signup" ? "Registrati" : "Accedi"}
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode(mode === "signup" ? "signin" : "signup");
          }}
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
