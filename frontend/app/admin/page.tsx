import { redirect } from "next/navigation";
import Link from "next/link";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import AdminInsight from "./AdminInsight";
import AnimatedNumber from "@/components/AnimatedNumber";
import OccupancyChart from "./OccupancyChart";
import RevenueBarChart from "./RevenueBarChart";
import PipelineChart from "./PipelineChart";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl2 bg-surface p-4 shadow-card">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink">
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-ink-muted">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  // --- Verifica accesso: solo admin -----------------------------------------
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

  if (profile?.role !== "admin") redirect("/dashboard");

  // --- Statistiche -----------------------------------------------------------
  const db = createServiceSupabaseClient();

  const [
    { data: properties },
    { data: rooms },
    { data: leads },
    { data: users },
    { data: inquiries },
  ] = await Promise.all([
    db.from("properties").select("id, status, monthly_rent_to_owner"),
    db.from("rooms").select("id, property_id, price_monthly, is_available"),
    db.from("leads_external").select("status"),
    db.from("users").select("role"),
    db.from("owner_inquiries").select("status"),
  ]);

  const propertiesList = properties ?? [];
  const roomsList = rooms ?? [];
  const leadsList = leads ?? [];
  const usersList = users ?? [];
  const inquiriesList = inquiries ?? [];

  const occupiedRooms = roomsList.filter((r) => !r.is_available);
  const monthlyRevenue = occupiedRooms.reduce((sum, r) => sum + Number(r.price_monthly), 0);
  const occupiedPropertyIds = new Set(occupiedRooms.map((r) => r.property_id));
  const monthlyCost = propertiesList
    .filter((p) => occupiedPropertyIds.has(p.id))
    .reduce((sum, p) => sum + Number(p.monthly_rent_to_owner), 0);
  const monthlyMargin = monthlyRevenue - monthlyCost;

  const countByStatus = (status: string) =>
    propertiesList.filter((p) => p.status === status).length;

  const countLeadsByStatus = (status: string) =>
    leadsList.filter((l) => l.status === status).length;

  const countInquiriesByStatus = (status: string) =>
    inquiriesList.filter((i) => i.status === status).length;

  const studentsCount = usersList.filter((u) => u.role === "student").length;

  // Dati per il grafico "pipeline": dove sono ferme le trattative, per
  // entrambe le fonti (annunci esterni tracciati + richieste proprietari).
  const pipelineData = [
    {
      stage: "Nuovi",
      annunci: countLeadsByStatus("nuovo"),
      richieste: countInquiriesByStatus("nuovo"),
    },
    {
      stage: "Contattati",
      annunci: countLeadsByStatus("in_revisione") + countLeadsByStatus("contattato"),
      richieste: countInquiriesByStatus("contattato"),
    },
    {
      stage: "Convertiti",
      annunci: countLeadsByStatus("convertito"),
      richieste: countInquiriesByStatus("convertito"),
    },
  ];

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">
            Ciao{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Ecco la situazione generale in questo momento.
          </p>
        </header>

        {/* --- Analisi AI: la prima cosa che vedi, sempre già pronta --------- */}
        <div className="mb-6">
          <AdminInsight />
        </div>

        {/* --- Finanze --- */}
        <section className="mb-6">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
            Finanze (stima mensile)
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              label="Ricavo dagli studenti"
              value={monthlyRevenue}
              suffix="€"
              hint="Somma prezzi stanze occupate"
            />
            <StatCard
              label="Costo verso proprietari"
              value={monthlyCost}
              suffix="€"
              hint="Canoni degli immobili occupati"
            />
            <StatCard
              label="Margine stimato"
              value={monthlyMargin}
              suffix="€"
              hint={monthlyMargin >= 0 ? "In positivo" : "In negativo"}
            />
          </div>
        </section>

        {/* --- Grafici: occupazione e finanze a colpo d'occhio --------------- */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl2 bg-surface p-4 shadow-card sm:p-5">
            <h3 className="mb-2 font-display text-sm font-bold text-ink">
              Occupazione stanze
            </h3>
            <OccupancyChart
              occupied={occupiedRooms.length}
              free={roomsList.length - occupiedRooms.length}
            />
          </div>
          <div className="rounded-xl2 bg-surface p-4 shadow-card sm:p-5">
            <h3 className="mb-2 font-display text-sm font-bold text-ink">
              Ricavo vs costo vs margine
            </h3>
            <RevenueBarChart revenue={monthlyRevenue} cost={monthlyCost} margin={monthlyMargin} />
          </div>
        </section>

        {/* --- Immobili --- */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
              Immobili
            </h2>
            <Link
              href="/admin/properties"
              className="text-xs font-medium text-sea-700 underline underline-offset-2"
            >
              Vedi tutti →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Attivi (liberi)" value={countByStatus("attivo")} />
            <StatCard label="Affittati" value={countByStatus("affittato")} />
            <StatCard label="In bozza" value={countByStatus("bozza")} />
            <StatCard
              label="Stanze libere"
              value={roomsList.length - occupiedRooms.length}
              hint={`su ${roomsList.length} totali`}
            />
          </div>
        </section>

        {/* --- Pipeline: dove sono ferme le trattative ----------------------- */}
        <section className="mb-6">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
            Pipeline — annunci esterni vs richieste proprietari
          </h2>
          <div className="rounded-xl2 bg-surface p-4 shadow-card sm:p-5">
            <PipelineChart data={pipelineData} />
          </div>
        </section>

        {/* --- Studenti e lead --- */}
        <section className="mb-6">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
            Studenti e annunci esterni
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Studenti registrati" value={studentsCount} />
            <StatCard label="Annunci tracciati" value={leadsList.length} />
            <StatCard label="Da lavorare" value={countLeadsByStatus("nuovo")} />
            <StatCard label="Convertiti" value={countLeadsByStatus("convertito")} />
          </div>
        </section>
      </div>
    </main>
  );
}
