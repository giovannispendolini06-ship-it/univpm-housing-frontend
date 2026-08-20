"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import { mapAuthErrorMessage } from "@/lib/auth-errors";
import VestaAvatar from "@/components/VestaAvatar";
import { IconCasa, IconStudente } from "@/components/icons/CoabitoIcons";
import styles from "./SignupSteps.module.css";
type Mode = "signin" | "signup" | "forgot";
type SignupRole = "student" | "owner";
type SignupStep = 1 | 2 | 3;

const SIGNUP_TOTAL = 3;

function initialMode(search: URLSearchParams | null): Mode {
  const raw = search?.get("mode");
  if (raw === "signup" || raw === "forgot") return raw;
  return "signin";
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-bg px-4">
          <div className="h-40 w-full max-w-sm animate-pulse rounded-xl2 bg-surface" />
        </main>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const supabase = createClientSupabaseClient();

  const [mode, setMode] = useState<Mode>(() => initialMode(searchParams));
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
  const [signupComplete, setSignupComplete] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "forgot") {
        const res = await fetch("/api/auth/reset-password/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error("forgot_failed");
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
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            fullName,
            role,
            consentGiven: true,
          }),
        });
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
          ok?: boolean;
          session?: boolean;
        };
        if (!res.ok) {
          if (payload.error === "already_registered") {
            setMode("signin");
            setSignupStep(1);
            setSignupComplete(false);
            setError(t.login.alreadyRegisteredError);
            setLoading(false);
            return;
          }
          if (payload.error === "rate_limit") {
            throw Object.assign(new Error("rate limit"), {
              code: "over_email_send_rate_limit",
            });
          }
          if (payload.error === "consent_required") {
            setError(t.login.consentMissing);
            setLoading(false);
            return;
          }
          throw new Error(payload.error || "signup_failed");
        }

        if (payload.session === false) {
          // Account created but cookies missing — fall back to client sign-in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            setSignupComplete(true);
            setLoading(false);
            return;
          }
        }

        router.push("/onboarding");
        router.refresh();
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        mapAuthErrorMessage(err, {
          rateLimitError: t.login.rateLimitError,
          alreadyRegisteredError: t.login.alreadyRegisteredError,
          networkSmtpError: t.login.networkSmtpError,
          genericError: t.login.genericError,
        }),
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: Mode) {
    setError(null);
    setStepHint(null);
    setForgotSent(false);
    setSignupComplete(false);
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

  const firstName = fullName.trim().split(/\s+/)[0] || "";

  const vestaLine =
    signupStep === 1
      ? t.login.vestaStep1
      : signupStep === 2
        ? t.login.vestaStep2
        : t.login.vestaStep3.replace("{name}", firstName || t.login.vestaNameFallback);

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
        ) : signupComplete ? (
          <div className={`space-y-4 ${styles.settle}`}>
            <div className="flex gap-3 rounded-xl bg-sea-50/90 px-3 py-3">
              <VestaAvatar size={36} />
              <div>
                <p className="text-sm leading-snug text-ink">
                  {t.login.vestaSignupDone.replace(
                    "{name}",
                    firstName || t.login.vestaNameFallback,
                  )}
                </p>
                <p className="mt-1 text-[11px] font-medium text-sea-700">Vesta</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white hover:bg-sea-700"
            >
              {t.login.backToLogin}
            </button>
          </div>
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

            <div
              key={`vesta-${signupStep}`}
              className={`flex gap-2.5 rounded-xl bg-sea-50/90 px-3 py-2.5 ${styles.settle}`}
            >
              <VestaAvatar size={32} />
              <p className="text-[13px] leading-snug text-ink">{vestaLine}</p>
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
                      aria-pressed={role === "student"}
                      className={`${styles.roleCard} text-sea-600 ${
                        role === "student" ? styles.roleCardSelected : ""
                      }`}
                    >
                      <IconStudente size={30} />
                      <span>{t.login.iAmStudent}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("owner")}
                      aria-pressed={role === "owner"}
                      className={`${styles.roleCard} text-sea-600 ${
                        role === "owner" ? styles.roleCardSelected : ""
                      }`}
                    >
                      <IconCasa size={30} />
                      <span>{t.login.iAmOwner}</span>
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

        {!signupComplete && (
        <button
          type="button"
          onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}
          className="w-full text-center text-xs text-ink-muted underline underline-offset-2"
        >
          {mode === "signup" ? t.login.alreadyHaveAccount : t.login.noAccount}
        </button>
        )}
      </form>
    </main>
  );
}
