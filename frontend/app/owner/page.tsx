import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import OwnerInsight from "./OwnerInsight";
import Link from "next/link";
import VerificationPanel from "@/components/VerificationPanel";
import VerifiedBadge from "@/components/VerifiedBadge";
import ApplicationStatusButtons from "@/components/applications/ApplicationStatusButtons";
import type { VerificationStatus } from "@/lib/verification";

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
    .select("role, full_name, email, verification_status")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
  }

  // --- Dati: solo gli immobili di questo proprietario -----------------------
  const db = createServiceSupabaseClient();

  const { data: properties } = await db
    .from("properties")
    .select("id, address, zone, status, monthly_rent_to_owner, rooms(id, room_label, is_available)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Per ogni stanza, contiamo quanti studenti "compatibili" (score >= 70)
  // sono stati trovati dal motore di matching. Numero aggregato soltanto:
  // niente dati personali degli studenti, che restano gestiti da Coabito.
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

  const { data: incomingApps } = roomIds.length
    ? await db
        .from("room_applications")
        .select(
          "id, status, created_at, message, rooms:room_id ( room_label ), users:student_id ( full_name, verification_status )",
        )
        .in("room_id", roomIds)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] as Record<string, unknown>[] };

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">
                Ciao{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
              </h1>
              <VerifiedBadge
                status={profile?.verification_status as VerificationStatus}
                role="owner"
              />
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              I tuoi immobili e il loro stato in questo momento.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <SignOutButton className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-card" />
            <DeleteAccountButton isOwner />
          </div>
        </header>

        <div className="mb-6">
          <VerificationPanel
            role="owner"
            status={(profile?.verification_status as VerificationStatus) ?? "none"}
            email={profile?.email}
          />
        </div>

        {properties && properties.length > 0 && <OwnerInsight />}

        {(incomingApps?.length ?? 0) > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
              Candidature ricevute
            </h2>
            <ul className="space-y-2">
              {incomingApps!.map((app) => {
                const room = Array.isArray(app.rooms) ? app.rooms[0] : app.rooms;
                const student = Array.isArray(app.users) ? app.users[0] : app.users;
                return (
                  <li
                    key={String(app.id)}
                    className="rounded-xl2 border border-sea-100 bg-white px-4 py-3 text-sm shadow-card"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display font-bold text-ink">
                        {(student as { full_name?: string } | null)?.full_name ?? "Studente"}
                        {(student as { verification_status?: string } | null)
                          ?.verification_status === "verified"
                          ? " · verificato"
                          : ""}
                      </p>
                      <span className="text-[11px] font-semibold text-sea-700">
                        {String(app.status)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted">
                      {(room as { room_label?: string } | null)?.room_label ?? "Stanza"}
                    </p>
                    {app.message ? (
                      <p className="mt-1 text-xs text-ink-muted">{String(app.message)}</p>
                    ) : null}
                    {!["accepted", "rejected"].includes(String(app.status)) && (
                      <ApplicationStatusButtons applicationId={String(app.id)} />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/owner/properties/new"
            className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
          >
            + Nuovo annuncio
          </Link>
          <Link href="/profilo" className="rounded-full border border-sea-200 bg-white px-4 py-2 text-sm font-semibold text-ink">
            Profilo
          </Link>
          <Link href="/messages" className="rounded-full border border-sea-200 bg-white px-4 py-2 text-sm font-semibold text-ink">
            Messaggi
          </Link>
        </div>

        {!properties || properties.length === 0 ? (
          <div className="rounded-xl2 bg-surface p-6 text-center shadow-card">
            <p className="text-sm text-ink-muted">
              Non hai ancora nessun immobile collegato al tuo account.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Pubblica il primo annuncio, oppure scrivici a{" "}
              <a href="mailto:info@coabito.it" className="text-sea-700 underline">
                info@coabito.it
              </a>
              .
            </p>
            <Link
              href="/owner/properties/new"
              className="mt-4 inline-block rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Pubblica un immobile
            </Link>
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
                          {room.is_available ? "Libera" : "Occupata"}
                        </p>
                      </div>
                      {room.is_available && (matchCountByRoom.get(room.id) ?? 0) > 0 && (
                        <span className="rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-medium text-sea-700">
                          {matchCountByRoom.get(room.id)} studenti compatibili
                        </span>
                      )}
                    </div>
                  ))}
                  <Link
                    href={`/owner/properties/${property.id}`}
                    className="inline-block pt-1 text-xs font-semibold text-sea-700 underline"
                  >
                    Gestisci / pubblica
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
