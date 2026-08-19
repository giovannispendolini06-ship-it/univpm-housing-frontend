import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { listApplicationsForOwnerRooms } from "@/lib/data/applications";
import ApplicationStatusButtons from "@/components/applications/ApplicationStatusButtons";
import { publishOwnerProperty } from "../actions";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: "Gestisci immobile | Coabito",
};

/** Detail + publish for one property — extends /owner, does not replace the dashboard. */
export default async function OwnerPropertyDetailPage({ params }: { params: Params }) {
  const session = await requireRole(["owner"]);
  const { id } = await params;
  const db = createServiceSupabaseClient();

  const { data: property } = await db
    .from("properties")
    .select(
      "id, address, zone, city, status, owner_id, rooms(id, room_label, price_monthly, is_available, available_from)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!property) notFound();
  if (property.owner_id !== session.id) redirect("/owner");

  const roomIds = (property.rooms ?? []).map((r: { id: string }) => r.id);
  const { data: apps } = await listApplicationsForOwnerRooms(db, roomIds);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link href="/owner" className="text-sm text-ink-muted underline">
          ← Area proprietario
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          {property.zone} · {property.city}
        </h1>
        <p className="mt-1 text-xs text-ink-muted">Stato: {property.status}</p>
        <p className="mt-1 text-xs text-ink-muted">
          Indirizzo privato: {property.address}
        </p>

        <ul className="mt-6 space-y-2">
          {(property.rooms ?? []).map(
            (r: {
              id: string;
              room_label: string;
              price_monthly: number;
              is_available: boolean;
            }) => (
              <li key={r.id} className="rounded-xl2 bg-white p-3 text-sm shadow-card">
                <p className="font-display font-bold text-ink">{r.room_label}</p>
                <p className="text-xs text-ink-muted">
                  {r.price_monthly}€/mese · {r.is_available ? "libera" : "non disponibile"}
                </p>
                <Link
                  href={`/stanza/${r.id}`}
                  className="mt-1 inline-block text-xs font-semibold text-sea-700 underline"
                >
                  Anteprima pubblica
                </Link>
              </li>
            ),
          )}
        </ul>

        {property.status !== "attivo" && (
          <form action={publishOwnerProperty} className="mt-6 space-y-2">
            <input type="hidden" name="property_id" value={property.id} />
            <SubmitButton className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white">
              Pubblica su /stanze
            </SubmitButton>
            <p className="text-center text-[11px] text-ink-muted">
              Pubblicazione libera: escrow e onboarding Stripe non sono richiesti.
            </p>
          </form>
        )}

        {(apps?.length ?? 0) > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
              Candidature su questo immobile
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
