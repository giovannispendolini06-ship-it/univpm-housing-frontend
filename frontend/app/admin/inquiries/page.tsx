import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import InquiryCard from "./InquiryCard";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
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
  const { data: inquiries } = await db
    .from("owner_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">
            Richieste proprietari
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Persone che hanno compilato il form &quot;Proponi il tuo immobile&quot;
            sul sito. Modifica, elimina, aggiorna lo stato o trasformale in un
            immobile vero quando sei pronto.
          </p>
        </header>

        {!inquiries || inquiries.length === 0 ? (
          <p className="rounded-xl2 bg-surface p-6 text-sm text-ink-muted shadow-card">
            Nessuna richiesta ancora.
          </p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <InquiryCard key={inquiry.id} inquiry={inquiry} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
