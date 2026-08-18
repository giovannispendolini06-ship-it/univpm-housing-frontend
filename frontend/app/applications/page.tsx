import { redirect } from "next/navigation";
import Link from "next/link";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login?next=/applications");

  const db = createServiceSupabaseClient();
  const { data: profile } = await db
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "owner") redirect("/owner");
  if (profile?.role === "admin") redirect("/admin");

  const { data: apps, error } = await db
    .from("room_applications")
    .select(
      `
      id, status, message, created_at,
      rooms:room_id ( id, room_label, price_monthly, properties:property_id ( zone, city ) )
    `,
    )
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">Le tue candidature</h1>
          <Link href="/dashboard" className="text-sm text-sea-700 underline">
            Dashboard
          </Link>
        </div>

        {error && (
          <p className="rounded-xl2 border border-sunset-500/30 bg-white px-4 py-3 text-sm text-sunset-600" role="alert">
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
            const property = room
              ? Array.isArray((room as { properties?: unknown }).properties)
                ? (room as { properties: { zone?: string; city?: string }[] }).properties[0]
                : (room as { properties?: { zone?: string; city?: string } }).properties
              : null;
            return (
              <li key={app.id} className="rounded-xl2 bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-sm font-bold text-ink">
                      {(room as { room_label?: string } | null)?.room_label ?? "Stanza"}
                    </p>
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
                <Link
                  href={`/stanza/${(room as { id?: string } | null)?.id ?? ""}`}
                  className="mt-2 inline-block text-xs font-semibold text-sea-700 underline"
                >
                  Vedi annuncio
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
