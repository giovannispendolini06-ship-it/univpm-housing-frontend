"use client";

import { useCallback, useEffect, useId, useState, useTransition } from "react";
import { X } from "lucide-react";
import { createWhatsAppUrl, isValidWhatsAppPhone } from "@/lib/whatsapp";
import {
  buildWhatsAppMessage,
  contactTypeLabel,
  defaultTemplateForContact,
  resolveTemplateVars,
  type WhatsAppContactData,
  type WhatsAppTemplateType,
} from "@/lib/whatsapp-templates";
import { track, trackFunnel } from "@/lib/analytics";
import {
  recordWhatsAppContactStarted,
  type ContactEntityKind,
} from "@/app/admin/whatsapp/actions";
import ContactTemplateSelector from "./ContactTemplateSelector";
import WhatsAppMessagePreview from "./WhatsAppMessagePreview";

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.82c0 4.55-3.7 8.25-8.25 8.25a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.55 3.7-8.25 8.25-8.25M8.5 6.75c-.16 0-.42.06-.65.31-.22.25-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.14 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.09.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.47-.28-.24-.13-1.44-.71-1.66-.79-.22-.08-.39-.13-.55.13-.16.25-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.13-1.03-.38-1.96-1.2-.72-.65-1.21-1.44-1.35-1.69-.14-.24-.01-.37.11-.5.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.13-.55-1.35-.77-1.84-.2-.48-.4-.42-.55-.42h-.15" />
  </svg>
);

export type WhatsAppContactModalProps = {
  open: boolean;
  onClose: () => void;
  phone: string | null | undefined;
  contactData: WhatsAppContactData;
  displayName: string;
  initialTemplate?: WhatsAppTemplateType;
  entityKind?: ContactEntityKind;
  entityId?: string;
  source?: string;
  templateOverrides?: Partial<
    Record<Exclude<WhatsAppTemplateType, "CUSTOM">, string>
  >;
};

export default function WhatsAppContactModal({
  open,
  onClose,
  phone,
  contactData,
  displayName,
  initialTemplate,
  entityKind,
  entityId,
  source = "admin",
  templateOverrides,
}: WhatsAppContactModalProps) {
  const titleId = useId();
  const [template, setTemplate] = useState<WhatsAppTemplateType>(
    initialTemplate ??
      defaultTemplateForContact(contactData.contactType, "first"),
  );
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const phoneOk = isValidWhatsAppPhone(phone);

  const rebuild = useCallback(
    (nextTemplate: WhatsAppTemplateType) => {
      setTemplate(nextTemplate);
      setMessage(
        buildWhatsAppMessage(
          nextTemplate,
          contactData,
          null,
          templateOverrides,
        ),
      );
      track("whatsapp_template_changed", {
        contact_type: contactData.contactType,
        template_type: nextTemplate,
        source,
        contact_id: entityId ?? null,
      });
    },
    [contactData, entityId, source, templateOverrides],
  );

  useEffect(() => {
    if (!open) return;
    const t =
      initialTemplate ??
      defaultTemplateForContact(contactData.contactType, "first");
    setTemplate(t);
    setMessage(buildWhatsAppMessage(t, contactData, null, templateOverrides));
    track("whatsapp_modal_opened", {
      contact_type: contactData.contactType,
      template_type: t,
      source,
      contact_id: entityId ?? null,
    });
    trackFunnel("whatsapp_modal_opened", {
      contact_type: contactData.contactType,
      source,
    });
  }, [open, contactData, initialTemplate, templateOverrides, entityId, source]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const vars = resolveTemplateVars(contactData);

  function openWhatsApp() {
    if (!phoneOk || !phone) return;
    const url = createWhatsAppUrl(phone, message);
    if (!url) return;

    track("whatsapp_contact_clicked", {
      contact_type: contactData.contactType,
      template_type: template,
      source,
      contact_id: entityId ?? null,
    });
    trackFunnel("whatsapp_contact_clicked", {
      contact_type: contactData.contactType,
      template_type: template,
      source,
    });

    startTransition(async () => {
      if (entityKind && entityId) {
        await recordWhatsAppContactStarted({
          entityKind,
          entityId,
          contactType: contactData.contactType,
          contactTemplate: template,
          source,
        });
      }
      track("whatsapp_contact_started", {
        contact_type: contactData.contactType,
        template_type: template,
        source,
        contact_id: entityId ?? null,
      });
      trackFunnel("whatsapp_contact_started", {
        contact_type: contactData.contactType,
        source,
      });
      window.open(url, "_blank", "noopener,noreferrer");
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-sea-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-base font-bold text-ink sm:text-lg"
            >
              Contatta su WhatsApp
            </h2>
            <p className="mt-0.5 truncate text-sm text-ink-muted">
              {displayName || "Contatto"} ·{" "}
              {contactTypeLabel(contactData.contactType)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-sea-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="grid gap-2 rounded-xl bg-sea-50/80 px-3 py-2.5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                Numero
              </p>
              <p className="font-medium text-ink">
                {phoneOk ? phone : "Numero WhatsApp non disponibile"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                Agente
              </p>
              <p className="font-medium text-ink">{vars.agentName}</p>
            </div>
          </div>

          <ContactTemplateSelector
            value={template}
            onChange={(next) => rebuild(next)}
          />

          <WhatsAppMessagePreview value={message} onChange={setMessage} />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-sea-100 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:bg-sea-50"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={!phoneOk || !message.trim() || pending}
            onClick={openWhatsApp}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <WhatsAppIcon size={16} />
            {pending ? "Apertura…" : "Apri WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
