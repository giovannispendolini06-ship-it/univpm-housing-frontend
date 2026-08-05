import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { markPaymentPaid, markPaymentLate } from "./actions";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  da_registrare: "Da registrare",
  pagato: "Pagato",
  in_ritardo: "In ritardo",
};

const STATUS_STYLES: Record<string, string> = {
  da_registrare: "bg-sand-400/15 text-ink",
  pagato: "bg-sea-600 text-white",
  in_ritardo: "bg-sunset-500/15 text-sunset-600",
};

// Ordine di priorità visiva: prima chi è in ritardo, poi chi va ancora
// registrato, infine chi ha già pagato questo mese.
const STATUS_ORDER: Record<string, number> = {
  in_ritardo: 0,
  da_registrare: 1,
  pagato: 2,
};

export default async function AdminPaymentsPage() {
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

  // --- Affitti attivi, con stanza/immobile/studente collegati -------------
  const { data: tenancies } = await db
    .from("room_tenancies")
    .select(
      `
      id, started_at,
      rooms:room_id ( id, room_label, price_monthly, properties:property_id ( id, address ) ),
      users:student_id ( id, full_name, email )
    `,
    )
    .is("ended_at", null);

  const tenancyList = tenancies ?? [];

  // --- Pagamenti già registrati per il mese corrente -----------------------
  const now = new Date();
  const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthLabel = now.toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  const tenancyIds = tenancyList.map((t) => t.id);
  const { data: payments } =
    tenancyIds.length > 0
      ? await db
          .from("rent_payments")
          .select("*")
          .in("tenancy_id", tenancyIds)
          .eq("period_month", periodMonth)
      : { data: [] as any[] };

  const paymentByTenancy = new Map((payments ?? []).map((p: any) => [p.tenancy_id, p]));

  // --- Righe unite: affitto + stato pagamento del mese corrente -----------
  const rows = tenancyList
    .map((t: any) => {
      const payment = paymentByTenancy.get(t.id);
      const room = t.rooms;
      const property = room?.properties;
      const student = t.users;
      const amountDue = payment?.amount_due ?? room?.price_monthly ?? 0;
      const status = payment?.status ?? "da_registrare";

      return {
        tenancyId: t.id as string,
        studentName: student?.full_name ?? "—",
        studentEmail: student?.email ?? "",
        roomLabel: room?.room_label ?? "—",
        address: property?.address ?? "—",
        amountDue,
        status,
      };
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const lateCount = rows.filter((r) => r.status === "in_ritardo").length;
  const pendingCount = rows.filter((r) => r.status === "da_registrare").length;

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">Pagamenti</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Affitti attivi e stato dell&apos;incasso per{" "}
            <strong className="text-ink">{monthLabel}</strong>. Segna ogni pagamento man
            mano che arriva — è quello che rende reale il margine mostrato in dashboard.
          </p>
          {(lateCount > 0 || pendingCount > 0) && (
            <p className="mt-2 text-xs text-ink-muted">
              {lateCount > 0 && (
                <span className="mr-3 font-semibold text-sunset-600">
                  {lateCount} in ritardo
                </span>
              )}
              {pendingCount > 0 && <span>{pendingCount} ancora da registrare</span>}
            </p>
          )}
        </header>

        {rows.length === 0 ? (
          <p className="rounded-xl2 bg-surface p-6 text-sm text-ink-muted shadow-card">
            Nessun affitto attivo al momento — quando registrerai il primo affitto su un
            immobile, comparirà qui ogni mese.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <article
                key={row.tenancyId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 bg-surface p-4 shadow-card sm:p-5"
              >
                <div className="min-w-0">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[row.status]}`}
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                  <h3 className="mt-1.5 truncate font-display text-sm font-bold text-ink">
                    {row.studentName}
                  </h3>
                  <p className="truncate text-xs text-ink-muted">
                    {row.roomLabel} · {row.address}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">
                    {Number(row.amountDue).toLocaleString("it-IT")}€
                  </p>
                </div>

                {row.status !== "pagato" && (
                  <div className="flex shrink-0 gap-2">
                    <form action={markPaymentPaid}>
                      <input type="hidden" name="tenancy_id" value={row.tenancyId} />
                      <input type="hidden" name="period_month" value={periodMonth} />
                      <input type="hidden" name="amount_due" value={row.amountDue} />
                      <SubmitButton className="rounded-full bg-sea-600 px-3.5 py-1.5 text-xs font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50">
                        Segna pagato
                      </SubmitButton>
                    </form>
                    {row.status !== "in_ritardo" && (
                      <form action={markPaymentLate}>
                        <input type="hidden" name="tenancy_id" value={row.tenancyId} />
                        <input type="hidden" name="period_month" value={periodMonth} />
                        <input type="hidden" name="amount_due" value={row.amountDue} />
                        <SubmitButton className="rounded-full border border-sunset-500/40 px-3.5 py-1.5 text-xs font-semibold text-sunset-600 transition enabled:hover:bg-sunset-500/10 disabled:opacity-50">
                          Segna in ritardo
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
