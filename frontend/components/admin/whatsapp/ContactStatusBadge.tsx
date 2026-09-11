"use client";

import {
  contactTypeLabel,
  type WhatsAppContactKind,
} from "@/lib/whatsapp-templates";

const STATUS_LABELS: Record<string, string> = {
  whatsapp_opened: "WhatsApp aperto",
  contatto_avviato: "Contatto avviato",
  contacted: "Contattato",
};

export function formatContactStatus(status: string | null | undefined): string {
  if (!status) return "Da contattare";
  return STATUS_LABELS[status] ?? status;
}

export function formatLastContactedAt(
  iso: string | null | undefined,
): string {
  if (!iso) return "Mai";
  try {
    return new Date(iso).toLocaleString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function ContactStatusBadge({
  status,
  contactType,
  compact = false,
}: {
  status?: string | null;
  contactType?: WhatsAppContactKind;
  compact?: boolean;
}) {
  const label = formatContactStatus(status);
  const isOpen = Boolean(status);

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {contactType && !compact && (
        <span className="rounded-full bg-sea-50 px-2 py-0.5 text-[11px] font-semibold text-sea-700">
          {contactTypeLabel(contactType)}
        </span>
      )}
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          isOpen
            ? "bg-[#25D366]/15 text-[#128C7E]"
            : "bg-sand-400/20 text-ink"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
