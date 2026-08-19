"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import styles from "./SignupSteps.module.css";

type Mode = "signin" | "signup" | "forgot";
type SignupRole = "student" | "owner";
type SignupStep = 1 | 2 | 3;

const SIGNUP_TOTAL = 3;

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
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [stepHint, setStepHint] = useState<string | null>(null);

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
          options: { data: { full_name: fullName, role } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.login.genericError,
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: Mode) {
    setError(null);
    setStepHint(null);
    setForgotSent(false);
    setMode(newMode);
    if (newMode === "signup") setSignupStep(1);
  }

  function goNextSignupStep() {
    setError(null);
    setStepHint(null);
    if (signupStep === 1) {
      if (!fullName.trim()) {
        setStepHint(t.login.stepNameRequired);
        return;
      }
      setSignupStep(2);
      return;
    }
    if (signupStep === 2) {
      if (!email.trim() || !email.includes("@")) {
        setStepHint(t.login.stepEmailRequired);
        return;
      }
      if (password.length < 6) {
        setStepHint(t.login.stepPasswordRequired);
        return;
      }
      setSignupStep(3);
    }
  }

  function goBackSignupStep() {
    setError(null);
    setStepHint(null);
    if (signupStep === 2) setSignupStep(1);
    if (signupStep === 3) setSignupStep(2);
  }

  const signupStepTitle =
    signupStep === 1
      ? t.login.step1Title
      : signupStep === 2
        ? t.login.step2Title
        : t.login.step3Title;

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
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4 py-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl2 bg-surface p-6 shadow-card"
      >
        {mode === "signin" ? (
          <>
            <div>
              <h1 className="font-display text-xl font-bold text-ink">
                {t.login.welcomeBackTitle}
              </h1>
              <p className="text-sm text-ink-muted">{t.login.signinSubtitle}</p>
            </div>

            <input
              type="email"
              placeholder={t.login.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />

            <input
              type="password"
              placeholder={t.login.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="-mt-2 block text-left text-xs text-sea-700 underline underline-offset-2"
            >
              {t.login.forgotPassword}
            </button>

            {error && <p className="text-sm text-sunset-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
            >
              {loading ? t.common.oneMoment : t.login.signInButton}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-sea-700">
                {t.login.stepIndicator
                  .replace("{current}", String(signupStep))
                  .replace("{total}", String(SIGNUP_TOTAL))}
              </p>
              <div className="flex gap-1" aria-hidden>
                {([1, 2, 3] as SignupStep[]).map((s) => (
                  <span
                    key={s}
                    className={`h-1.5 w-5 rounded-full ${
                      s <= signupStep ? "bg-sea-600" : "bg-sea-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div key={signupStep} className={`space-y-4 ${styles.settle}`}>
              <div>
                <h1 className="font-display text-xl font-bold text-ink">
                  {signupStepTitle}
                </h1>
                {signupStep === 1 && (
                  <p className="mt-1 text-sm text-ink-muted">{t.login.step1Hint}</p>
                )}
              </div>

              {signupStep === 1 && (
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
                    autoComplete="name"
                    className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                  />
                </>
              )}

              {signupStep === 2 && (
                <>
                  <input
                    type="email"
                    placeholder={t.login.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                  />

                  <input
                    type="password"
                    placeholder={t.login.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                  />
                </>
              )}

              {signupStep === 3 && (
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
            </div>

            {(stepHint || error) && (
              <p className="text-sm text-sunset-600" role="alert">
                {stepHint || error}
              </p>
            )}

            <div className="flex gap-2">
              {signupStep > 1 && (
                <button
                  type="button"
                  onClick={goBackSignupStep}
                  className="flex-1 rounded-full border border-sea-200 py-2.5 text-sm font-semibold text-sea-700"
                >
                  {t.login.stepBack}
                </button>
              )}
              {signupStep < SIGNUP_TOTAL ? (
                <button
                  type="button"
                  onClick={goNextSignupStep}
                  className="flex-1 rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700"
                >
                  {t.login.stepContinue}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
                >
                  {loading ? t.common.oneMoment : t.login.signUpButton}
                </button>
              )}
            </div>
          </>
        )}

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
