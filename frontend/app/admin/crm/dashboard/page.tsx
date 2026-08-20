import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import type { CrmContact, CrmPropertyLead } from "@/lib/crm/types";

export const dynamic = "force-dynamic";

function rate(part: number, total: number): string {
  if (!total) return "—";
  return `${Math.round((part / total) * 100)}%`;
}

export default async function CrmDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range = "30" } = await searchParams;
  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await auth
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const days = range === "7" ? 7 : range === "1" ? 1 : range === "90" ? 90 : 30;
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const db = createServiceSupabaseClient();
  const [
    { data: contacts },
    { data: leads },
    { data: events },
  ] = await Promise.all([
    db.from("crm_contacts").select("*").limit(2000),
    db.from("crm_property_leads").select("*").limit(2000),
    db
      .from("crm_timeline_events")
      .select("event_type, created_at, metadata")
      .gte("created_at", since)
      .limit(5000),
  ]);

  const all = (contacts ?? []) as CrmContact[];
  const props = (leads ?? []) as CrmPropertyLead[];
  const ev = events ?? [];

  const owners = all.filter((c) => c.contact_type === "OWNER");
  const agencies = all.filter((c) => c.contact_type === "AGENCY");
  const convertedOwners = owners.filter((c) => c.status === "CONVERTED").length;
  const partnerAgencies = agencies.filter(
    (c) => c.status === "PARTNER" || c.status === "CONVERTED",
  ).length;
  const published = props.filter((c) => c.status === "PUBLISHED").length;
  const due = all.filter(
    (c) =>
      c.next_follow_up_at &&
      new Date(c.next_follow_up_at).getTime() <= Date.now() + 86400_000,
  ).length;

  const contacted = all.filter((c) =>
    ["CONTACTED", "REPLIED", "INTERESTED", "ONBOARDING", "CONVERTED", "PARTNER"].includes(
      c.status,
    ),
  ).length;
  const replied = all.filter((c) =>
    ["REPLIED", "INTERESTED", "ONBOARDING", "CONVERTED", "PARTNER"].includes(c.status),
  ).length;
  const interested = all.filter((c) =>
    ["INTERESTED", "ONBOARDING", "CONVERTED", "PARTNER"].includes(c.status),
  ).length;
  const onboarding = all.filter((c) =>
    ["ONBOARDING", "CONVERTED", "PARTNER"].includes(c.status),
  ).length;
  const converted = all.filter((c) =>
    ["CONVERTED", "PARTNER"].includes(c.status),
  ).length;

  const emailsSent = ev.filter((e) => e.event_type === "EMAIL_SENT").length;
  const waOpened = ev.filter((e) => e.event_type === "WHATSAPP_OPENED").length;

  const kpis = [
    { label: "Contatti totali", value: all.length },
    { label: "Proprietari acquisiti", value: convertedOwners },
    { label: "Agenzie partner", value: partnerAgencies },
    { label: "Immobili leads", value: props.length },
    { label: "Immobili pubblicati", value: published },
    { label: "Da seguire", value: due },
    { label: `Email inviate (${days}g)`, value: emailsSent },
    { label: `WhatsApp aperti (${days}g)`, value: waOpened },
    { label: "Interessati", value: interested },
    { label: "Conversioni", value: converted },
  ];

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link href="/admin/crm" className="text-sm text-ink-muted underline">
              ← Contact Center
            </Link>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink">
              Acquisition Dashboard
            </h1>
          </div>
          <div className="flex gap-2">
            {[
              { v: "1", l: "Oggi" },
              { v: "7", l: "7 giorni" },
              { v: "30", l: "30 giorni" },
              { v: "90", l: "90 giorni" },
            ].map((r) => (
              <Link
                key={r.v}
                href={`/admin/crm/dashboard?range=${r.v}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  String(days) === r.v || (r.v === "30" && days === 30 && range === "30")
                    ? "bg-sea-600 text-white"
                    : "bg-sea-50 text-sea-700"
                }`}
              >
                {r.l}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl2 bg-surface p-4 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {k.label}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {k.value}
              </p>
            </div>
          ))}
        </div>

        <section className="rounded-xl2 bg-surface p-5 shadow-card">
          <h2 className="font-display text-sm font-bold text-ink">Funnel</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Contatti → Contattati → Risposte → Interessati → Onboarding → Convertiti
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { l: "Contatti", n: all.length },
              { l: "Contattati", n: contacted, r: rate(contacted, all.length) },
              { l: "Risposte", n: replied, r: rate(replied, contacted) },
              { l: "Interessati", n: interested, r: rate(interested, replied) },
              { l: "Onboarding", n: onboarding, r: rate(onboarding, interested) },
              { l: "Convertiti", n: converted, r: rate(converted, onboarding) },
            ].map((s) => (
              <li
                key={s.l}
                className="rounded-xl border border-sea-100 bg-sea-50/50 px-3 py-3 text-center"
              >
                <p className="text-[11px] text-ink-muted">{s.l}</p>
                <p className="font-display text-xl font-bold text-ink">{s.n}</p>
                {"r" in s && s.r && (
                  <p className="text-[11px] text-sea-700">{s.r}</p>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-ink-muted">
            Conversion rate overall:{" "}
            <span className="font-semibold text-ink">
              {rate(converted, all.length)}
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}
