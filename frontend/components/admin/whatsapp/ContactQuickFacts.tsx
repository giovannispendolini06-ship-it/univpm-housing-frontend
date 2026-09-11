"use client";

import ContactStatusBadge, {
  formatLastContactedAt,
} from "./ContactStatusBadge";
import type { WhatsAppContactKind } from "@/lib/whatsapp-templates";

/** Riepilogo veloce scheda contatto (Nome / Tipo / Telefono / Stato / Ultimo). */
export default function ContactQuickFacts({
  name,
  contactType,
  phone,
  status,
  lastContactedAt,
}: {
  name: string;
  contactType: WhatsAppContactKind;
  phone?: string | null;
  status?: string | null;
  lastContactedAt?: string | null;
}) {
  return (
    <div className="grid gap-2 rounded-xl border border-sea-100 bg-sea-50/50 px-3 py-3 text-sm sm:grid-cols-2">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          Nome
        </p>
        <p className="font-semibold text-ink">{name || "—"}</p>
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          Tipo
        </p>
        <ContactStatusBadge contactType={contactType} status={status} />
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          Telefono
        </p>
        <p className="font-medium text-ink">{phone?.trim() || "Non disponibile"}</p>
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          Ultimo contatto
        </p>
        <p className="font-medium text-ink">
          {formatLastContactedAt(lastContactedAt)}
        </p>
      </div>
    </div>
  );
}
