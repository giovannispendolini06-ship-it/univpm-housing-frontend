"use client";

import WhatsAppButton from "@/components/admin/whatsapp/WhatsAppButton";
import ContactQuickFacts from "@/components/admin/whatsapp/ContactQuickFacts";
import CoabitoPresentationCard from "@/components/admin/whatsapp/CoabitoPresentationCard";
import type { ContactEntityKind } from "@/app/admin/whatsapp/actions";
import type {
  WhatsAppContactData,
  WhatsAppTemplateType,
} from "@/lib/whatsapp-templates";

export default function AdminWhatsAppContactPanel({
  phone,
  displayName,
  contactData,
  entityKind,
  entityId,
  source,
  lastContactedAt,
  lastContactStatus,
  templateOverrides,
  showPresentation = true,
  embedded = false,
}: {
  phone: string | null | undefined;
  displayName: string;
  contactData: WhatsAppContactData;
  entityKind: ContactEntityKind;
  entityId: string;
  source: string;
  lastContactedAt?: string | null;
  lastContactStatus?: string | null;
  templateOverrides?: Partial<
    Record<Exclude<WhatsAppTemplateType, "CUSTOM">, string>
  >;
  showPresentation?: boolean;
  /** Se true, niente card esterna (già dentro un contenitore). */
  embedded?: boolean;
}) {
  const body = (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        {!embedded && (
          <h2 className="font-display text-sm font-bold text-ink">
            Contatto rapido
          </h2>
        )}
        {embedded && (
          <h3 className="font-display text-sm font-bold text-ink">
            Contatto rapido WhatsApp
          </h3>
        )}
        <WhatsAppButton
          phone={phone}
          contactData={contactData}
          displayName={displayName}
          entityKind={entityKind}
          entityId={entityId}
          source={source}
          templateOverrides={templateOverrides}
          showMenu
          variant="primary"
        />
      </div>
      <ContactQuickFacts
        name={displayName}
        contactType={contactData.contactType}
        phone={phone}
        status={lastContactStatus}
        lastContactedAt={lastContactedAt}
      />
    </>
  );

  return (
    <div className="space-y-4">
      {embedded ? (
        <div className="rounded-xl border border-sea-100 bg-sea-50/40 p-4">{body}</div>
      ) : (
        <div className="rounded-xl2 bg-surface p-5 shadow-card">{body}</div>
      )}
      {showPresentation && <CoabitoPresentationCard />}
    </div>
  );
}
