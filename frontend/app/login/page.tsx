"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import { createClientSupabaseClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "forgot";
type SignupRole = "student" | "owner";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
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
          setError(t.login.consentMissing);
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : t.login.genericError;
      const lower = raw.toLowerCase();
      if (
        lower.includes("rate limit") ||
        lower.includes("email rate limit") ||
        lower.includes("over_email_send_rate_limit")
      ) {
        setError(t.login.rateLimitError);
      } else {
        setError(raw);
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: Mode) {
    setError(null);
    setForgotSent(false);
    setMode(newMode);
  }

  if (mode === "forgot") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg px-4">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-sm space-y-4 rounded-xl2 bg-surface p-6 shadow-card">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">
              {t.login.forgotTitle}
            </h1>
            <p className="text-sm text-ink-muted">{t.login.forgotSubtitle}</p>
          </div>

          {forgotSent ? (
            <div className="rounded-xl bg-sea-50 p-4 text-sm text-sea-700">
              {t.login.forgotSuccess}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder={t.login.emailPlaceholderReset}
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
                {loading ? t.common.oneMoment : t.login.sendResetLink}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => switchMode("signin")}
            className="w-full text-center text-xs text-ink-muted underline underline-offset-2"
          >
            {t.login.backToLogin}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl2 bg-surface p-6 shadow-card"
      >
        <div>
          <h1 className="font-display text-xl font-bold text-ink">
            {mode === "signup" ? t.login.createAccountTitle : t.login.welcomeBackTitle}
          </h1>
          <p className="text-sm text-ink-muted">
            {mode === "signup" ? t.login.signupSubtitle : t.login.signinSubtitle}
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
                {t.login.iAmStudent}
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
                {t.login.iAmOwner}
              </button>
            </div>

            <input
              type="text"
              placeholder={t.login.fullNamePlaceholder}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
          </>
        )}

        <input
          type="email"
          placeholder={t.login.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />

        <input
          type="password"
          placeholder={t.login.passwordPlaceholder}
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
            {t.login.forgotPassword}
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
              {t.login.consentPrefix}{" "}
              <a href="/privacy" target="_blank" className="text-sea-700 underline">
                {t.login.privacyPolicy}
              </a>{" "}
              {t.login.and}{" "}
              <a href="/termini" target="_blank" className="text-sea-700 underline">
                {t.login.termsOfService}
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
          {loading
            ? t.common.oneMoment
            : mode === "signup"
              ? t.login.signUpButton
              : t.login.signInButton}
        </button>

        <button
          type="button"
          onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}
          className="w-full text-center text-xs text-ink-muted underline underline-offset-2"
        >
          {mode === "signup" ? t.login.alreadyHaveAccount : t.login.noAccount}
        </button>
      </form>
    </main>
  );
}
