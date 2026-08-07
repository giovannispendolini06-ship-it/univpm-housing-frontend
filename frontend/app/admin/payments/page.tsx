import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { labelForPaymentMethod } from "@/lib/rent-payments";
import { markPaymentPaid, markPaymentLate } from "./actions";
import SubmitButton from "@/components/SubmitButton";
import PaymentsStatusFilter from "./PaymentsStatusFilter";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  da_registrare: "In scadenza",
  pagato: "Pagato",
  in_ritardo: "In ritardo",
  fallito: "Fallito",
};

const STATUS_STYLES: Record<string, string> = {
  da_registrare: "bg-sunset-500/15 text-sunset-600",
  pagato: "bg-sea-600 text-white",
  in_ritardo: "bg-sunset-500 text-white",
  fallito: "bg-ink-muted/15 text-ink-muted",
};

const STATUS_ORDER: Record<string, number> = {
  in_ritardo: 0,
  fallito: 1,
  da_registrare: 2,
  pagato: 3,
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ stato?: string }> | { stato?: string };
}) {
  const params = await Promise.resolve(searchParams ?? {});
  const statoFilter = params.stato ?? "";

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
        status: status as string,
        paymentMethod: (payment?.payment_method as string | null) ?? null,
        invoiceUrl: (payment?.stripe_invoice_url as string | null) ?? null,
      };
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const filtered = statoFilter
    ? rows.filter((r) => r.status === statoFilter)
    : rows;

  const lateCount = rows.filter((r) => r.status === "in_ritardo").length;
  const pendingCount = rows.filter((r) => r.status === "da_registrare").length;
  const paidCount = rows.filter((r) => r.status === "pagato").length;
  const failedCount = rows.filter((r) => r.status === "fallito").length;

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
          {(lateCount > 0 || pendingCount > 0 || failedCount > 0) && (
            <p className="mt-2 text-xs text-ink-muted">
              {lateCount > 0 && (
                <span className="mr-3 font-semibold text-sunset-600">
                  {lateCount} in ritardo
                </span>
              )}
              {pendingCount > 0 && (
                <span className="mr-3">{pendingCount} in scadenza</span>
              )}
              {failedCount > 0 && (
                <span className="mr-3 text-ink-muted">{failedCount} falliti</span>
              )}
              {paidCount > 0 && <span>{paidCount} pagati</span>}
            </p>
          )}
        </header>

        <Suspense fallback={null}>
          <PaymentsStatusFilter
            current={statoFilter}
            counts={{
              all: rows.length,
              pagato: paidCount,
              da_registrare: pendingCount,
              in_ritardo: lateCount,
              fallito: failedCount,
            }}
          />
        </Suspense>

        {filtered.length === 0 ? (
          <p className="mt-4 rounded-xl2 bg-surface p-6 text-sm text-ink-muted shadow-card">
            {rows.length === 0
              ? "Nessun affitto attivo al momento — quando registrerai il primo affitto su un immobile, comparirà qui ogni mese."
              : "Nessun pagamento con questo filtro."}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {filtered.map((row) => (
              <article
                key={row.tenancyId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 bg-surface p-4 shadow-card sm:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[row.status] ?? STATUS_STYLES.da_registrare}`}
                    >
                      {STATUS_LABELS[row.status] ?? row.status}
                    </span>
                    {row.paymentMethod && (
                      <span className="rounded-full bg-sea-50 px-2 py-0.5 text-[11px] font-medium text-sea-700">
                        {labelForPaymentMethod(row.paymentMethod)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 truncate font-display text-sm font-bold text-ink">
                    {row.studentName}
                  </h3>
                  <p className="truncate text-xs text-ink-muted">
                    {row.roomLabel} · {row.address}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">
                    {Number(row.amountDue).toLocaleString("it-IT")}€
                  </p>
                  {row.invoiceUrl && (
                    <Link
                      href={row.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-[11px] font-semibold text-sea-700 underline underline-offset-2"
                    >
                      Ricevuta Stripe ↗
                    </Link>
                  )}
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
