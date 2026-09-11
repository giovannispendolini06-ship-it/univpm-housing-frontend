"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { recalculateMatchesForRoom } from "@/lib/matching-rooms";
import { assertEscrowDoesNotBlockPublish } from "@/lib/escrow";
import {
  isContractDurationType,
  isPropertyType,
  isWholeUnitProperty,
  legacyContractType,
  minMonthsFromDuration,
  roomTypeFromPropertyType,
} from "@/lib/property-listing";

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Extends the existing /owner surface: self-serve property + first room.
 * Legacy monthly_rent_to_owner is set equal to room price as a quarantine
 * placeholder (marketplace: student pays owner directly).
 *
 * Escrow / Stripe Connect are optional — never required to create or publish.
 */
export async function createOwnerListing(
  formData: FormData,
): Promise<{ error?: string }> {
  assertEscrowDoesNotBlockPublish();
  const session = await requireRole(["owner"]);
  const db = createServiceSupabaseClient();

  const address = String(formData.get("address") ?? "").trim();
  const zone = String(formData.get("zone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const roomLabel = String(formData.get("room_label") ?? "").trim();
  const price = numberOrNull(formData.get("price_monthly"));
  const utilities = numberOrNull(formData.get("estimated_utilities")) ?? 0;
  const deposit = numberOrNull(formData.get("deposit_amount"));
  const availableFrom =
    String(formData.get("available_from") ?? "").trim() || null;
  const availableUntil =
    String(formData.get("available_until") ?? "").trim() || null;
  const publish = formData.get("publish") === "on";

  const propertyTypeRaw = String(
    formData.get("property_type") ?? "stanza_singola",
  );
  const propertyType = isPropertyType(propertyTypeRaw)
    ? propertyTypeRaw
    : "stanza_singola";
  const durationRaw = String(
    formData.get("contract_duration_type") ?? "anno_accademico",
  );
  const contractDurationType = isContractDurationType(durationRaw)
    ? durationRaw
    : "anno_accademico";
  const wholeUnit = isWholeUnitProperty(propertyType);
  const totalRooms = wholeUnit
    ? 1
    : Math.max(1, numberOrNull(formData.get("total_rooms")) ?? 2);
  const roomType = roomTypeFromPropertyType(propertyType);
  const minContractMonths = minMonthsFromDuration(contractDurationType);

  if (!address) return { error: "Indirizzo obbligatorio (resta privato in pubblico)." };
  if (!zone) return { error: "Zona / quartiere obbligatorio (visibile in annuncio)." };
  if (!city) return { error: "Città obbligatoria." };
  if (!roomLabel) return { error: "Nome stanza obbligatorio." };
  if (price === null || price < 50) return { error: "Prezzo mensile non valido." };

  const services = formData.getAll("services_included").map(String);

  const { data: property, error: propertyError } = await db
    .from("properties")
    .insert({
      owner_id: session.id,
      address,
      city,
      zone,
      contract_type: legacyContractType(propertyType),
      property_type: propertyType,
      contract_duration_type: contractDurationType,
      available_until: availableUntil,
      min_contract_months: minContractMonths,
      // Legacy quarantine field — ops economics for seed supply when applicable
      monthly_rent_to_owner: price,
      guarantee_status: "nessuna",
      guaranteed_rent: false,
      deposit_amount: deposit,
      total_rooms: totalRooms,
      bathrooms: numberOrNull(formData.get("bathrooms")) ?? 1,
      is_furnished: formData.get("is_furnished") === "on",
      status: publish ? "attivo" : "bozza",
      owner_contact_name: session.fullName,
      owner_contact_email: session.email,
    })
    .select("id")
    .single();

  if (propertyError || !property) {
    return { error: propertyError?.message ?? "Errore creazione immobile." };
  }

  const { data: room, error: roomError } = await db
    .from("rooms")
    .insert({
      property_id: property.id,
      room_label: roomLabel,
      price_monthly: price,
      estimated_utilities: utilities,
      has_private_bathroom: formData.get("has_private_bathroom") === "on",
      has_balcony: formData.get("has_balcony") === "on",
      max_occupants: wholeUnit ? 1 : propertyType === "stanza_doppia" ? 2 : 1,
      room_type: roomType,
      services_included: services,
      is_available: publish,
      available_from: availableFrom,
      status: publish ? "attivo" : "bozza",
    })
    .select("id")
    .single();

  if (roomError || !room) {
    return { error: roomError?.message ?? "Immobile creato ma stanza fallita." };
  }

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const ext = photo.name.split(".").pop() || "jpg";
    const path = `${property.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await db.storage
      .from("property-photos")
      .upload(path, photo, { contentType: photo.type || "image/jpeg", upsert: true });
    if (!upErr) {
      const { data: urlData } = db.storage.from("property-photos").getPublicUrl(path);
      await db.from("property_images").insert({
        property_id: property.id,
        url: urlData.publicUrl,
        sort_order: 0,
      });
    }
  }

  if (publish) {
    try {
      await recalculateMatchesForRoom(db, room.id, true);
    } catch (err) {
      console.error("[owner/properties] match recalc", err);
    }
  }

  revalidatePath("/owner");
  revalidatePath("/owner/properties");
  revalidatePath("/stanze");
  redirect(`/owner/properties/${property.id}`);
}

export async function publishOwnerProperty(formData: FormData): Promise<void> {
  // POLICY: do not check Stripe Connect, escrow rows, or coverage before publish.
  assertEscrowDoesNotBlockPublish();
  const session = await requireRole(["owner"]);
  const db = createServiceSupabaseClient();
  const propertyId = String(formData.get("property_id") ?? "");
  if (!propertyId) return;

  const { data: property } = await db
    .from("properties")
    .select("id, owner_id")
    .eq("id", propertyId)
    .single();
  if (!property || property.owner_id !== session.id) redirect("/owner");

  await db.from("properties").update({ status: "attivo" }).eq("id", propertyId);
  await db
    .from("rooms")
    .update({ status: "attivo", is_available: true })
    .eq("property_id", propertyId);

  const { data: rooms } = await db
    .from("rooms")
    .select("id")
    .eq("property_id", propertyId);
  for (const r of rooms ?? []) {
    try {
      await recalculateMatchesForRoom(db, r.id, true);
    } catch {
      /* ignore */
    }
  }

  revalidatePath("/owner");
  revalidatePath(`/owner/properties/${propertyId}`);
  revalidatePath("/stanze");
  redirect(`/owner/properties/${propertyId}`);
}

/** Pause or reactivate a property listing owned by the current owner. */
export async function setOwnerPropertyStatus(formData: FormData): Promise<void> {
  const session = await requireRole(["owner"]);
  const db = createServiceSupabaseClient();
  const propertyId = String(formData.get("property_id") ?? "").trim();
  const nextStatus = String(formData.get("status") ?? "").trim();
  if (!propertyId || !["attivo", "sospeso"].includes(nextStatus)) return;

  const { data: property } = await db
    .from("properties")
    .select("id, owner_id")
    .eq("id", propertyId)
    .maybeSingle();
  if (!property || property.owner_id !== session.id) return;

  await db.from("properties").update({ status: nextStatus }).eq("id", propertyId);

  if (nextStatus === "sospeso") {
    await db
      .from("rooms")
      .update({ is_available: false })
      .eq("property_id", propertyId);
  } else {
    // Reactivate only rooms without an active tenancy
    const { data: rooms } = await db
      .from("rooms")
      .select("id")
      .eq("property_id", propertyId);
    const roomIds = (rooms ?? []).map((r) => r.id as string);
    if (roomIds.length > 0) {
      const { data: active } = await db
        .from("room_tenancies")
        .select("room_id")
        .in("room_id", roomIds)
        .is("ended_at", null);
      const occupied = new Set((active ?? []).map((t) => String(t.room_id)));
      for (const id of roomIds) {
        if (occupied.has(id)) continue;
        await db.from("rooms").update({ is_available: true }).eq("id", id);
      }
    }
  }

  revalidatePath("/owner");
  revalidatePath(`/owner/properties/${propertyId}`);
  revalidatePath("/stanze");
}
