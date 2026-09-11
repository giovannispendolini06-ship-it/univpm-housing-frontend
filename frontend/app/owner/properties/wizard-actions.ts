"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { recalculateMatchesForRoom } from "@/lib/matching-rooms";
import { assertEscrowDoesNotBlockPublish } from "@/lib/escrow";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";
import {
  calculateMatchScore,
  type StudentProfileRow,
} from "@/lib/matching";
import type { SeekerRole } from "@/lib/auth/roles";
import {
  isContractDurationType,
  isPropertyType,
  isWholeUnitProperty,
  legacyContractType,
  minMonthsFromDuration,
  roomTypeFromPropertyType,
  type ContractDurationType,
  type PropertyType,
} from "@/lib/property-listing";
import { isPartnerOrAbove, type PartnerTier } from "@/lib/partner-tier";
import { geocodeAddress } from "@/lib/mapbox-geocoding";
import {
  EMPTY_WIZARD_DRAFT,
  LOW_DEMAND_THRESHOLD,
  type ListingWizardDraft,
  type TargetAudience,
} from "@/components/owner/publish/wizard-types";

function isTargetAudience(value: string): value is TargetAudience {
  return value === "studenti" || value === "lavoratori" || value === "entrambi";
}

function normalizeDraft(raw: ListingWizardDraft): ListingWizardDraft {
  return {
    ...EMPTY_WIZARD_DRAFT,
    ...raw,
    propertyType: isPropertyType(raw.propertyType)
      ? raw.propertyType
      : "stanza_singola",
    contractDurationType: isContractDurationType(raw.contractDurationType)
      ? raw.contractDurationType
      : "anno_accademico",
    targetAudience: isTargetAudience(raw.targetAudience)
      ? raw.targetAudience
      : "entrambi",
    nearbyPois: Array.isArray(raw.nearbyPois) ? raw.nearbyPois : [],
    servicesIncluded: Array.isArray(raw.servicesIncluded)
      ? raw.servicesIncluded
      : [],
  };
}

