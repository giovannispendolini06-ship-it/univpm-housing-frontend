"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { isValidWhatsAppPhone } from "@/lib/whatsapp";
import {
  defaultTemplateForContact,
  type WhatsAppContactData,
  type WhatsAppTemplateType,
} from "@/lib/whatsapp-templates";
import { track } from "@/lib/analytics";
import type { ContactEntityKind } from "@/app/admin/whatsapp/actions";
import WhatsAppContactModal from "./WhatsAppContactModal";

const WhatsAppIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.82c0 4.55-3.7 8.25-8.25 8.25a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.55 3.7-8.25 8.25-8.25M8.5 6.75c-.16 0-.42.06-.65.31-.22.25-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.14 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.09.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.47-.28-.24-.13-1.44-.71-1.66-.79-.22-.08-.39-.13-.55.13-.16.25-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.13-1.03-.38-1.96-1.2-.72-.65-1.21-1.44-1.35-1.69-.14-.24-.01-.37.11-.5.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.13-.55-1.35-.77-1.84-.2-.48-.4-.42-.55-.42h-.15" />
  </svg>
);

export type WhatsAppButtonProps = {
  phone: string | null | undefined;
  contactData: WhatsAppContactData;
  displayName: string;
  entityKind?: ContactEntityKind;
  entityId?: string;
  source?: string;
  /** Mostra menu Contatta (primo / follow-up / personalizzato) */
  showMenu?: boolean;
  /** Variante CTA principale o compatta (tabelle) */
  variant?: "primary" | "compact";
  className?: string;
  templateOverrides?: Partial<
    Record<Exclude<WhatsAppTemplateType, "CUSTOM">, string>
  >;
};

export default function WhatsAppButton({
  phone,
  contactData,
  displayName,
  entityKind,
  entityId,
  source = "admin",
  showMenu = true,
  variant = "primary",
  className = "",
  templateOverrides,
}: WhatsAppButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialTemplate, setInitialTemplate] = useState<WhatsAppTemplateType>(
    defaultTemplateForContact(contactData.contactType, "first"),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const phoneOk = isValidWhatsAppPhone(phone);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  function openWith(mode: "first" | "follow_up" | "custom") {
    const t = defaultTemplateForContact(contactData.contactType, mode);
    setInitialTemplate(t);
    setMenuOpen(false);
    setModalOpen(true);
    track("whatsapp_contact_clicked", {
      contact_type: contactData.contactType,
      template_type: t,
      source,
      contact_id: entityId ?? null,
      phase: "button",
    });
  }

  const disabledTitle = "Numero WhatsApp non disponibile";

  const primaryClass =
    variant === "primary"
      ? "inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-2 text-xs font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
      : "inline-flex min-h-8 items-center gap-1 rounded-full bg-[#25D366]/15 px-2.5 py-1 text-[11px] font-semibold text-[#128C7E] transition hover:bg-[#25D366]/25 disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <div className="inline-flex overflow-hidden rounded-full shadow-sm">
        <button
          type="button"
          disabled={!phoneOk}
          title={phoneOk ? "Contatta su WhatsApp" : disabledTitle}
          aria-label={phoneOk ? "Contatta su WhatsApp" : disabledTitle}
          onClick={() => openWith("first")}
          className={`${primaryClass} ${showMenu && phoneOk ? "rounded-r-none" : ""}`}
        >
          <WhatsAppIcon size={variant === "compact" ? 12 : 14} />
          {variant === "compact" ? "WhatsApp" : "Contatta su WhatsApp"}
        </button>
        {showMenu && (
          <button
            type="button"
            disabled={!phoneOk}
            title={phoneOk ? "Altre opzioni contatto" : disabledTitle}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => phoneOk && setMenuOpen((v) => !v)}
            className={
              variant === "primary"
                ? "inline-flex min-h-10 items-center border-l border-white/25 bg-[#25D366] px-2 text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
                : "inline-flex min-h-8 items-center border-l border-[#128C7E]/20 bg-[#25D366]/15 px-1.5 text-[#128C7E] transition hover:bg-[#25D366]/25 disabled:cursor-not-allowed disabled:opacity-45"
            }
          >
            <ChevronDown size={14} />
          </button>
        )}
      </div>

      {!phoneOk && (
        <span className="sr-only">{disabledTitle}</span>
      )}

      {menuOpen && phoneOk && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1.5 min-w-[200px] overflow-hidden rounded-xl border border-sea-100 bg-white py-1 shadow-lg"
        >
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Contatta
          </p>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2.5 text-left text-sm text-ink transition hover:bg-sea-50"
            onClick={() => openWith("first")}
          >
            Primo contatto
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2.5 text-left text-sm text-ink transition hover:bg-sea-50"
            onClick={() => openWith("follow_up")}
          >
            Follow-up
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2.5 text-left text-sm text-ink transition hover:bg-sea-50"
            onClick={() => openWith("custom")}
          >
            Personalizzato
          </button>
        </div>
      )}

      <WhatsAppContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        phone={phone}
        contactData={contactData}
        displayName={displayName}
        initialTemplate={initialTemplate}
        entityKind={entityKind}
        entityId={entityId}
        source={source}
        templateOverrides={templateOverrides}
      />
    </div>
  );
}
