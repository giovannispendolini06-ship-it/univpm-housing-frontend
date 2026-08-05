"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useLocale();
  const supabase = createClientSupabaseClient();

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

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t.resetPassword.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.resetPassword.passwordMismatch);
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
        err instanceof Error ? err.message : t.common.genericError,
      );
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
            <a href="/login" className="text-sea-700 underline">
              {t.resetPassword.loginLink}
            </a>{" "}
            {t.resetPassword.verifyingSuffix}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder={t.resetPassword.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
            <input
              type="password"
              placeholder={t.resetPassword.confirmPlaceholder}
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
              {loading ? t.common.loading : t.resetPassword.submit}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
