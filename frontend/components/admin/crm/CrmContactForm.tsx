"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CRM_CONTACT_TYPE_LABELS,
  CRM_SOURCE_OPTIONS,
  type CrmContactType,
} from "@/lib/crm/types";
import { upsertCrmContact } from "@/app/admin/crm/actions";

export default function CrmContactForm({
  defaultType = "OWNER",
  onCreated,
}: {
  defaultType?: CrmContactType;
  onCreated?: (id: string) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [type, setType] = useState<CrmContactType>(defaultType);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const res = await upsertCrmContact({
        firstName: String(fd.get("firstName") || "") || null,
        lastName: String(fd.get("lastName") || "") || null,
        fullName: String(fd.get("fullName") || "") || null,
        email: String(fd.get("email") || "") || null,
        phone: String(fd.get("phone") || "") || null,
        whatsappPhone: String(fd.get("whatsappPhone") || "") || null,
        contactType: type,
        source: String(fd.get("source") || "MANUAL"),
        city: String(fd.get("city") || "Ancona") || null,
        notes: String(fd.get("notes") || "") || null,
        agencyName: String(fd.get("agencyName") || "") || null,
        website: String(fd.get("website") || "") || null,
        contactPerson: String(fd.get("contactPerson") || "") || null,
        status: "TO_CONTACT",
      });
      if (!res.ok || !res.contact) {
        setError(res.error ?? "Salvataggio non riuscito.");
        return;
      }
      if (res.deduped) setInfo("Contatto già presente: record aggiornato (anti-duplicati).");
      onCreated?.(res.contact.id);
      router.push(`/admin/crm/contacts/${res.contact.id}`);
      router.refresh();
    });
  }

  const field =
    "w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl2 bg-surface p-5 shadow-card">
      <h2 className="font-display text-sm font-bold text-ink">Nuovo contatto</h2>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CrmContactType)}
          className={field}
        >
          {(Object.keys(CRM_CONTACT_TYPE_LABELS) as CrmContactType[]).map((t) => (
            <option key={t} value={t}>
              {CRM_CONTACT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {type === "AGENCY" && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Nome agenzia *
            </label>
            <input name="agencyName" required className={field} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Referente
            </label>
            <input name="contactPerson" className={field} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Sito web
            </label>
            <input name="website" type="url" placeholder="https://" className={field} />
          </div>
        </>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Nome</label>
          <input name="firstName" className={field} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Cognome</label>
          <input name="lastName" className={field} />
        </div>
      </div>

      {type !== "AGENCY" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            Nome completo
          </label>
          <input name="fullName" className={field} />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Telefono</label>
          <input name="phone" type="tel" className={field} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            WhatsApp
          </label>
          <input name="whatsappPhone" type="tel" className={field} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">Email</label>
        <input name="email" type="email" className={field} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Città</label>
          <input name="city" defaultValue="Ancona" className={field} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Origine</label>
          <select name="source" defaultValue="MANUAL" className={field}>
            {CRM_SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">Note</label>
        <textarea name="notes" rows={3} className={field} />
      </div>

      {error && <p className="text-sm text-sunset-600">{error}</p>}
      {info && <p className="text-sm text-sea-700">{info}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white hover:bg-sea-700 disabled:opacity-50"
      >
        {pending ? "Salvataggio…" : "Salva contatto"}
      </button>
    </form>
  );
}
