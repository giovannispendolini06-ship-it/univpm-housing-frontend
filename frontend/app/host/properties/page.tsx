import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { listApplicationsForOwnerRooms } from "@/lib/data/applications";
import ApplicationStatusButtons from "@/components/applications/ApplicationStatusButtons";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "I tuoi immobili | Coabito Host",
};

export default async function HostPropertiesPage() {
  const session = await requireRole(["owner", "admin"]);
  const db = createServiceSupabaseClient();

  const ownerId = session.role === "admin" ? session.id : session.id;

  const { data: properties } = await db
    .from("properties")
    .select(
      "id, address, zone, city, status, rooms(id, room_label, price_monthly, is_available, available_from)",
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  const roomIds = (properties ?? []).flatMap((p) =>
    (p.rooms ?? []).map((r: { id: string }) => r.id),
  );
  const { data: apps } = await listApplicationsForOwnerRooms(db, roomIds);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sea-700">
              Area host
            </p>
            <h1 className="font-display text-2xl font-bold text-ink">I tuoi immobili</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Pubblica stanze, gestisci candidature. Il contratto resta diretto con lo studente.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/host/properties/new"
              className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
            >
              + Nuovo immobile
            </Link>
            <Link
              href="/owner"
              className="rounded-full border border-sea-200 bg-white px-3 py-2 text-xs font-semibold text-ink"
            >
              Dashboard
            </Link>
            <SignOutButton className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink-muted shadow-card" />
          </div>
        </header>

        {!properties?.length ? (
          <div className="rounded-xl2 bg-white px-4 py-10 text-center shadow-card">
            <p className="font-display font-bold text-ink">Nessun immobile ancora</p>
            <p className="mt-2 text-sm text-ink-muted">
              Crea il primo annuncio: zona, prezzo e disponibilità. L&apos;indirizzo resta
              privato finché non lo condividi tu.
            </p>
            <Link
              href="/host/properties/new"
              className="mt-4 inline-block rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Pubblica un immobile
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {properties.map((p) => (
              <li key={p.id} className="rounded-xl2 bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="rounded-full bg-sea-50 px-2 py-0.5 text-[11px] font-medium text-sea-700">
                      {p.status}
                    </span>
                    <h2 className="mt-1 font-display text-sm font-bold text-ink">
                      {p.zone ?? "Zona"} · {p.city ?? "Ancona"}
                    </h2>
                    <p className="text-[11px] text-ink-muted">
                      Indirizzo interno (non pubblico): {p.address}
                    </p>
                  </div>
                  <Link
                    href={`/host/properties/${p.id}`}
                    className="text-xs font-semibold text-sea-700 underline"
                  >
                    Gestisci
                  </Link>
                </div>
                <ul className="mt-3 space-y-1 border-t border-bg pt-3">
                  {(p.rooms ?? []).map(
                    (r: {
                      id: string;
                      room_label: string;
                      price_monthly: number;
                      is_available: boolean;
                    }) => (
                      <li
                        key={r.id}
                        className="flex justify-between text-xs text-ink-muted"
                      >
                        <span>
                          {r.room_label}{" "}
                          {r.is_available ? "· libera" : "· non disponibile"}
                        </span>
                        <span className="font-semibold text-ink">{r.price_monthly}€</span>
                      </li>
                    ),
                  )}
                </ul>
              </li>
            ))}
          </ul>
        )}

        {(apps?.length ?? 0) > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
              Candidature
            </h2>
            <ul className="space-y-2">
              {apps!.map((app) => {
                const room = Array.isArray(app.rooms) ? app.rooms[0] : app.rooms;
                const student = Array.isArray(app.users) ? app.users[0] : app.users;
                return (
                  <li
                    key={String(app.id)}
                    className="rounded-xl2 border border-sea-100 bg-white px-4 py-3 text-sm"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
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
                    {!["accepted", "rejected"].includes(String(app.status)) && (
                      <ApplicationStatusButtons applicationId={String(app.id)} />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
