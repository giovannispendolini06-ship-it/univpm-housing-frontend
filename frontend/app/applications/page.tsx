import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { listApplicationsForStudent } from "@/lib/data/applications";
import EscrowStatusPanel from "@/components/escrow/EscrowStatusPanel";
import {
  computeEscrowAmountCents,
  type EscrowCoverage,
} from "@/lib/escrow";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const session = await requireRole(["student"]);
  const db = createServiceSupabaseClient();
  const { data: apps, error } = await listApplicationsForStudent(db, session.id);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">Le tue candidature</h1>
          <div className="flex gap-3 text-sm">
            <Link href="/profilo" className="text-sea-700 underline">
              Profilo
            </Link>
            <Link href="/messages" className="text-sea-700 underline">
              Messaggi
            </Link>
            <Link href="/dashboard" className="text-sea-700 underline">
              Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <p
            className="rounded-xl2 border border-sunset-500/30 bg-white px-4 py-3 text-sm text-sunset-600"
            role="alert"
          >
            Impossibile caricare le candidature. Se hai appena attivato il prodotto,
            verifica che la migration `room_applications` sia applicata su Supabase.
          </p>
        )}

        {!error && (!apps || apps.length === 0) && (
          <div className="rounded-xl2 bg-white px-4 py-10 text-center shadow-card">
            <p className="font-display font-bold text-ink">Nessuna candidatura ancora</p>
            <p className="mt-2 text-sm text-ink-muted">
              Sfoglia le stanze pubbliche e candidati quando trovi qualcosa di adatto.
            </p>
            <Link
              href="/stanze"
              className="mt-4 inline-block rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Vai alle stanze
            </Link>
          </div>
        )}

        <ul className="space-y-3">
          {(apps ?? []).map((app) => {
            const room = Array.isArray(app.rooms) ? app.rooms[0] : app.rooms;
            type PropShape = {
              zone?: string;
              city?: string;
              deposit_amount?: number | null;
              escrow_coverage?: string | null;
              guaranteed_rent?: boolean | null;
            };
            const property = room
              ? Array.isArray((room as { properties?: unknown }).properties)
                ? (room as { properties: PropShape[] }).properties[0]
                : (room as { properties?: PropShape }).properties
              : null;
            const priceMonthly = Number(
              (room as { price_monthly?: number } | null)?.price_monthly ?? 0,
            );
            const roomLabel =
              (room as { room_label?: string } | null)?.room_label ?? "Stanza";
            const escrowPreview = computeEscrowAmountCents({
              coverage: property?.escrow_coverage as EscrowCoverage | null,
              firstMonthEuros: priceMonthly,
              depositEuros: property?.deposit_amount,
            });
            const showEscrow =
              app.status === "accepted" && property?.guaranteed_rent !== true;
            return (
              <li key={app.id} className="rounded-xl2 bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{roomLabel}</p>
                    <p className="text-xs text-ink-muted">
                      {property?.zone ?? "Zona"} · {property?.city ?? "Ancona"}
                    </p>
                  </div>
                  <span className="rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-semibold text-sea-700">
                    {app.status}
                  </span>
                </div>
                {app.message && (
                  <p className="mt-2 text-xs text-ink-muted">{app.message}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link
                    href={`/stanza/${(room as { id?: string } | null)?.id ?? ""}`}
                    className="text-xs font-semibold text-sea-700 underline"
                  >
                    Vedi annuncio
                  </Link>
                  {app.status === "accepted" && (
                    <Link
                      href="/messages"
                      className="text-xs font-semibold text-sea-700 underline"
                    >
                      Apri messaggi
                    </Link>
                  )}
                </div>
                {showEscrow && (
                  <div className="mt-4">
                    <EscrowStatusPanel
                      role="student"
                      status="pending"
                      amountCents={escrowPreview.totalCents || null}
                      firstMonthCents={escrowPreview.firstMonthCents || null}
                      depositCents={escrowPreview.depositCents || null}
                      coverage={escrowPreview.coverage}
                      roomLabel={roomLabel}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
