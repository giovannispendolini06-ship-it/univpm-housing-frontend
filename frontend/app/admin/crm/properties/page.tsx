import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import {
  CRM_PROPERTY_STATUS_OPTIONS,
  type CrmPropertyLead,
} from "@/lib/crm/types";

export const dynamic = "force-dynamic";

export default async function CrmPropertyLeadsPage() {
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
  const { data, error } = await db
    .from("crm_property_leads")
    .select("*")
    .order("discovered_at", { ascending: false })
    .limit(300);

  const leads = (data ?? []) as CrmPropertyLead[];
  const missing = Boolean(
    error &&
      (error.code === "PGRST205" || /crm_property_leads|schema cache/i.test(error.message)),
  );

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <div>
          <Link href="/admin/crm" className="text-sm text-ink-muted underline">
            ← Contact Center
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">
            Immobili acquisibili
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Property leads: da scoperta a pubblicazione sul marketplace.
          </p>
        </div>

        {missing && (
          <p className="rounded-xl bg-sunset-500/10 p-3 text-sm">
            Esegui migration_crm_acquisition.sql su Supabase.
          </p>
        )}

        <div className="overflow-x-auto rounded-xl2 bg-surface shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-sea-100 text-xs uppercase text-ink-muted">
                <th className="px-3 py-2.5">Titolo</th>
                <th className="px-3 py-2.5">Città</th>
                <th className="px-3 py-2.5">Prezzo</th>
                <th className="px-3 py-2.5">Stato</th>
                <th className="px-3 py-2.5">Fonte</th>
                <th className="px-3 py-2.5">Contatto</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((p) => (
                <tr key={p.id} className="border-b border-sea-50">
                  <td className="px-3 py-3 font-medium text-ink">
                    {p.title || p.address || "—"}
                  </td>
                  <td className="px-3 py-3 text-ink-muted">{p.city || "—"}</td>
                  <td className="px-3 py-3">
                    {p.price != null ? `${p.price}€` : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {CRM_PROPERTY_STATUS_OPTIONS.find((o) => o.value === p.status)
                      ?.label ?? p.status}
                  </td>
                  <td className="px-3 py-3 text-xs text-ink-muted">
                    {p.source_name || "—"}
                    {p.source_url && (
                      <>
                        {" · "}
                        <a
                          href={p.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sea-700 underline"
                        >
                          link
                        </a>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {p.contact_id ? (
                      <Link
                        href={`/admin/crm/contacts/${p.contact_id}`}
                        className="text-sea-700 underline"
                      >
                        Proprietario
                      </Link>
                    ) : p.agency_contact_id ? (
                      <Link
                        href={`/admin/crm/contacts/${p.agency_contact_id}`}
                        className="text-sea-700 underline"
                      >
                        Agenzia
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && !missing && (
            <p className="p-6 text-center text-sm text-ink-muted">
              Nessun property lead. Aggiungili dalla scheda contatto.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
