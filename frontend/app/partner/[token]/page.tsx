import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import PartnerLandingClient from "./PartnerLandingClient";

export const dynamic = "force-dynamic";

export default async function PartnerTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const db = createServiceSupabaseClient();

  const { data: row } = await db
    .from("crm_partner_tokens")
    .select("*")
    .eq("token", token)
    .is("revoked_at", null)
    .maybeSingle();

  if (!row) notFound();

  // Track click (no PII in logs)
  await db
    .from("crm_partner_tokens")
    .update({
      clicks: (row.clicks ?? 0) + 1,
      last_clicked_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (row.contact_id) {
    await db.from("crm_timeline_events").insert({
      contact_id: row.contact_id,
      event_type: "PARTNER_LINK_CLICKED",
      source: "partner_landing",
      metadata: { tokenId: row.id },
    });

    const { data: contact } = await db
      .from("crm_contacts")
      .select("next_follow_up_at, notes")
      .eq("id", row.contact_id)
      .maybeSingle();

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (!contact?.next_follow_up_at) {
      patch.next_follow_up_at = new Date().toISOString().slice(0, 10);
    }
    const hint = "🔥 Follow-up consigliato: ha cliccato il link partner.";
    if (!contact?.notes?.includes("ha cliccato il link partner")) {
      patch.notes = contact?.notes ? `${contact.notes}\n${hint}` : hint;
    }
    await db.from("crm_contacts").update(patch).eq("id", row.contact_id);
  }

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const wa = waNumber
    ? buildWhatsAppLink(
        waNumber,
        "Ciao! Ho visto Coabito e vorrei inserire / rivendicare un immobile.",
      )
    : null;

  return (
    <PartnerLandingClient
      coabitoLink={SITE_URL}
      whatsappHref={wa}
      onboardingHref={`/partner/${token}/onboarding`}
    />
  );
}

export async function generateMetadata() {
  return {
    title: "Porta il tuo immobile su Coabito",
    description:
      "Pubblica gratuitamente il tuo alloggio sul marketplace Coabito e raggiungi studenti in cerca di casa.",
  };
}
