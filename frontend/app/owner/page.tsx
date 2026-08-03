import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  bozza: "In preparazione",
  attivo: "Pubblicato, in cerca di inquilini",
  affittato: "Affittato",
  sospeso: "Sospeso",
};

const STATUS_STYLES: Record<string, string> = {
  bozza: "bg-ink-muted/10 text-ink-muted",
  attivo: "bg-sea-50 text-sea-700",
  affittato: "bg-sea-600 text-white",
  sospeso: "bg-sunset-500/15 text-sunset-600",
};

export default async function OwnerDashboardPage() {
  // --- Verifica accesso: solo chi ha ruolo 'owner' --------------------------
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await authClient
    .from("users")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
  }

  // --- Dati: solo gli immobili di questo proprietario -----------------------
  const db = createServiceSupabaseClient();

  const { data: properties } = await db
    .from("properties")
    .select("id, address, zone, status, monthly_rent_to_owner, rooms(id, room_label, price_monthly, is_available)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Per ogni stanza, contiamo quanti studenti "compatibili" (score >= 70)
  // sono stati trovati dal motore di matching. Numero aggregato soltanto:
  // niente dati personali degli studenti, che restano gestiti da Bindo.
  const roomIds = (properties ?? []).flatMap((p) => (p.rooms ?? []).map((r) => r.id));
  let matchCountByRoom = new Map<string, number>();

  if (roomIds.length > 0) {
    const { data: matches } = await db
      .from("match_scores")
      .select("room_id, compatibility_score")
      .in("room_id", roomIds)
      .gte("compatibility_score", 70);

    matchCountByRoom = new Map();
    for (const m of matches ?? []) {
      matchCountByRoom.set(m.room_id, (matchCountByRoom.get(m.room_id) ?? 0) + 1);
    }
  }

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Ciao{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              I tuoi immobili e il loro stato in questo momento.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <SignOutButton className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-card" />
            <DeleteAccountButton isOwner />
          </div>
        </header>

        {!properties || properties.length === 0 ? (
          <div className="rounded-xl2 bg-surface p-6 text-center shadow-card">
            <p className="text-sm text-ink-muted">
              Non hai ancora nessun immobile collegato al tuo account.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Se ci hai già parlato del tuo immobile, ti colleghiamo a breve
              l&apos;account. Altrimenti scrivici a{" "}
              <a href="mailto:info@bindo.it" className="text-sea-700 underline">
                info@bindo.it
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => (
              <article key={property.id} className="rounded-xl2 bg-surface p-4 shadow-card sm:p-5">
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
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-sm font-bold text-sea-700">
                    {property.monthly_rent_to_owner}€/mese
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 border-t border-bg pt-3">
                  {(property.rooms ?? []).map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between rounded-xl border border-sea-100 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm text-ink">{room.room_label}</p>
                        <p className="text-[11px] text-ink-muted">
                          {room.price_monthly}€/mese ·{" "}
                          {room.is_available ? "libera" : "occupata"}
                        </p>
                      </div>
                      {room.is_available && (matchCountByRoom.get(room.id) ?? 0) > 0 && (
                        <span className="rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-medium text-sea-700">
                          {matchCountByRoom.get(room.id)} studenti compatibili
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
