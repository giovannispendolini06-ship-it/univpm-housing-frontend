"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n/LocaleContext";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import OnboardingForm from "./OnboardingForm";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [role, setRole] = useState<"student" | "owner" | null>(null);

  useEffect(() => {
    const supabase = createClientSupabaseClient();

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role, profile_completed")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin" || profile?.profile_completed) {
        router.replace(profile?.role === "owner" ? "/owner" : "/dashboard");
        return;
      }

      setRole(profile?.role === "owner" ? "owner" : "student");
    });
  }, [router]);

  if (!role) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg">
        <p className="text-sm text-ink-muted">{t.common.oneMoment}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4 py-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm rounded-xl2 bg-surface p-6 shadow-card">
        <h1 className="font-display text-xl font-bold text-ink">{t.onboarding.title}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {role === "owner" ? t.onboarding.subtitleOwner : t.onboarding.subtitleStudent}
        </p>

        <div className="mt-5">
          <OnboardingForm role={role} />
        </div>
      </div>
    </main>
  );
}