async function resolveCityId(
  db: ReturnType<typeof createServiceSupabaseClient>,
  cityName: string,
): Promise<string | null> {
  const name = cityName.trim();
  if (!name) return null;
  const { data } = await db
    .from("cities")
    .select("id")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

function buildPropertyRow(
  draft: ListingWizardDraft,
  ownerId: string,
  status: "bozza" | "attivo",
  fullName: string | null,
  email: string | null,
  cityId: string | null,
) {
  const wholeUnit = isWholeUnitProperty(draft.propertyType);
  return {
    owner_id: ownerId,
    address: draft.address,
    city: draft.city || null,
    zone: draft.zone || draft.city || null,
    city_id: cityId,
    latitude: draft.latitude,
    longitude: draft.longitude,
    contract_type: legacyContractType(draft.propertyType),
    property_type: draft.propertyType,
    contract_duration_type: draft.contractDurationType,
    available_until: draft.availableUntil || null,
    min_contract_months: minMonthsFromDuration(draft.contractDurationType),
    monthly_rent_to_owner: Math.max(0, Math.round(draft.priceMonthly ?? 0)),
    guarantee_status: "nessuna" as const,
    guaranteed_rent: false,
    deposit_amount: draft.depositAmount,
    total_rooms: wholeUnit ? 1 : Math.max(1, draft.totalRooms || 1),
    bathrooms: 1,
    is_furnished: draft.isFurnished,
    status,
    owner_contact_name: fullName,
    owner_contact_email: email,
    description: draft.description || null,
    virtual_tour_url: draft.virtualTourUrl.trim() || null,
    target_audience: draft.targetAudience,
    size_sqm: draft.sizeSqm,
    floor_number: draft.floorNumber,
    highlights: draft.highlights || null,
    nearby_pois: draft.nearbyPois,
    wizard_draft: status === "bozza" ? draft : null,
  };
}

function buildRoomRow(
  draft: ListingWizardDraft,
  propertyId: string,
  status: "bozza" | "attivo",
) {
  const wholeUnit = isWholeUnitProperty(draft.propertyType);
  return {
    property_id: propertyId,
    room_label: draft.roomLabel || (wholeUnit ? "Unità" : "Camera"),
    price_monthly: Math.max(0, Math.round(draft.priceMonthly ?? 0)),
    estimated_utilities: Math.max(0, Math.round(draft.estimatedUtilities || 0)),
    has_private_bathroom: draft.hasPrivateBathroom,
    has_balcony: draft.hasBalcony,
    max_occupants: wholeUnit
      ? 1
      : draft.propertyType === "stanza_doppia"
        ? 2
        : 1,
    room_type: roomTypeFromPropertyType(draft.propertyType),
    services_included: draft.servicesIncluded,
    is_available: status === "attivo",
    available_from: draft.availableFrom || null,
    status,
    description: draft.description || null,
  };
}

export async function saveListingWizardDraft(draftInput: ListingWizardDraft) {
  const session = await requireRole(["owner"]);
  assertEscrowDoesNotBlockPublish();
  const db = createServiceSupabaseClient();
  const draft = normalizeDraft(draftInput);

  if (!draft.address.trim()) {
    return { error: "Indirizzo obbligatorio." };
  }

  const cityId = await resolveCityId(db, draft.city);
  const propertyRow = buildPropertyRow(
    draft,
    session.id,
    "bozza",
    session.fullName,
    session.email,
    cityId,
  );

  if (draft.propertyId) {
    const { data: existing } = await db
      .from("properties")
      .select("id, owner_id, status")
      .eq("id", draft.propertyId)
      .maybeSingle();
    if (!existing || existing.owner_id !== session.id) {
      return { error: "Bozza non trovata." };
    }
    if (existing.status !== "bozza") {
      return { error: "Solo le bozze possono essere aggiornate da qui." };
    }

    const { error: pErr } = await db
      .from("properties")
      .update(propertyRow)
      .eq("id", draft.propertyId);
    if (pErr) return { error: pErr.message };

    if (draft.roomId) {
      const { error: rErr } = await db
        .from("rooms")
        .update(buildRoomRow(draft, draft.propertyId, "bozza"))
        .eq("id", draft.roomId);
      if (rErr) return { error: rErr.message };
      revalidatePath("/owner/properties");
      return { propertyId: draft.propertyId, roomId: draft.roomId };
    }

    const { data: room, error: rErr } = await db
      .from("rooms")
      .insert(buildRoomRow(draft, draft.propertyId, "bozza"))
      .select("id")
      .single();
    if (rErr || !room) return { error: rErr?.message ?? "Errore stanza." };
    revalidatePath("/owner/properties");
    return { propertyId: draft.propertyId, roomId: room.id as string };
  }

  const { data: property, error: pErr } = await db
    .from("properties")
    .insert(propertyRow)
    .select("id")
    .single();
  if (pErr || !property) {
    return { error: pErr?.message ?? "Errore salvataggio bozza." };
  }

  const { data: room, error: rErr } = await db
    .from("rooms")
    .insert(buildRoomRow(draft, property.id, "bozza"))
    .select("id")
    .single();
  if (rErr || !room) {
    return { error: rErr?.message ?? "Bozza creata ma stanza fallita." };
  }

  if (draft.photoUrl) {
    await db.from("property_images").insert({
      property_id: property.id,
      url: draft.photoUrl,
      sort_order: 0,
    });
  }

  revalidatePath("/owner/properties");
  return { propertyId: property.id as string, roomId: room.id as string };
}

export async function publishListingFromWizard(
  draftInput: ListingWizardDraft,
  publish: boolean,
) {
  const session = await requireRole(["owner"]);
  assertEscrowDoesNotBlockPublish();
  const db = createServiceSupabaseClient();
  const draft = normalizeDraft(draftInput);

  if (!draft.address || draft.latitude == null || draft.longitude == null) {
    return { error: "Seleziona un indirizzo dall'autocomplete Mapbox." };
  }
  if (!draft.roomLabel.trim()) {
    return { error: "Titolo annuncio obbligatorio." };
  }
  if (!draft.priceMonthly || draft.priceMonthly < 50) {
    return { error: "Canone mensile non valido (≥ 50€)." };
  }
  if (publish && !draft.description.trim()) {
    return { error: "Aggiungi o genera una descrizione prima di pubblicare." };
  }
  if (draft.virtualTourUrl.trim()) {
    try {
      // eslint-disable-next-line no-new
      new URL(draft.virtualTourUrl.trim());
    } catch {
      return { error: "Link tour virtuale non valido (usa un URL completo)." };
    }
  }

  const status = publish ? "attivo" : "bozza";
  const cityId = await resolveCityId(db, draft.city);
  const propertyRow = buildPropertyRow(
    draft,
    session.id,
    status,
    session.fullName,
    session.email,
    cityId,
  );

  let propertyId = draft.propertyId;
  let roomId = draft.roomId;

  if (propertyId) {
    const { data: existing } = await db
      .from("properties")
      .select("id, owner_id")
      .eq("id", propertyId)
      .maybeSingle();
    if (!existing || existing.owner_id !== session.id) {
      return { error: "Annuncio non trovato." };
    }
    const { error: pErr } = await db
      .from("properties")
      .update(propertyRow)
      .eq("id", propertyId);
    if (pErr) return { error: pErr.message };

    const roomRow = buildRoomRow(draft, propertyId, status);
    if (roomId) {
      const { error: rErr } = await db
        .from("rooms")
        .update(roomRow)
        .eq("id", roomId);
      if (rErr) return { error: rErr.message };
    } else {
      const { data: room, error: rErr } = await db
        .from("rooms")
        .insert(roomRow)
        .select("id")
        .single();
      if (rErr || !room) return { error: rErr?.message ?? "Errore stanza." };
      roomId = room.id as string;
    }
  } else {
    const { data: property, error: pErr } = await db
      .from("properties")
      .insert(propertyRow)
      .select("id")
      .single();
    if (pErr || !property) {
      return { error: pErr?.message ?? "Salvataggio fallito." };
    }
    propertyId = property.id as string;
    const { data: room, error: rErr } = await db
      .from("rooms")
      .insert(buildRoomRow(draft, propertyId, status))
      .select("id")
      .single();
    if (rErr || !room) return { error: rErr?.message ?? "Errore stanza." };
    roomId = room.id as string;
  }

  if (draft.photoUrl && propertyId) {
    const { data: imgs } = await db
      .from("property_images")
      .select("id")
      .eq("property_id", propertyId)
      .limit(1);
    if (!imgs?.length) {
      await db.from("property_images").insert({
        property_id: propertyId,
        url: draft.photoUrl,
        sort_order: 0,
      });
    }
  }

  if (publish && roomId) {
    try {
      await recalculateMatchesForRoom(db, roomId, false);
    } catch (err) {
      console.error("[wizard] match recalc", err);
    }
  }

  revalidatePath("/owner");
  revalidatePath("/owner/properties");
  revalidatePath("/stanze");
  if (roomId) revalidatePath(`/stanza/${roomId}`);
  return { propertyId: propertyId!, roomId: roomId! };
}

export async function uploadWizardPhoto(
  propertyId: string | null,
  formData: FormData,
) {
  const session = await requireRole(["owner"]);
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Seleziona un'immagine." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Il file deve essere un'immagine." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Immagine troppo grande (max 5 MB)." };
  }

  const db = createServiceSupabaseClient();
  if (propertyId) {
    const { data: existing } = await db
      .from("properties")
      .select("id, owner_id")
      .eq("id", propertyId)
      .maybeSingle();
    if (!existing || existing.owner_id !== session.id) {
      return { error: "Immobile non trovato." };
    }
  }

  const folder = propertyId || session.id;
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await db.storage
    .from("property-photos")
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
  if (upErr) return { error: upErr.message };

  const { data: urlData } = db.storage
    .from("property-photos")
    .getPublicUrl(path);

  if (propertyId) {
    await db.from("property_images").insert({
      property_id: propertyId,
      url: urlData.publicUrl,
      sort_order: 0,
    });
  }

  return { url: urlData.publicUrl };
}

