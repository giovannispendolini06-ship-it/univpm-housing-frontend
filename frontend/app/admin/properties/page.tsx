import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  bozza: "Bozza",
  attivo: "Attivo",
  affittato: "Affittato",
  sospeso: "Sospeso",
};

const STATUS_STYLES: Record<string, string> = {
  bozza: "bg-ink-muted/10 text-ink-muted",
  attivo: "bg-sea-50 text-sea-700",
  affittato: "bg-sea-600 text-white",
  sospeso: "bg-sunset-500/15 text-sunset-600",
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
    .select("id, address, zone, status, monthly_rent_to_owner, owner_contact_name, rooms(id, room_label, price_monthly)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Immobili
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {properties?.length ?? 0} immobili inseriti
            </p>
          </div>
          <Link
            href="/admin/properties/new"
            className="shrink-0 rounded-full bg-sea-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700"
          >
            + Nuovo immobile
          </Link>
        </header>

        {!properties || properties.length === 0 ? (
          <p className="rounded-xl2 bg-surface p-6 text-sm text-ink-muted shadow-card">
            Nessun immobile ancora. Toccalo &quot;+ Nuovo immobile&quot; per
            iniziare.
          </p>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => (
              <a
                key={property.id}
                href={`/admin/properties/${property.id}`}
                className="block rounded-xl2 bg-surface p-4 shadow-card transition hover:shadow-lg sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[property.status] ?? ""}`}
                    >
                      {STATUS_LABELS[property.status] ?? property.status}
                    </span>
                    <h3 className="mt-1.5 font-display text-sm font-bold text-ink">
                      {property.address}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {property.zone ?? "Zona non specificata"}
                      {property.owner_contact_name
                        ? ` · Proprietario: ${property.owner_contact_name}`
                        : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-sm font-bold text-sea-700">
                    {property.monthly_rent_to_owner}€/mese
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-bg pt-3">
                  {property.rooms && property.rooms.length > 0 ? (
                    property.rooms.map((room: { id: string; room_label: string; price_monthly: number }) => (
                      <span
                        key={room.id}
                        className="rounded-full border border-sea-100 px-2.5 py-1 text-[11px] text-ink"
                      >
                        {room.room_label} · {room.price_monthly}€
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-ink-muted">
                      Nessuna stanza collegata
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
