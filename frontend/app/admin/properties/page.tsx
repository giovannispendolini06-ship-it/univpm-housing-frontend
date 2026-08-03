import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  attivo: "Attivo",
  inattivo: "Inattivo",
  in_revisione: "In revisione",
  occupato: "Occupato",
};

const STATUS_STYLES: Record<string, string> = {
  attivo: "bg-sea-50 text-sea-700",
  inattivo: "bg-ink-muted/10 text-ink-muted",
  in_revisione: "bg-sand-400/15 text-ink",
  occupato: "bg-sunset-500/15 text-sunset-600",
};

const CONTRACT_LABELS: Record<string, string> = {
  stanza_singola: "Stanza singola",
  stanza_doppia: "Stanza doppia",
  intero_appartamento: "Intero appartamento",
};

export default async function AdminPropertiesPage() {
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

  const { data: properties } = await db
    .from("properties")
    .select(
      `
      id, address, city, zone, status, contract_type, monthly_rent_to_owner, created_at,
      rooms ( id, room_label, price_monthly, status, is_available )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Immobili
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Gestisci gli immobili e le stanze disponibili per gli studenti.
            </p>
          </div>
          <Link
            href="/admin/properties/new"
            className="rounded-full bg-sea-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700"
          >
            + Nuovo immobile
          </Link>
        </header>

        <section className="space-y-3">
          {!properties || properties.length === 0 ? (
            <p className="rounded-xl2 bg-surface p-5 text-sm text-ink-muted shadow-card">
              Nessun immobile ancora inserito.{" "}
              <Link
                href="/admin/properties/new"
                className="font-medium text-sea-700 underline underline-offset-2"
              >
                Aggiungi il primo
              </Link>
              .
            </p>
          ) : (
            properties.map((property) => {
              const rooms = (property.rooms ?? []) as {
                id: string;
                room_label: string;
                price_monthly: number;
                status: string;
                is_available: boolean;
              }[];

              return (
                <article
                  key={property.id}
                  className="rounded-xl2 bg-surface p-4 shadow-card sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[property.status] ?? "bg-sea-50 text-sea-700"}`}
                        >
                          {STATUS_LABELS[property.status] ?? property.status}
                        </span>
                        {property.contract_type && (
                          <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                            {CONTRACT_LABELS[property.contract_type] ??
                              property.contract_type}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-1.5 font-display text-sm font-bold text-ink">
                        {property.address}
                      </h2>
                      <p className="text-xs text-ink-muted">
                        {[property.zone, property.city].filter(Boolean).join(" · ")}
                        {property.monthly_rent_to_owner != null
                          ? ` · Canone proprietario ${property.monthly_rent_to_owner}€`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {rooms.length > 0 ? (
                    <ul className="mt-4 space-y-2 border-t border-bg pt-3">
                      {rooms.map((room) => (
                        <li
                          key={room.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bg px-3 py-2"
                        >
                          <div>
                            <p className="text-xs font-semibold text-ink">
                              {room.room_label}
                            </p>
                            <p className="text-[11px] text-ink-muted">
                              {room.price_monthly}€/mese
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              room.is_available
                                ? "bg-sea-50 text-sea-700"
                                : "bg-ink-muted/10 text-ink-muted"
                            }`}
                          >
                            {room.is_available ? "Disponibile" : "Non disponibile"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 border-t border-bg pt-3 text-[11px] text-ink-muted">
                      Nessuna stanza registrata.
                    </p>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