export async function generateListingDescription(input: {
  city: string;
  zone: string;
  propertyType: PropertyType;
  contractDurationType: ContractDurationType;
  targetAudience: TargetAudience;
  sizeSqm: number | null;
  floorNumber: number | null;
  isFurnished: boolean;
  servicesIncluded: string[];
  highlights: string;
  priceMonthly: number | null;
}) {
  await requireRole(["owner"]);

  let openai: ReturnType<typeof getOpenAIClient>;
  try {
    openai = getOpenAIClient();
  } catch {
    return {
      error:
        "Generazione non disponibile al momento. Scrivi la descrizione a mano.",
    };
  }

  const typeLabels: Record<PropertyType, string> = {
    stanza_singola: "stanza singola",
    stanza_doppia: "stanza doppia",
    appartamento_intero: "appartamento intero",
    monolocale: "monolocale",
  };
  const durationLabels: Record<ContractDurationType, string> = {
    anno_accademico: "anno accademico",
    annuale: "annuale",
    breve_periodo: "breve periodo",
    flessibile: "flessibile",
  };
  const audienceLabels: Record<TargetAudience, string> = {
    studenti: "studenti",
    lavoratori: "lavoratori",
    entrambi: "studenti e lavoratori",
  };

  const prompt = `Scrivi una descrizione professionale in italiano (140-220 parole) per un annuncio Coabito.
Tipo: ${typeLabels[input.propertyType] || input.propertyType}
Città/zona: ${input.city}${input.zone ? ` — ${input.zone}` : ""}
Target: ${audienceLabels[input.targetAudience]}
Mq: ${input.sizeSqm ?? "n/d"}, piano: ${input.floorNumber ?? "n/d"}
Arredato: ${input.isFurnished ? "sì" : "no"}
Servizi: ${input.servicesIncluded.join(", ") || "n/d"}
Canone: ${input.priceMonthly ?? "n/d"} €/mese
Durata: ${durationLabels[input.contractDurationType] || input.contractDurationType}
Punti di forza: ${input.highlights || "n/d"}

Tono caldo e concreto, senza esagerazioni. Non inventare servizi non elencati. Nessun markdown.`;

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.7,
      max_tokens: 450,
      messages: [
        {
          role: "system",
          content:
            "Sei Vesta, copywriter immobiliare per Coabito. Scrivi descrizioni chiare e professionali per alloggi in Italia.",
        },
        { role: "user", content: prompt },
      ],
    });
    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      return { error: "Nessun testo generato. Scrivi la descrizione a mano." };
    }
    return { description: text };
  } catch {
    return {
      error: "Generazione fallita. Puoi scrivere la descrizione liberamente.",
    };
  }
}

