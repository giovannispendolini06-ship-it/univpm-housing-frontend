"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type LandlordLead,
  LANDLORD_STATUS_OPTIONS,
  LANDLORD_STATUS_STYLES,
  followupUrgency,
  labelForStatus,
  labelForZone,
  type LandlordLeadStatus,
} from "@/lib/landlord-leads";
import { updateLandlordLeadStatus } from "./actions";
import WhatsAppButton from "@/components/admin/whatsapp/WhatsAppButton";
import { splitFullName } from "@/lib/whatsapp-templates";
import { SITE_URL } from "@/lib/site";

function sortLeads(leads: LandlordLead[]): LandlordLead[] {
  const rank = (lead: LandlordLead) => {
    const u = followupUrgency(lead.data_prossimo_followup);
    if (u === "overdue") return 0;
    if (u === "soon") return 1;
    if (u === "later") return 2;
    return 3;
  };

  return [...leads].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    const da = a.data_ultimo_contatto ?? "";
    const db = b.data_ultimo_contatto ?? "";
    if (da !== db) return db.localeCompare(da);
    return b.updated_at.localeCompare(a.updated_at);
  });
}

function FollowupBadge({ date }: { date: string | null }) {
  const urgency = followupUrgency(date);
  if (!date || !urgency) return <span className="text-ink-muted">—</span>;

  const label = new Date(date + "T00:00:00").toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });

  if (urgency === "overdue") {
    return (
      <span className="rounded-full bg-sunset-500 px-2 py-0.5 text-[11px] font-semibold text-white">
        Scaduto {label}
      </span>
    );
  }
  if (urgency === "soon") {
    return (
      <span className="rounded-full bg-sand-400/40 px-2 py-0.5 text-[11px] font-semibold text-ink">
        {label}
      </span>
    );
  }
  return <span className="text-xs text-ink-muted">{label}</span>;
}

export default function PipelineTable({ leads }: { leads: LandlordLead[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statoFilter = searchParams.get("stato") ?? "";
  const followupOnly = searchParams.get("followup") === "1";

  let filtered = leads;
  if (statoFilter) {
    filtered = filtered.filter((l) => l.stato === statoFilter);
  }
  if (followupOnly) {
    filtered = filtered.filter((l) => {
      const u = followupUrgency(l.data_prossimo_followup);
      return u === "overdue" || u === "soon";
    });
  }

  const sorted = sortLeads(filtered);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/pipeline?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("stato", "")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            !statoFilter ? "bg-sea-600 text-white" : "bg-sea-50 text-sea-700"
          }`}
        >
          Tutti ({leads.length})
        </button>
        {LANDLORD_STATUS_OPTIONS.map((o) => {
          const count = leads.filter((l) => l.stato === o.value).length;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setFilter("stato", o.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                statoFilter === o.value
                  ? "bg-sea-600 text-white"
                  : "bg-sea-50 text-sea-700"
              }`}
            >
              {o.label} ({count})
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setFilter("followup", followupOnly ? "" : "1")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            followupOnly ? "bg-sunset-500 text-white" : "bg-sunset-500/15 text-sunset-600"
          }`}
        >
          Follow-up urgenti
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-xl2 bg-surface p-6 text-sm text-ink-muted shadow-card">
          Nessun lead con questi filtri.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl2 bg-surface shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-sea-100 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-3 py-2.5 font-semibold">Nome</th>
                <th className="px-3 py-2.5 font-semibold">Zona</th>
                <th className="px-3 py-2.5 font-semibold">Stato</th>
                <th className="px-3 py-2.5 font-semibold">Follow-up</th>
                <th className="px-3 py-2.5 font-semibold">Prezzo</th>
                <th className="px-3 py-2.5 font-semibold">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((lead) => {
                const { firstName, lastName } = splitFullName(lead.nome);
                return (
                  <tr key={lead.id} className="border-b border-sea-50 last:border-0">
                    <td className="px-3 py-3">
                      <Link
                        href={`/admin/pipeline/${lead.id}`}
                        className="font-semibold text-ink underline-offset-2 hover:underline"
                      >
                        {lead.nome}
                      </Link>
                      <p className="text-xs text-ink-muted">{lead.telefono}</p>
                    </td>
                    <td className="px-3 py-3 text-ink-muted">{labelForZone(lead.zona)}</td>
                    <td className="px-3 py-3">
                      <form action={updateLandlordLeadStatus}>
                        <input type="hidden" name="id" value={lead.id} />
                        <select
                          name="stato"
                          defaultValue={lead.stato}
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                          className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-sea-400 ${LANDLORD_STATUS_STYLES[lead.stato as LandlordLeadStatus] ?? ""}`}
                        >
                          {LANDLORD_STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </form>
                      <span className="sr-only">{labelForStatus(lead.stato)}</span>
                    </td>
                    <td className="px-3 py-3">
                      <FollowupBadge date={lead.data_prossimo_followup} />
                    </td>
                    <td className="px-3 py-3 font-medium text-ink">
                      {lead.prezzo_richiesto != null ? `${lead.prezzo_richiesto}€` : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <WhatsAppButton
                          phone={lead.telefono}
                          displayName={lead.nome}
                          contactData={{
                            contactType: "owner",
                            fullName: lead.nome,
                            firstName,
                            lastName,
                            phone: lead.telefono,
                            propertyName: lead.indirizzo_immobile,
                            propertyLink: lead.link_annuncio,
                            coabitoLink: SITE_URL,
                          }}
                          entityKind="landlord_lead"
                          entityId={lead.id}
                          source="admin_pipeline_table"
                          variant="compact"
                          showMenu
                        />
                        <Link
                          href={`/admin/pipeline/${lead.id}`}
                          className="rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-semibold text-sea-700"
                        >
                          Apri
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
