"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertPropertyLead } from "@/app/admin/crm/actions";
import type { CrmContactType } from "@/lib/crm/types";

export default function AddPropertyLeadForm({
  contactId,
  contactType,
}: {
  contactId: string;
  contactType: CrmContactType;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-sea-50 px-3 py-1.5 text-xs font-semibold text-sea-700"
      >
        + Collega immobile
      </button>
    );
  }

  const field =
    "w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none";

  return (
    <form
      className="space-y-2 rounded-xl border border-sea-100 bg-sea-50/40 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          const priceRaw = String(fd.get("price") || "").trim();
          const res = await upsertPropertyLead({
            title: String(fd.get("title") || "") || null,
            address: String(fd.get("address") || "") || null,
            city: String(fd.get("city") || "Ancona") || null,
            price: priceRaw ? Number(priceRaw) : null,
            sourceUrl: String(fd.get("sourceUrl") || "") || null,
            sourceName: String(fd.get("sourceName") || "") || null,
            contactId: contactType === "AGENCY" ? null : contactId,
            agencyContactId: contactType === "AGENCY" ? contactId : null,
            propertySource: contactType === "AGENCY" ? "AGENCY" : "OWNER",
            status: "OWNER_IDENTIFIED",
          });
          if (!res.ok) setError(res.error ?? "Errore");
          else {
            setOpen(false);
            router.refresh();
          }
        });
      }}
    >
      <input name="title" placeholder="Titolo" className={field} />
      <input name="address" placeholder="Indirizzo" className={field} />
      <div className="grid grid-cols-2 gap-2">
        <input name="city" defaultValue="Ancona" className={field} />
        <input name="price" type="number" placeholder="Prezzo" className={field} />
      </div>
      <input name="sourceUrl" placeholder="URL annuncio" className={field} />
      <input name="sourceName" placeholder="Fonte (Idealista…)" className={field} />
      {error && <p className="text-xs text-sunset-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sea-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Salva
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-muted"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}