export async function estimateListingDemand(input: {
  city: string;
  priceMonthly: number;
  targetAudience: TargetAudience;
  propertyType?: PropertyType;
}) {
  await requireRole(["owner"]);
  const encouraging =
    "Il tuo annuncio sarà tra i primi visibili in questa zona: ottimo momento per posizionarti su Coabito.";

  try {
    const db = createServiceSupabaseClient();
    const cityId = await resolveCityId(db, input.city);

    const { data: profiles } = await db
      .from("student_profiles")
      .select("*")
      .not("budget_max", "is", null)
      .limit(400);

    if (!profiles?.length) {
      return { count: 0, low: true, message: encouraging };
    }

    const userIds = profiles.map((p) => p.user_id as string);
    const { data: users } = await db
      .from("users")
      .select("id, role")
      .in("id", userIds);

    const roleByUser = new Map(
      (users ?? []).map((u) => [u.id as string, String(u.role)]),
    );

    const campusCity = new Map<string, string>();
    if (cityId) {
      const { data: campuses } = await db
        .from("campuses")
        .select("id, city_id")
        .eq("city_id", cityId);
      for (const c of campuses ?? []) {
        campusCity.set(c.id as string, c.city_id as string);
      }
    }

    const room = {
      id: "preview",
      price_monthly: input.priceMonthly || 0,
      estimated_utilities: 40,
      is_available: true,
    };
    const property = {
      id: "preview",
      zone: input.city || null,
    };
    const wholeUnit = isWholeUnitProperty(
      input.propertyType ?? "stanza_singola",
    );

    let compatible = 0;
    for (const row of profiles) {
      const role = roleByUser.get(row.user_id as string) || "student";
      if (input.targetAudience === "studenti" && role === "worker") continue;
      if (input.targetAudience === "lavoratori" && role !== "worker") continue;

      if (cityId) {
        const profileCity = (row as { city_id?: string | null }).city_id;
        const campusId = row.campus_id as string | null;
        const inCity =
          profileCity === cityId ||
          (campusId != null && campusCity.has(campusId));
        if (role !== "worker" && !inCity) continue;
      }

      const seekerType: SeekerRole = role === "worker" ? "worker" : "student";
      try {
        const result = calculateMatchScore(
          row as StudentProfileRow,
          room,
          property,
          [],
          null,
          "it",
          seekerType,
          { wholeUnit },
        );
        if (result.score >= 55) compatible += 1;
      } catch {
        const budget = Number(row.budget_max || 0);
        if (
          budget > 0 &&
          input.priceMonthly > 0 &&
          budget >= input.priceMonthly * 0.85
        ) {
          compatible += 1;
        }
      }
    }

    if (compatible < LOW_DEMAND_THRESHOLD) {
      return {
        count: compatible,
        low: true,
        message:
          compatible === 0
            ? encouraging
            : "Ci sono già alcuni profili interessati nella zona. Pubblicando ora, il tuo annuncio sarà tra i più visibili.",
      };
    }

    return {
      count: compatible,
      low: false,
      message: `Circa ${compatible} profili compatibili già attivi su Coabito in zona potrebbero vedere il tuo annuncio.`,
    };
  } catch {
    return { count: 0, low: true, message: encouraging };
  }
}

