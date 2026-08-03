import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { updateInquiryStatus } from "./actions";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  nuovo: "Nuovo",
  contattato: "Contattato",
  convertito: "Convertito",
  scartato: "Scartato",
};

const STATUS_STYLES: Record<string, string> = {
  nuovo: "bg-sea-50 text-sea-700",
  contattato: "bg-sand-400/15 text-ink",
  convertito: "bg-sea-600 text-white",
  scartato: "bg-ink-muted/10 text-ink-muted",
};

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
            sul sito. Aggiorna lo stato man mano che le contatti, e trasformale
            in un immobile vero quando sei pronto.
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
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[inquiry.status] ?? ""}`}
                    >
                      {STATUS_LABELS[inquiry.status] ?? inquiry.status}
                    </span>
                    <h3 className="mt-1.5 font-display text-sm font-bold text-ink">
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

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-bg pt-3">
                  {/* Trasforma in immobile: pre-compila indirizzo + contatti */}
                  <a
                    href={`/admin/properties/new?address=${encodeURIComponent(inquiry.property_address ?? "")}&owner_name=${encodeURIComponent(inquiry.full_name)}&owner_phone=${encodeURIComponent(inquiry.phone)}&owner_email=${encodeURIComponent(inquiry.email ?? "")}`}
                    className="rounded-full bg-sea-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-sea-700"
                  >
                    Trasforma in immobile →
                  </a>

                  {/* Cambia stato */}
                  <form action={updateInquiryStatus} className="flex items-center gap-2">
                    <input type="hidden" name="inquiry_id" value={inquiry.id} />
                    <select
                      name="status"
                      defaultValue={inquiry.status}
                      className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <SubmitButton className="rounded-full border border-sea-200 px-3 py-1.5 text-xs font-semibold text-ink transition enabled:hover:border-sea-400 disabled:opacity-50">
                      Aggiorna stato
                    </SubmitButton>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
