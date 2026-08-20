import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || "").trim();
    if (!token) {
      return NextResponse.json({ error: "Link non valido." }, { status: 400 });
    }

    const db = createServiceSupabaseClient();
    const { data: tok } = await db
      .from("crm_partner_tokens")
      .select("*")
      .eq("token", token)
      .is("revoked_at", null)
      .maybeSingle();

    if (!tok) {
      return NextResponse.json({ error: "Link non valido o scaduto." }, { status: 404 });
    }

    const address = String(body.address || "").trim();
    if (!address) {
      return NextResponse.json(
        { error: "Indirizzo obbligatorio." },
        { status: 400 },
      );
    }

    const claimCode = String(body.claimCode || "").trim();
    let linkedPropertyId: string | null = null;
    let status = "ONBOARDING";

    if (claimCode) {
      // Claim best-effort: cerca property per id o indirizzo simile
      const { data: prop } = await db
        .from("properties")
        .select("id, address")
        .or(`id.eq.${claimCode},address.ilike.%${claimCode}%`)
        .limit(1)
        .maybeSingle();
      if (prop) {
        linkedPropertyId = prop.id;
        status = "CLAIM_PENDING";
      }
    }

    const price = body.price ? Number(body.price) : null;
    const bedrooms = body.bedrooms ? Number(body.bedrooms) : null;

    const { data: lead, error } = await db
      .from("crm_property_leads")
      .insert({
        title: address,
        address,
        city: String(body.city || "Ancona"),
        price: Number.isFinite(price) ? price : null,
        bedrooms: Number.isFinite(bedrooms) ? bedrooms : null,
        description: String(body.notes || "") || null,
        contact_id: tok.contact_id,
        linked_property_id: linkedPropertyId,
        status,
        property_source: "OWNER",
        claimed_at: linkedPropertyId ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Impossibile salvare la richiesta." },
        { status: 500 },
      );
    }

    await db.from("crm_timeline_events").insert({
      contact_id: tok.contact_id,
      property_lead_id: lead.id,
      event_type: linkedPropertyId
        ? "PROPERTY_ONBOARDING_STARTED"
        : "PROPERTY_ONBOARDING_STARTED",
      source: "partner_onboarding",
      metadata: { claim: Boolean(linkedPropertyId) },
    });

    await db
      .from("crm_contacts")
      .update({
        status: "ONBOARDING",
        updated_at: new Date().toISOString(),
        sequence_stopped_at: new Date().toISOString(),
        sequence_stop_reason: "onboarding_started",
      })
      .eq("id", tok.contact_id);

    await db
      .from("crm_sequence_enrollments")
      .update({
        status: "stopped",
        stopped_at: new Date().toISOString(),
        stop_reason: "onboarding_started",
      })
      .eq("contact_id", tok.contact_id)
      .eq("status", "active");

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
      propertyId: linkedPropertyId,
    });
  } catch {
    return NextResponse.json(
      { error: "Operazione non riuscita." },
      { status: 500 },
    );
  }
}