export type BulkImportRowResult = {
  row: number;
  ok: boolean;
  propertyId?: string;
  error?: string;
  address?: string;
};

export async function canUseBulkListingImport() {
  const session = await requireRole(["owner"]);
  const db = createServiceSupabaseClient();
  const { data: profile } = await db
    .from("users")
    .select("partner_tier")
    .eq("id", session.id)
    .maybeSingle();
  const tier = (profile?.partner_tier as PartnerTier | null) || "standard";
  if (isPartnerOrAbove(tier)) {
    return { allowed: true as const, reason: "partner" as const };
  }

  const { count } = await db
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", session.id)
    .eq("status", "attivo");

  if ((count || 0) >= 1) {
    return { allowed: true as const, reason: "multi_listing" as const };
  }
  return { allowed: false as const, reason: "none" as const };
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const split = (line: string) => {
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((ch === "," || ch === ";") && !inQuotes) {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const headers = split(lines[0]).map((h) =>
    h.toLowerCase().replace(/\s+/g, "_"),
  );
  return lines.slice(1).map((line) => {
    const cells = split(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] || "";
    });
    return row;
  });
}

function normalizePropertyType(raw: string): PropertyType | null {
  const v = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (isPropertyType(v)) return v;
  const map: Record<string, PropertyType> = {
    singola: "stanza_singola",
    doppia: "stanza_doppia",
    appartamento: "appartamento_intero",
    monolocale: "monolocale",
  };
  return map[v] || null;
}

