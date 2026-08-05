import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import WaitlistTable from "./WaitlistTable";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const db = createServiceSupabaseClient();
  const { data: signups } = await db
    .from("waitlist_signups")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">Lista d&apos;attesa</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Studenti iscritti dal form pubblico o aggiunti automaticamente da Vesta quando non
            ci sono stanze compatibili.
          </p>
        </header>

        <Suspense fallback={<p className="text-sm text-ink-muted">Caricamento...</p>}>
          <WaitlistTable signups={signups ?? []} />
        </Suspense>
      </div>
    </main>
  );
}
