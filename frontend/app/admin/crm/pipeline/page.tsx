import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import type { CrmContact } from "@/lib/crm/types";
import CrmPipelineBoard from "@/components/admin/crm/CrmPipelineBoard";

export const dynamic = "force-dynamic";

export default async function CrmPipelinePage() {
  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await auth
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const db = createServiceSupabaseClient();
  const { data } = await db
    .from("crm_contacts")
    .select("*")
    .in("contact_type", ["OWNER", "AGENCY"])
    .order("updated_at", { ascending: false })
    .limit(500);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div>
          <Link href="/admin/crm" className="text-sm text-ink-muted underline">
            ← Contact Center
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">
            Pipeline commerciale
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Trascina le card tra le colonne per aggiornare lo stato (timeline + stop sequenze automatico).
          </p>
        </div>
        <CrmPipelineBoard contacts={(data ?? []) as CrmContact[]} />
      </div>
    </main>
  );
}
