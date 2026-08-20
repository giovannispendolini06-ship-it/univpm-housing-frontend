import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import type { CrmContact } from "@/lib/crm/types";
import ContactCenterTable from "@/components/admin/crm/ContactCenterTable";
import CrmContactForm from "@/components/admin/crm/CrmContactForm";
import ImportPipelineButton from "@/components/admin/crm/ImportPipelineButton";
import CoabitoPresentationCard from "@/components/admin/whatsapp/CoabitoPresentationCard";
import CrmCsvImport from "@/components/admin/crm/CrmCsvImport";

export const dynamic = "force-dynamic";

export default async function CrmContactCenterPage() {
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

  const db = createServiceSupabaseClient();
  const { data, error } = await db
    .from("crm_contacts")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(500);

  const contacts = (data ?? []) as CrmContact[];
  const missing = Boolean(
    error &&
      (error.code === "PGRST205" || /crm_contacts|schema cache/i.test(error.message)),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueToday = contacts.filter((c) => {
    if (!c.next_follow_up_at) return false;
    return new Date(c.next_follow_up_at) <= new Date(today.getTime() + 86400_000);
  });
  const toContact = contacts.filter(
    (c) => c.status === "NEW" || c.status === "TO_CONTACT",
  );

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              CRM commerciale
            </p>
            <h1 className="font-display text-2xl font-bold text-ink">
              Contact Center
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Centro operativo quotidiano: WhatsApp, email, follow-up.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/crm/pipeline"
              className="rounded-full bg-sea-50 px-4 py-2 text-xs font-semibold text-sea-700"
            >
              Pipeline
            </Link>
            <Link
              href="/admin/crm/dashboard"
              className="rounded-full bg-sea-50 px-4 py-2 text-xs font-semibold text-sea-700"
            >
              Dashboard
            </Link>
            <ImportPipelineButton />
          </div>
        </header>

        {missing && (
          <div className="rounded-xl2 border border-sunset-500/30 bg-sunset-500/10 p-4 text-sm text-ink">
            Tabelle CRM non ancora create. Esegui{" "}
            <code className="text-xs">frontend/supabase/migration_crm_acquisition.sql</code>{" "}
            nel SQL Editor di Supabase, poi ricarica.
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl2 bg-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              🔥 Da fare oggi
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">
              {dueToday.length}
            </p>
            <p className="text-xs text-ink-muted">follow-up in scadenza</p>
          </div>
          <div className="rounded-xl2 bg-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Da contattare
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">
              {toContact.length}
            </p>
            <p className="text-xs text-ink-muted">nuovi / to contact</p>
          </div>
          <div className="rounded-xl2 bg-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Contatti totali
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">
              {contacts.length}
            </p>
            <p className="text-xs text-ink-muted">in CRM</p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ContactCenterTable contacts={contacts} />
          <div className="space-y-4">
            <CrmContactForm />
            <CrmCsvImport />
            <CoabitoPresentationCard />
          </div>
        </div>
      </div>
    </main>
  );
}
