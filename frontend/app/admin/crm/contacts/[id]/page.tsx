import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import {
  CRM_CONTACT_TYPE_LABELS,
  CRM_PIPELINE_LABELS,
  CRM_PROPERTY_STATUS_OPTIONS,
  CRM_STATUS_STYLES,
  displayContactName,
  primaryPhone,
  type CrmContact,
  type CrmPropertyLead,
  type CrmTimelineEvent,
} from "@/lib/crm/types";
import { timelineLabel } from "@/lib/crm/utils";
import WhatsAppButton from "@/components/admin/whatsapp/WhatsAppButton";
import CrmEmailButton from "@/components/admin/crm/CrmEmailButton";
import CoabitoPresentationCard from "@/components/admin/whatsapp/CoabitoPresentationCard";
import ContactFollowUpControls from "@/components/admin/crm/ContactFollowUpControls";
import ContactOptOutControls from "@/components/admin/crm/ContactOptOutControls";
import PartnerLinkButton from "@/components/admin/crm/PartnerLinkButton";
import EnrollSequenceButton from "@/components/admin/crm/EnrollSequenceButton";
import AddPropertyLeadForm from "@/components/admin/crm/AddPropertyLeadForm";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function CrmContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  const { data: contact } = await db
    .from("crm_contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!contact) notFound();

  const c = contact as CrmContact;
  const name = displayContactName(c);
  const phone = primaryPhone(c);
  const waKind =
    c.contact_type === "AGENCY"
      ? "agency"
      : c.contact_type === "STUDENT"
        ? "student"
        : "owner";

  const [{ data: properties }, { data: timeline }] = await Promise.all([
    db
      .from("crm_property_leads")
      .select("*")
      .or(`contact_id.eq.${id},agency_contact_id.eq.${id}`)
      .order("created_at", { ascending: false }),
    db
      .from("crm_timeline_events")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const leads = (properties ?? []) as CrmPropertyLead[];
  const events = (timeline ?? []) as CrmTimelineEvent[];

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link href="/admin/crm" className="text-sm text-ink-muted underline">
          ← Contact Center
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {CRM_CONTACT_TYPE_LABELS[c.contact_type]}
            </p>
            <h1 className="font-display text-2xl font-bold text-ink">{name}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {[c.email, phone, c.city].filter(Boolean).join(" · ") || "—"}
            </p>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CRM_STATUS_STYLES[c.status]}`}
            >
              {CRM_PIPELINE_LABELS[c.status] ?? c.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <WhatsAppButton
              phone={phone}
              displayName={name}
              contactData={{
                contactType: waKind,
                firstName: c.first_name,
                lastName: c.last_name,
                fullName: name,
                city: c.city,
                agencyName: c.agency_name,
                phone,
                coabitoLink: SITE_URL,
                propertyName: leads[0]?.title || leads[0]?.address,
                propertyLink: leads[0]?.source_url,
              }}
              entityKind="crm_contact"
              entityId={c.id}
              source="crm_contact_detail"
              showMenu
            />
            <CrmEmailButton contact={c} />
            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex min-h-10 items-center rounded-full bg-sea-50 px-3.5 py-2 text-xs font-semibold text-sea-700"
              >
                Chiama
              </a>
            )}
          </div>
        </header>

        {(c.do_not_contact || c.email_opt_out || c.whatsapp_opt_out) && (
          <div className="rounded-xl border border-sunset-500/30 bg-sunset-500/10 px-4 py-3 text-sm text-ink">
            Consensi:{" "}
            {[
              c.do_not_contact && "Non contattare",
              c.email_opt_out && "Email opt-out",
              c.whatsapp_opt_out && "WhatsApp opt-out",
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <ContactFollowUpControls
            contactId={c.id}
            nextFollowUpAt={c.next_follow_up_at}
          />
          <div className="space-y-2 rounded-xl2 bg-surface p-4 shadow-card">
            <PartnerLinkButton contactId={c.id} />
            <EnrollSequenceButton contactId={c.id} />
            <ContactOptOutControls contact={c} />
          </div>
        </div>

        <section className="rounded-xl2 bg-surface p-5 shadow-card">
          <h2 className="font-display text-sm font-bold text-ink">
            Immobili collegati
          </h2>
          {leads.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">Nessun immobile collegato.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {leads.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sea-100 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {p.title || p.address || "Immobile"}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {p.city || "—"}
                      {p.price != null ? ` · ${p.price}€` : ""} ·{" "}
                      {CRM_PROPERTY_STATUS_OPTIONS.find((o) => o.value === p.status)
                        ?.label ?? p.status}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {p.source_url && (
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sea-700 underline"
                      >
                        Fonte
                      </a>
                    )}
                    {p.linked_property_id && (
                      <Link
                        href={`/admin/properties/${p.linked_property_id}`}
                        className="text-sea-700 underline"
                      >
                        Marketplace
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <AddPropertyLeadForm contactId={c.id} contactType={c.contact_type} />
          </div>
        </section>

        <section className="rounded-xl2 bg-surface p-5 shadow-card">
          <h2 className="font-display text-sm font-bold text-ink">Timeline</h2>
          {events.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">Nessun evento ancora.</p>
          ) : (
            <ol className="mt-3 space-y-3">
              {events.map((ev) => (
                <li key={ev.id} className="border-l-2 border-sea-100 pl-3">
                  <p className="text-sm font-medium text-ink">
                    {timelineLabel(ev.event_type)}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {new Date(ev.created_at).toLocaleString("it-IT")}
                    {ev.source ? ` · ${ev.source}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {c.notes && (
          <section className="rounded-xl2 bg-surface p-5 shadow-card">
            <h2 className="font-display text-sm font-bold text-ink">Note</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{c.notes}</p>
          </section>
        )}

        <CoabitoPresentationCard />
      </div>
    </main>
  );
}
