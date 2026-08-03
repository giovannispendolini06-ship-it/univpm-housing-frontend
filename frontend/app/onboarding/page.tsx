import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import OnboardingForm from "./OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await authClient
    .from("users")
    .select("role, profile_completed")
    .eq("id", user.id)
    .single();

  // Il middleware gestisce già i redirect principali, questo è solo un
  // controllo di sicurezza in più a livello di pagina.
  if (profile?.role === "admin" || profile?.profile_completed) {
    redirect(profile?.role === "owner" ? "/owner" : "/dashboard");
  }

  const role = profile?.role === "owner" ? "owner" : "student";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4 py-8">
      <div className="w-full max-w-sm rounded-xl2 bg-surface p-6 shadow-card">
        <h1 className="font-display text-xl font-bold text-ink">
          Ultimo passaggio
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {role === "owner"
            ? "Qualche dato in più prima di iniziare a gestire i tuoi immobili."
            : "Qualche dato in più prima di parlare con Nomi."}
        </p>

        <div className="mt-5">
          <OnboardingForm role={role} />
        </div>
      </div>
    </main>
  );
}
