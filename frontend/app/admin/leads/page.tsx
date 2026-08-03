import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { linkLeadToProperty, updateLeadStatus } from "./actions";
import LeadForm from "./LeadForm";

export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<string, string> = {
  idealista: "Idealista",
  subito: "Subito",
  immobiliare_it: "Immobiliare.it",
  facebook_marketplace: "Facebook Marketplace",
  altro: "Altro",
};

const STATUS_LABELS: Record<string, string> = {
  nuovo: "Nuovo",
  in_revisione: "In revisione",
  contattato: "Contattato",
  scartato: "Scartato",
  convertito: "Convertito",
};

const STATUS_STYLES: Record<string, string> = {
  nuovo: "bg-sea-50 text-sea-700",
  in_revisione: "bg-sand-400/15 text-ink",
  contattato: "bg-sea-100 text-sea-700",
  scartato: "bg-ink-muted/10 text-ink-muted",
  convertito: "bg-sea-600 text-white",
};

function buildNewPropertyHref(lead: {
  id: string;
  title?: string | null;
  zone?: string | null;
  address?: string | null;
  price?: number | null;
}) {
  const params = new URLSearchParams();
  params.set("lead_id", lead.id);
  if (lead.title) params.set("title", lead.title);
  if (lead.zone) params.set("zone", lead.zone);
  if (lead.address) params.set("address", lead.address);
  if (lead.price != null) params.set("price", String(lead.price));
  return `/admin/properties/new?${params.toString()}`;
}

export default async function AdminLeadsPage() {
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
    .from("leads_external")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: properties } = await db
    .from("properties")
    .select("id, address, zone, city")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-bold text-ink">
            Annunci esterni
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Traccia gli annunci pubblicati su Idealista, Subito e altri
            portali, e collegali ai tuoi immobili quando arriva un
            interessato.
          </p>
        </header>

        <section className="mb-8 rounded-xl2 bg-surface p-5 shadow-card">
          <h2 className="mb-4 font-display text-base font-bold text-ink">
            Aggiungi un annuncio
          </h2>
          <LeadForm />
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-base font-bold text-ink">
            Annunci tracciati ({leads?.length ?? 0})
          </h2>

          {!leads || leads.length === 0 ? (
            <p className="rounded-xl2 bg-surface p-5 text-sm text-ink-muted shadow-card">
              Ancora nessun annuncio tracciato. Aggiungine uno dal form qui
              sopra.
            </p>
          ) : (
            leads.map((lead) => (
              <article
                key={lead.id}
                className="rounded-xl2 bg-surface p-4 shadow-card sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sea-50 px-2 py-0.5 text-[11px] font-medium text-sea-700">
                        {SOURCE_LABELS[lead.source] ?? lead.source}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[lead.status] ?? ""}`}
                      >
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                    </div>
                    <h3 className="mt-1.5 truncate font-display text-sm font-bold text-ink">
                      {lead.title || "Senza titolo"}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {[lead.zone, lead.address].filter(Boolean).join(" · ") ||
                        "Zona non specificata"}
                      {lead.price ? ` · ${lead.price}€/mese` : ""}
                    </p>
                    <a
                      href={lead.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block truncate text-xs text-sea-700 underline underline-offset-2"
                    >
                      Vedi annuncio originale ↗
                    </a>
                  </div>

                  {!lead.matched_property_id && (
                    <Link
                      href={buildNewPropertyHref(lead)}
                      className="shrink-0 rounded-full bg-sea-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-sea-700"
                    >
                      Trasforma in immobile →
                    </Link>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-bg pt-3">
                  <form action={linkLeadToProperty} className="flex items-center gap-2">
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <select
                      name="property_id"
                      defaultValue={lead.matched_property_id ?? ""}
                      className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
                    >
                      <option value="" disabled>
                        Collega a un immobile...
                      </option>
                      {(properties ?? []).map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.address}{" "}
                          {property.zone ? `· ${property.zone}` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-full bg-sunset-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sunset-600"
                    >
                      Collega
                    </button>
                  </form>

                  <form action={updateLeadStatus} className="flex items-center gap-2">
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <select
                      name="status"
                      defaultValue={lead.status}
                      className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-full border border-sea-200 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-sea-400"
                    >
                      Aggiorna stato
                    </button>
                  </form>
                </div>

                {!properties ||
                  (properties.length === 0 && (
                    <p className="mt-2 text-[11px] text-ink-muted">
                      Non hai ancora nessun immobile a cui collegare questo
                      annuncio.
                    </p>
                  ))}
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
