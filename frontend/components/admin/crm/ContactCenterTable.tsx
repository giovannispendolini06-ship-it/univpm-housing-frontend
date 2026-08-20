"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CRM_CONTACT_TYPE_LABELS,
  CRM_PIPELINE_LABELS,
  CRM_STATUS_STYLES,
  displayContactName,
  primaryPhone,
  type CrmContact,
  type CrmContactStatus,
  type CrmContactType,
} from "@/lib/crm/types";
import WhatsAppButton from "@/components/admin/whatsapp/WhatsAppButton";
import { SITE_URL } from "@/lib/site";
import { updateCrmContactStatus } from "@/app/admin/crm/actions";
import CrmEmailButton from "./CrmEmailButton";

function toWaKind(t: CrmContactType): "owner" | "student" | "agency" {
  if (t === "AGENCY") return "agency";
  if (t === "STUDENT") return "student";
  return "owner";
}

export default function ContactCenterTable({
  contacts,
}: {
  contacts: CrmContact[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return contacts.filter((c) => {
      if (typeFilter && c.contact_type !== typeFilter) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (!query) return true;
      const hay = [
        c.full_name,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.whatsapp_phone,
        c.agency_name,
        c.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [contacts, q, typeFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca nome, email, telefono…"
          className="min-w-[200px] flex-1 rounded-xl border border-sea-100 bg-white px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-sea-100 px-3 py-2 text-sm"
        >
          <option value="">Tutti i tipi</option>
          {(Object.keys(CRM_CONTACT_TYPE_LABELS) as CrmContactType[]).map((t) => (
            <option key={t} value={t}>
              {CRM_CONTACT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-sea-100 px-3 py-2 text-sm"
        >
          <option value="">Tutti gli stati</option>
          {Object.entries(CRM_PIPELINE_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-ink-muted">
        {filtered.length} contatti{pending ? " · Aggiornamento…" : ""}
      </p>

      <div className="overflow-x-auto rounded-xl2 bg-surface shadow-card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-sea-100 text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-3 py-2.5 font-semibold">Contatto</th>
              <th className="px-3 py-2.5 font-semibold">Tipo</th>
              <th className="px-3 py-2.5 font-semibold">Città</th>
              <th className="px-3 py-2.5 font-semibold">Immobili</th>
              <th className="px-3 py-2.5 font-semibold">Stato</th>
              <th className="px-3 py-2.5 font-semibold">Ultimo</th>
              <th className="px-3 py-2.5 font-semibold">Follow-up</th>
              <th className="px-3 py-2.5 font-semibold">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const phone = primaryPhone(c);
              const name = displayContactName(c);
              return (
                <tr key={c.id} className="border-b border-sea-50 last:border-0">
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/crm/contacts/${c.id}`}
                      className="font-semibold text-ink underline-offset-2 hover:underline"
                    >
                      {name}
                    </Link>
                    <p className="text-xs text-ink-muted">
                      {c.email || phone || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-xs text-ink-muted">
                    {CRM_CONTACT_TYPE_LABELS[c.contact_type]}
                  </td>
                  <td className="px-3 py-3 text-xs text-ink-muted">
                    {c.city || "—"}
                  </td>
                  <td className="px-3 py-3 text-xs">{c.property_count ?? 0}</td>
                  <td className="px-3 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => {
                        const next = e.target.value as CrmContactStatus;
                        startTransition(async () => {
                          await updateCrmContactStatus(c.id, next);
                          router.refresh();
                        });
                      }}
                      className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold ${CRM_STATUS_STYLES[c.status] ?? ""}`}
                    >
                      {Object.entries(CRM_PIPELINE_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-xs text-ink-muted">
                    {c.last_contacted_at
                      ? new Date(c.last_contacted_at).toLocaleDateString("it-IT")
                      : "Mai"}
                  </td>
                  <td className="px-3 py-3 text-xs text-ink-muted">
                    {c.next_follow_up_at
                      ? new Date(c.next_follow_up_at).toLocaleDateString("it-IT")
                      : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <WhatsAppButton
                        phone={phone}
                        displayName={name}
                        contactData={{
                          contactType: toWaKind(c.contact_type),
                          firstName: c.first_name,
                          lastName: c.last_name,
                          fullName: name,
                          city: c.city,
                          agencyName: c.agency_name,
                          phone,
                          coabitoLink: SITE_URL,
                        }}
                        entityKind="crm_contact"
                        entityId={c.id}
                        source="crm_contact_center"
                        variant="compact"
                        showMenu
                      />
                      <CrmEmailButton contact={c} compact />
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-semibold text-sea-700"
                        >
                          Chiama
                        </a>
                      )}
                      <Link
                        href={`/admin/crm/contacts/${c.id}`}
                        className="rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-semibold text-sea-700"
                      >
                        Visualizza
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-muted">
            Nessun contatto. Aggiungine uno o importa dalla pipeline.
          </p>
        )}
      </div>
    </div>
  );
}
