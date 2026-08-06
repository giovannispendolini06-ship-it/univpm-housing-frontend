import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import type { LandlordLead } from "@/lib/landlord-leads";
import QuickAddForm from "./QuickAddForm";
import PipelineTable from "./PipelineTable";

export const dynamic = "force-dynamic";

export default async function AdminPipelinePage() {
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
  const { data: leads } = await db
    .from("landlord_leads")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-ink">
            Pipeline proprietari
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Chi contatti tu in uscita: cold-call, WhatsApp, passaparola, annunci
            sui portali. Separato dalle richieste inbound di{" "}
            <code className="text-xs">/proprietari</code> e dagli annunci esterni
            da lavorare.
          </p>
        </header>

        <QuickAddForm />

        <Suspense fallback={<p className="text-sm text-ink-muted">Carico…</p>}>
          <PipelineTable leads={(leads ?? []) as LandlordLead[]} />
        </Suspense>
      </div>
    </main>
  );
}
