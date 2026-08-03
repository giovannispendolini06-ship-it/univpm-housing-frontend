import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

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
            sul sito.
          </p>
        </header>

        {!inquiries || inquiries.length === 0 ? (
          <p className="rounded-xl2 bg-surface p-6 text-sm text-ink-muted shadow-card">
            Nessuna richiesta ancora.
          </p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <article key={inquiry.id} className="rounded-xl2 bg-surface p-4 shadow-card sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm font-bold text-ink">
                      {inquiry.full_name}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      📞{" "}
                      <a href={`tel:${inquiry.phone}`} className="underline">
                        {inquiry.phone}
                      </a>
                      {inquiry.email ? (
                        <>
                          {" "}
                          · ✉️{" "}
                          <a href={`mailto:${inquiry.email}`} className="underline">
                            {inquiry.email}
                          </a>
                        </>
                      ) : (
                        ""
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-muted">
                    {new Date(inquiry.created_at).toLocaleDateString("it-IT")}
                  </span>
                </div>

                {inquiry.property_address && (
                  <p className="mt-2 text-sm text-ink">📍 {inquiry.property_address}</p>
                )}

                {inquiry.message && (
                  <p className="mt-2 rounded-lg bg-bg p-3 text-sm text-ink-muted">
                    {inquiry.message}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
