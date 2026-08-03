"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { recalculateMatchesForRoom } from "@/lib/matching-rooms";

// ---------------------------------------------------------------------------
// Stessa guardia di sicurezza usata in app/admin/leads/actions.ts
// ---------------------------------------------------------------------------
async function assertAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return user;
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------
// Crea un immobile (properties) + la sua prima stanza (rooms) in un solo
// passaggio. Se arriva da un lead esterno (lead_id in formData), collega
// automaticamente il lead all'immobile appena creato, come farebbe
// linkLeadToProperty in app/admin/leads/actions.ts.
// ---------------------------------------------------------------------------
export async function createProperty(formData: FormData) {
  const admin = await assertAdmin();
  const db = createServiceSupabaseClient();

  const address = String(formData.get("address") ?? "").trim();
  const monthlyRentToOwner = numberOrNull(formData.get("monthly_rent_to_owner"));
  if (!address) throw new Error("L'indirizzo è obbligatorio.");
  if (monthlyRentToOwner === null) {
    throw new Error("Il canone al proprietario è obbligatorio.");
  }

  const roomLabel = String(formData.get("room_label") ?? "").trim();
  const roomPrice = numberOrNull(formData.get("price_monthly"));
  if (!roomLabel) throw new Error("Il nome della stanza è obbligatorio.");
  if (roomPrice === null) {
    throw new Error("Il prezzo della stanza è obbligatorio.");
  }

  // --- 1. Crea l'immobile ---------------------------------------------------
  const { data: property, error: propertyError } = await db
    .from("properties")
    .insert({
      owner_id: admin.id, // finché il proprietario reale non ha un account
      address,
      city: String(formData.get("city") ?? "Ancona").trim() || "Ancona",
      zone: String(formData.get("zone") ?? "").trim() || null,
      distance_monte_dago_km: numberOrNull(formData.get("distance_monte_dago_km")),
      distance_torrette_km: numberOrNull(formData.get("distance_torrette_km")),
      distance_centro_km: numberOrNull(formData.get("distance_centro_km")),
      contract_type: String(formData.get("contract_type") ?? "stanza_singola"),
      monthly_rent_to_owner: monthlyRentToOwner,
      guarantee_status: String(formData.get("guarantee_status") ?? "nessuna"),
      deposit_amount: numberOrNull(formData.get("deposit_amount")),
      total_rooms: numberOrNull(formData.get("total_rooms")) ?? 1,
      bathrooms: numberOrNull(formData.get("bathrooms")) ?? 1,
      size_sqm: numberOrNull(formData.get("size_sqm")),
      floor: String(formData.get("floor") ?? "").trim() || null,
      has_elevator: formData.get("has_elevator") === "on",
      is_furnished: formData.get("is_furnished") === "on",
      status: String(formData.get("status") ?? "attivo"),
      owner_contact_name: String(formData.get("owner_contact_name") ?? "").trim() || null,
      owner_contact_phone: String(formData.get("owner_contact_phone") ?? "").trim() || null,
      owner_contact_email: String(formData.get("owner_contact_email") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (propertyError || !property) {
    throw new Error(`Errore nella creazione dell'immobile: ${propertyError?.message}`);
  }

  // --- 2. Crea la prima stanza -----------------------------------------------
  const services = formData.getAll("services_included").map(String);
  const extraService = String(formData.get("extra_service") ?? "").trim();
  if (extraService) services.push(extraService);

  const { data: newRoom, error: roomError } = await db
    .from("rooms")
    .insert({
      property_id: property.id,
      room_label: roomLabel,
      price_monthly: roomPrice,
      estimated_utilities: numberOrNull(formData.get("estimated_utilities")) ?? 0,
      size_sqm: numberOrNull(formData.get("room_size_sqm")),
      has_private_bathroom: formData.get("has_private_bathroom") === "on",
      has_balcony: formData.get("has_balcony") === "on",
      max_occupants: numberOrNull(formData.get("max_occupants")) ?? 1,
      services_included: services,
      is_available: true,
      available_from: String(formData.get("available_from") ?? "").trim() || null,
      status: "attivo",
    })
    .select("id")
    .single();

  if (roomError || !newRoom) {
    throw new Error(`Immobile creato ma errore nella stanza: ${roomError?.message}`);
  }

  // Aggiorna subito la compatibilità per tutti gli studenti già registrati,
  // così questa stanza compare per loro senza dover riscrivere a Nomi.
  await recalculateMatchesForRoom(db, newRoom.id);

  // --- 3. Se veniamo da un lead esterno, colleghiamolo -----------------------
  const leadId = String(formData.get("lead_id") ?? "");
  if (leadId) {
    await db
      .from("leads_external")
      .update({ matched_property_id: property.id, status: "convertito" })
      .eq("id", leadId);
  }

  revalidatePath("/admin/properties");
  revalidatePath("/admin/leads");
  redirect("/admin/properties");
}

// ---------------------------------------------------------------------------
// Carica una o più foto per un immobile già esistente, dentro il bucket
// Storage "property-photos", e salva i link in property_images.
// ---------------------------------------------------------------------------
export async function uploadPropertyImages(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const propertyId = String(formData.get("property_id") ?? "");
  if (!propertyId) throw new Error("ID immobile mancante.");

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    throw new Error("Seleziona almeno una foto prima di caricare.");
  }

  for (const file of files) {
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await db.storage
      .from("property-photos")
      .upload(path, file, { contentType: file.type || "image/jpeg" });

    if (uploadError) {
      throw new Error(`Errore nel caricamento di "${file.name}": ${uploadError.message}`);
    }

    const { data: publicUrlData } = db.storage.from("property-photos").getPublicUrl(path);

    const { error: insertError } = await db.from("property_images").insert({
      property_id: propertyId,
      url: publicUrlData.publicUrl,
    });

    if (insertError) {
      throw new Error(`Foto caricata ma non salvata nel database: ${insertError.message}`);
    }
  }

  revalidatePath(`/admin/properties/${propertyId}`);
}

// ---------------------------------------------------------------------------
// Elimina una singola foto (dal database E dallo Storage).
// ---------------------------------------------------------------------------
export async function deletePropertyImage(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const imageId = String(formData.get("image_id") ?? "");
  const propertyId = String(formData.get("property_id") ?? "");
  if (!imageId) throw new Error("ID foto mancante.");

  const { data: image } = await db
    .from("property_images")
    .select("url")
    .eq("id", imageId)
    .single();

  if (image?.url) {
    const path = image.url.split("/property-photos/")[1];
    if (path) await db.storage.from("property-photos").remove([path]);
  }

  const { error } = await db.from("property_images").delete().eq("id", imageId);
  if (error) throw new Error(`Errore nell'eliminazione della foto: ${error.message}`);

  revalidatePath(`/admin/properties/${propertyId}`);
}

// ---------------------------------------------------------------------------
// Elimina un intero immobile: cancella prima le foto dallo Storage, poi
// l'immobile (le stanze e i record delle foto si cancellano da soli, sono
// collegati con "on delete cascade").
// ---------------------------------------------------------------------------
export async function deleteProperty(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const propertyId = String(formData.get("property_id") ?? "");
  if (!propertyId) throw new Error("ID immobile mancante.");

  const { data: images } = await db
    .from("property_images")
    .select("url")
    .eq("property_id", propertyId);

  const paths = (images ?? [])
    .map((img) => img.url.split("/property-photos/")[1])
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await db.storage.from("property-photos").remove(paths);
  }

  const { error } = await db.from("properties").delete().eq("id", propertyId);
  if (error) throw new Error(`Errore nell'eliminazione dell'immobile: ${error.message}`);

  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}

// ---------------------------------------------------------------------------
// Collega un immobile all'account REALE del proprietario (che deve essersi
// già registrato sul sito scegliendo "Sono proprietario"). Finché non viene
// chiamata questa azione, l'immobile resta assegnato al tuo account admin.
// ---------------------------------------------------------------------------
export async function assignPropertyOwner(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const propertyId = String(formData.get("property_id") ?? "");
  const ownerEmail = String(formData.get("owner_email") ?? "").trim().toLowerCase();

  if (!propertyId || !ownerEmail) {
    throw new Error("Email del proprietario mancante.");
  }

  const { data: ownerUser } = await db
    .from("users")
    .select("id, role")
    .eq("email", ownerEmail)
    .maybeSingle();

  if (!ownerUser) {
    throw new Error(
      "Nessun account trovato con questa email. Il proprietario deve prima registrarsi sul sito scegliendo 'Sono proprietario'.",
    );
  }

  const { error } = await db
    .from("properties")
    .update({ owner_id: ownerUser.id })
    .eq("id", propertyId);

  if (error) throw new Error(`Errore nell'assegnazione: ${error.message}`);

  revalidatePath(`/admin/properties/${propertyId}`);
}

// ---------------------------------------------------------------------------
// Registra un affitto vero: collega uno studente già registrato a una
// stanza specifica. Da questo momento la stanza conta come occupata nei
// calcoli finanziari, e lo studente compare tra gli "Affittuari".
// ---------------------------------------------------------------------------
export async function createTenancy(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const roomId = String(formData.get("room_id") ?? "");
  const propertyId = String(formData.get("property_id") ?? "");
  const studentEmail = String(formData.get("student_email") ?? "").trim().toLowerCase();
  const startedAt =
    String(formData.get("started_at") ?? "").trim() ||
    new Date().toISOString().slice(0, 10);

  if (!roomId || !studentEmail) {
    throw new Error("Email dello studente mancante.");
  }

  const { data: student } = await db
    .from("users")
    .select("id, role")
    .eq("email", studentEmail)
    .maybeSingle();

  if (!student) {
    throw new Error(
      "Nessun account trovato con questa email. Lo studente deve prima registrarsi sul sito.",
    );
  }
  if (student.role !== "student") {
    throw new Error("Questo account non è registrato come studente.");
  }

  const { error: tenancyError } = await db.from("room_tenancies").insert({
    room_id: roomId,
    student_id: student.id,
    started_at: startedAt,
  });
  if (tenancyError) {
    throw new Error(`Errore nella registrazione dell'affitto: ${tenancyError.message}`);
  }

  const { error: roomError } = await db
    .from("rooms")
    .update({ is_available: false })
    .eq("id", roomId);
  if (roomError) {
    throw new Error(`Affitto registrato ma errore nell'aggiornare la stanza: ${roomError.message}`);
  }

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

// ---------------------------------------------------------------------------
// Termina un affitto: la stanza torna disponibile, lo studente resta
// comunque nello storico "Affittuari" (ha affittato, anche se non più ora).
// ---------------------------------------------------------------------------
export async function endTenancy(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const tenancyId = String(formData.get("tenancy_id") ?? "");
  const roomId = String(formData.get("room_id") ?? "");
  const propertyId = String(formData.get("property_id") ?? "");

  if (!tenancyId || !roomId) throw new Error("Dati mancanti.");

  const { error: tenancyError } = await db
    .from("room_tenancies")
    .update({ ended_at: new Date().toISOString().slice(0, 10) })
    .eq("id", tenancyId);
  if (tenancyError) throw new Error(`Errore: ${tenancyError.message}`);

  const { error: roomError } = await db
    .from("rooms")
    .update({ is_available: true })
    .eq("id", roomId);
  if (roomError) throw new Error(`Errore nell'aggiornare la stanza: ${roomError.message}`);

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

// ---------------------------------------------------------------------------
// Aggiorna i dati di un immobile già esistente.
// ---------------------------------------------------------------------------
export async function updateProperty(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const propertyId = String(formData.get("property_id") ?? "");
  if (!propertyId) throw new Error("ID immobile mancante.");

  const address = String(formData.get("address") ?? "").trim();
  const monthlyRentToOwner = numberOrNull(formData.get("monthly_rent_to_owner"));
  if (!address) throw new Error("L'indirizzo è obbligatorio.");
  if (monthlyRentToOwner === null) {
    throw new Error("Il canone al proprietario è obbligatorio.");
  }

  const { error } = await db
    .from("properties")
    .update({
      address,
      city: String(formData.get("city") ?? "Ancona").trim() || "Ancona",
      zone: String(formData.get("zone") ?? "").trim() || null,
      distance_monte_dago_km: numberOrNull(formData.get("distance_monte_dago_km")),
      distance_torrette_km: numberOrNull(formData.get("distance_torrette_km")),
      distance_centro_km: numberOrNull(formData.get("distance_centro_km")),
      contract_type: String(formData.get("contract_type") ?? "stanza_singola"),
      monthly_rent_to_owner: monthlyRentToOwner,
      guarantee_status: String(formData.get("guarantee_status") ?? "nessuna"),
      deposit_amount: numberOrNull(formData.get("deposit_amount")),
      total_rooms: numberOrNull(formData.get("total_rooms")) ?? 1,
      bathrooms: numberOrNull(formData.get("bathrooms")) ?? 1,
      size_sqm: numberOrNull(formData.get("size_sqm")),
      floor: String(formData.get("floor") ?? "").trim() || null,
      has_elevator: formData.get("has_elevator") === "on",
      is_furnished: formData.get("is_furnished") === "on",
      status: String(formData.get("status") ?? "attivo"),
      owner_contact_name: String(formData.get("owner_contact_name") ?? "").trim() || null,
      owner_contact_phone: String(formData.get("owner_contact_phone") ?? "").trim() || null,
      owner_contact_email: String(formData.get("owner_contact_email") ?? "").trim() || null,
    })
    .eq("id", propertyId);

  if (error) throw new Error(`Errore nell'aggiornamento: ${error.message}`);

  revalidatePath(`/admin/properties/${propertyId}`);
  redirect(`/admin/properties/${propertyId}`);
}

// ---------------------------------------------------------------------------
// Aggiorna una stanza esistente.
// ---------------------------------------------------------------------------
export async function updateRoom(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const roomId = String(formData.get("room_id") ?? "");
  const propertyId = String(formData.get("property_id") ?? "");
  if (!roomId) throw new Error("ID stanza mancante.");

  const roomLabel = String(formData.get("room_label") ?? "").trim();
  const roomPrice = numberOrNull(formData.get("price_monthly"));
  if (!roomLabel) throw new Error("Il nome della stanza è obbligatorio.");
  if (roomPrice === null) throw new Error("Il prezzo è obbligatorio.");

  const services = formData.getAll("services_included").map(String);

  const { error } = await db
    .from("rooms")
    .update({
      room_label: roomLabel,
      price_monthly: roomPrice,
      estimated_utilities: numberOrNull(formData.get("estimated_utilities")) ?? 0,
      size_sqm: numberOrNull(formData.get("room_size_sqm")),
      has_private_bathroom: formData.get("has_private_bathroom") === "on",
      has_balcony: formData.get("has_balcony") === "on",
      max_occupants: numberOrNull(formData.get("max_occupants")) ?? 1,
      services_included: services,
      is_available: formData.get("is_available") === "on",
      available_from: String(formData.get("available_from") ?? "").trim() || null,
    })
    .eq("id", roomId);

  if (error) throw new Error(`Errore nell'aggiornamento della stanza: ${error.message}`);

  // Prezzo/servizi potrebbero essere cambiati: aggiorniamo la
  // compatibilità per tutti, non solo per chi tornerà a chattare.
  await recalculateMatchesForRoom(db, roomId);

  revalidatePath(`/admin/properties/${propertyId}`);
}

// ---------------------------------------------------------------------------
// Aggiunge una nuova stanza a un immobile già esistente.
// ---------------------------------------------------------------------------
export async function addRoom(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const propertyId = String(formData.get("property_id") ?? "");
  if (!propertyId) throw new Error("ID immobile mancante.");

  const roomLabel = String(formData.get("room_label") ?? "").trim();
  const roomPrice = numberOrNull(formData.get("price_monthly"));
  if (!roomLabel) throw new Error("Il nome della stanza è obbligatorio.");
  if (roomPrice === null) throw new Error("Il prezzo è obbligatorio.");

  const services = formData.getAll("services_included").map(String);

  const { data: newRoom, error } = await db
    .from("rooms")
    .insert({
      property_id: propertyId,
      room_label: roomLabel,
      price_monthly: roomPrice,
      estimated_utilities: numberOrNull(formData.get("estimated_utilities")) ?? 0,
      size_sqm: numberOrNull(formData.get("room_size_sqm")),
      has_private_bathroom: formData.get("has_private_bathroom") === "on",
      has_balcony: formData.get("has_balcony") === "on",
      max_occupants: numberOrNull(formData.get("max_occupants")) ?? 1,
      services_included: services,
      is_available: true,
      available_from: String(formData.get("available_from") ?? "").trim() || null,
      status: "attivo",
    })
    .select("id")
    .single();

  if (error || !newRoom) throw new Error(`Errore nella creazione della stanza: ${error?.message}`);

  await recalculateMatchesForRoom(db, newRoom.id);

  revalidatePath(`/admin/properties/${propertyId}`);
}