export async function importListingsFromCsv(formData: FormData) {
  await requireRole(["owner"]);
  assertEscrowDoesNotBlockPublish();
  const gate = await canUseBulkListingImport();
  if (!gate.allowed) {
    return {
      error:
        "Import multiplo disponibile per Partner/Fondatrice o proprietari con almeno un annuncio attivo.",
      results: [] as BulkImportRowResult[],
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return {
      error: "Carica un file CSV.",
      results: [] as BulkImportRowResult[],
    };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (!rows.length) {
    return {
      error: "CSV vuoto o senza intestazioni. Usa il template scaricabile.",
      results: [] as BulkImportRowResult[],
    };
  }

  const results: BulkImportRowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const address = row.indirizzo || row.address || "";
    const city = row.citta || row.city || "";
    const propertyType = normalizePropertyType(
      row.tipo_alloggio || row.property_type || "",
    );
    const rentRaw = row.prezzo || row.prezzo_mensile || row.monthly_rent || "";
    const rent = Number(String(rentRaw).replace(",", "."));
    const sizeSqm =
      Number(String(row.mq || row.size_sqm || "").replace(",", ".")) || null;
    const rooms = Number(row.stanze || row.rooms || "") || null;

    if (!address) {
      results.push({
        row: rowNum,
        ok: false,
        error: "Indirizzo mancante.",
        address,
      });
      continue;
    }
    if (!propertyType) {
      results.push({
        row: rowNum,
        ok: false,
        error:
          "Tipo alloggio non valido (usa stanza_singola, stanza_doppia, appartamento_intero, monolocale).",
        address,
      });
      continue;
    }
    if (!Number.isFinite(rent) || rent <= 0) {
      results.push({
        row: rowNum,
        ok: false,
        error: "Prezzo non numerico o non valido.",
        address,
      });
      continue;
    }

    const geo = await geocodeAddress(
      city ? `${address}, ${city}, Italia` : `${address}, Italia`,
    );
    if (!geo) {
      results.push({
        row: rowNum,
        ok: false,
        error: "Indirizzo non geocodificabile. Verifica e riprova.",
        address,
      });
      continue;
    }

    const draft: ListingWizardDraft = {
      ...EMPTY_WIZARD_DRAFT,
      address: geo.address,
      zone: geo.zone,
      city: geo.city || city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      propertyType,
      roomLabel: rooms
        ? `Camera (${rooms} stanze)`
        : propertyType.replace(/_/g, " "),
      sizeSqm,
      priceMonthly: Math.round(rent),
      description: "",
    };

    const saved = await saveListingWizardDraft(draft);
    if ("error" in saved && saved.error) {
      results.push({
        row: rowNum,
        ok: false,
        error: saved.error,
        address: geo.address,
      });
      continue;
    }
    results.push({
      row: rowNum,
      ok: true,
      propertyId: "propertyId" in saved ? saved.propertyId : undefined,
      address: geo.address,
    });
  }

  revalidatePath("/owner/properties");
  const imported = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  return {
    imported,
    failed,
    results,
    message: `Importate ${imported} bozze${failed ? `, ${failed} righe scartate` : ""}. Nessun annuncio è stato pubblicato automaticamente.`,
  };
}

export async function loadListingWizardDraft(propertyId: string) {
  const session = await requireRole(["owner"]);
  const db = createServiceSupabaseClient();
  const { data, error } = await db
    .from("properties")
    .select("*, rooms(*)")
    .eq("id", propertyId)
    .maybeSingle();
  if (error || !data) return { error: "Bozza non trovata." };
  if (data.owner_id !== session.id) return { error: "Non autorizzato." };
  if (data.status !== "bozza") {
    return { error: "Questo annuncio non è più una bozza." };
  }

  const rooms = Array.isArray(data.rooms) ? data.rooms : [];
  const room = rooms[0] as Record<string, unknown> | undefined;
  const stored = (data.wizard_draft || {}) as Partial<ListingWizardDraft>;

  const { data: images } = await db
    .from("property_images")
    .select("url")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .limit(1);

  const draft: ListingWizardDraft = {
    ...EMPTY_WIZARD_DRAFT,
    ...stored,
    propertyId: data.id as string,
    roomId: (room?.id as string) || stored.roomId || null,
    address: stored.address || (data.address as string) || "",
    zone: stored.zone || (data.zone as string) || "",
    city: stored.city || (data.city as string) || "",
    latitude: stored.latitude ?? (data.latitude as number | null) ?? null,
    longitude: stored.longitude ?? (data.longitude as number | null) ?? null,
    propertyType: (stored.propertyType ||
      data.property_type ||
      "stanza_singola") as PropertyType,
    contractDurationType: (stored.contractDurationType ||
      data.contract_duration_type ||
      "anno_accademico") as ContractDurationType,
    targetAudience: (stored.targetAudience ||
      data.target_audience ||
      "entrambi") as TargetAudience,
    roomLabel: stored.roomLabel || (room?.room_label as string) || "",
    sizeSqm: stored.sizeSqm ?? (data.size_sqm as number | null) ?? null,
    floorNumber:
      stored.floorNumber ?? (data.floor_number as number | null) ?? null,
    totalRooms: stored.totalRooms ?? (data.total_rooms as number) ?? 2,
    isFurnished: stored.isFurnished ?? Boolean(data.is_furnished),
    hasPrivateBathroom:
      stored.hasPrivateBathroom ?? Boolean(room?.has_private_bathroom),
    hasBalcony: stored.hasBalcony ?? Boolean(room?.has_balcony),
    servicesIncluded:
      stored.servicesIncluded ||
      (Array.isArray(room?.services_included)
        ? (room?.services_included as string[])
        : []),
    photoUrl: stored.photoUrl || images?.[0]?.url || null,
    virtualTourUrl:
      stored.virtualTourUrl || (data.virtual_tour_url as string) || "",
    highlights: stored.highlights || (data.highlights as string) || "",
    priceMonthly:
      stored.priceMonthly ??
      (room?.price_monthly as number | null) ??
      (data.monthly_rent_to_owner as number | null) ??
      null,
    estimatedUtilities:
      stored.estimatedUtilities ??
      (room?.estimated_utilities as number) ??
      40,
    depositAmount:
      stored.depositAmount ?? (data.deposit_amount as number | null) ?? null,
    availableFrom:
      stored.availableFrom || (room?.available_from as string) || "",
    availableUntil:
      stored.availableUntil || (data.available_until as string) || "",
    description: stored.description || (data.description as string) || "",
    nearbyPois: stored.nearbyPois || (data.nearby_pois as never) || [],
  };

  return { draft, propertyId: data.id as string, roomId: draft.roomId };
}
