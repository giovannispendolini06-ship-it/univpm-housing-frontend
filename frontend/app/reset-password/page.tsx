"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import { createClientSupabaseClient } from "@/lib/supabase/client";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const supabase = createClientSupabaseClient();

  const tokenHash = searchParams.get("token_hash") ?? "";
  const type = searchParams.get("type") ?? "recovery";

  const [isReady, setIsReady] = useState(false);
  const [useTokenHash, setUseTokenHash] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Preferred path: Resend link with token_hash (no native Auth SMTP)
    if (tokenHash && type === "recovery") {
      setUseTokenHash(true);
      setIsReady(true);
      return;
    }

    // Legacy fallback: session from Supabase verify redirect hash
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase, tokenHash, type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t.resetPassword.tooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.resetPassword.mismatch);
      return;
    }

    setLoading(true);
    try {
      if (useTokenHash) {
        const res = await fetch("/api/auth/reset-password/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token_hash: tokenHash,
            newPassword: password,
            type: "recovery",
          }),
        });
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!res.ok) {
          if (payload.error === "invalid_or_expired_token") {
            setError(t.resetPassword.invalidToken);
          } else if (payload.error === "password_short") {
            setError(t.resetPassword.tooShort);
          } else {
            setError(t.login.genericError);
          }
          return;
        }
      } else {
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });
        if (updateError) throw updateError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm space-y-4 rounded-xl2 bg-surface p-6 shadow-card">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">
            {t.resetPassword.title}
          </h1>
          <p className="text-sm text-ink-muted">{t.resetPassword.subtitle}</p>
        </div>

        {success ? (
          <div className="rounded-xl bg-sea-50 p-4 text-sm text-sea-700">
            {t.resetPassword.success}
          </div>
        ) : !isReady ? (
          <p className="text-sm text-ink-muted">
            {t.resetPassword.verifying}{" "}
            <a href="/login?mode=forgot" className="text-sea-700 underline">
              {t.resetPassword.loginLink}
            </a>{" "}
            {t.resetPassword.andRequestNew}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder={t.resetPassword.newPasswordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
            <input
              type="password"
              placeholder={t.resetPassword.repeatPasswordPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />

            {error && <p className="text-sm text-sunset-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
            >
              {loading ? t.common.oneMoment : t.resetPassword.saveButton}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-bg px-4">
          <div className="h-40 w-full max-w-sm animate-pulse rounded-xl2 bg-surface" />
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
