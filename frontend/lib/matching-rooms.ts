// lib/matching-rooms.ts
//
// Estratto da app/api/chat/route.ts perché ora serve in due punti:
// 1. Dentro la chat, dopo ogni messaggio (come prima).
// 2. In /api/matches, per ricaricare le stanze già calcolate quando lo
//    studente riapre il sito, senza dover riscrivere a Vesta.

import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { calculateMatchScore, type StudentProfileRow } from "@/lib/matching";

export async function computeRoomMatches(
  db: ReturnType<typeof createServiceSupabaseClient>,
  student: StudentProfileRow,
  locale: "it" | "en" = "it",
) {
  const { data: roomsData, error: roomsError } = await db
    .from("rooms")
    .select(
      `
      id, price_monthly, estimated_utilities, is_available, room_label,
      services_included, available_from,
      properties:property_id!inner (
        id, zone, distance_monte_dago_km, distance_torrette_km, distance_centro_km, city, status
      )
    `,
    )
    .eq("is_available", true)
    .eq("properties.city", "Ancona")
    .eq("properties.status", "attivo")
    .limit(50);

  if (roomsError) throw roomsError;
  if (!roomsData || roomsData.length === 0) return [];

  const propertyIds = roomsData
    .map((r: any) => r.properties?.id)
    .filter(Boolean);

  const { data: tenancies, error: tenanciesError } = await db
    .from("room_tenancies")
    .select("student_id, room_id, ended_at, rooms:room_id ( property_id )")
    .is("ended_at", null)
    .in("rooms.property_id", propertyIds);

  if (tenanciesError) {
    console.error("[matching-rooms] room_tenancies non disponibile:", tenanciesError);
  }

  const roommateStudentIds = Array.from(
    new Set((tenancies ?? []).map((t: any) => t.student_id)),
  );

  const { data: roommateProfiles } = roommateStudentIds.length
    ? await db.from("student_profiles").select("*").in("user_id", roommateStudentIds)
    : { data: [] as StudentProfileRow[] };

  const roommatesByProperty = new Map<string, StudentProfileRow[]>();
  for (const tenancy of tenancies ?? []) {
    const propertyId = (tenancy as any).rooms?.property_id;
    if (!propertyId) continue;
    const profile = (roommateProfiles ?? []).find(
      (p) => p.user_id === (tenancy as any).student_id,
    );
    if (!profile) continue;
    const list = roommatesByProperty.get(propertyId) ?? [];
    list.push(profile);
    roommatesByProperty.set(propertyId, list);
  }

  const matchRows: {
    student_id: string;
    room_id: string;
    compatibility_score: number;
    ai_reasoning: unknown;
    algorithm_version: string;
  }[] = [];

  const enrichedRooms = roomsData.map((room: any) => {
    const property = room.properties;
    const roommates = roommatesByProperty.get(property?.id) ?? [];

    const { score, reasoning } = calculateMatchScore(
      student,
      room,
      property,
      roommates,
      locale,
    );

    matchRows.push({
      student_id: student.user_id,
      room_id: room.id,
      compatibility_score: score,
      ai_reasoning: { reasons: reasoning },
      algorithm_version: "v1",
    });

    return {
      id: room.id,
      title: room.room_label,
      zone: property?.zone ?? null,
      priceMonthly: room.price_monthly,
      estimatedUtilities: room.estimated_utilities,
      servicesIncluded: room.services_included ?? [],
      availableFrom: room.available_from,
      matchScore: score,
      matchReasons: reasoning,
    };
  });

  const { error: matchUpsertError } = await db
    .from("match_scores")
    .upsert(matchRows, { onConflict: "student_id,room_id" });

  if (matchUpsertError) {
    console.error("[matching-rooms] Errore salvataggio match_scores:", matchUpsertError);
  }

  return enrichedRooms.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
}

// ---------------------------------------------------------------------------
// L'altra direzione del calcolo: invece di "tutte le stanze per UNO
// studente", qui facciamo "UNA stanza per TUTTI gli studenti". Va chiamata
// ogni volta che una stanza viene creata o modificata, così i match restano
// aggiornati anche per chi si era registrato tempo fa e non torna a
// chattare — non serve più aspettare un nuovo messaggio a Vesta.
//
// Nota sulle prestazioni: gira su tutti gli studenti con un profilo
// abbastanza completo (polo + budget). Con decine o poche centinaia di
// studenti è istantaneo; se in futuro ne avrai migliaia, vale la pena
// spostarlo in un job in background invece che dentro la richiesta admin.
// ---------------------------------------------------------------------------
export async function recalculateMatchesForRoom(
  db: ReturnType<typeof createServiceSupabaseClient>,
  roomId: string,
  notifyStudents: boolean = false,
): Promise<void> {
  const { data: room, error: roomError } = await db
    .from("rooms")
    .select(
      `
      id, room_label, price_monthly, estimated_utilities, is_available,
      properties:property_id (
        id, zone, distance_monte_dago_km, distance_torrette_km, distance_centro_km
      )
    `,
    )
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    console.error("[matching-rooms] Stanza non trovata per il ricalcolo:", roomError);
    return;
  }

  const property = (room as any).properties;
  if (!property) return;

  const { data: students } = await db
    .from("student_profiles")
    .select("*")
    .not("polo_univpm", "is", null)
    .not("budget_max", "is", null);

  if (!students || students.length === 0) return;

  const { data: tenancies } = await db
    .from("room_tenancies")
    .select("student_id, rooms:room_id ( property_id )")
    .is("ended_at", null);

  const roommateIds = Array.from(
    new Set(
      (tenancies ?? [])
        .filter((t: any) => t.rooms?.property_id === property.id)
        .map((t: any) => t.student_id),
    ),
  );

  const { data: roommateProfiles } = roommateIds.length
    ? await db.from("student_profiles").select("*").in("user_id", roommateIds)
    : { data: [] as StudentProfileRow[] };

  const matchRows = (students as StudentProfileRow[]).map((student) => {
    const { score, reasoning } = calculateMatchScore(
      student,
      room as any,
      property,
      (roommateProfiles ?? []) as StudentProfileRow[],
    );
    return {
      student_id: student.user_id,
      room_id: roomId,
      compatibility_score: score,
      ai_reasoning: { reasons: reasoning },
      algorithm_version: "v1",
    };
  });

  const { error } = await db
    .from("match_scores")
    .upsert(matchRows, { onConflict: "student_id,room_id" });

  if (error) {
    console.error("[matching-rooms] Errore ricalcolo match per la stanza:", error);
  }

  // --- Vesta proattiva: se è una stanza VERAMENTE nuova (non una
  // modifica), avvisa in chat gli studenti per cui il match è alto,
  // invece di lasciare che lo scoprano solo tornando sul sito da soli.
  if (notifyStudents) {
    const HIGH_MATCH_THRESHOLD = 75;
    const notifyRows = matchRows.filter((m) => m.compatibility_score >= HIGH_MATCH_THRESHOLD);

    if (notifyRows.length > 0) {
      const zoneLabel = property.zone ? ` a ${property.zone}` : "";

      const chatMessages = notifyRows.map((m) => ({
        student_id: m.student_id,
        role: "assistant" as const,
        content: `Ho trovato una stanza nuova che potrebbe interessarti! 🏠 ${room.room_label}${zoneLabel}, ${room.price_monthly}€/mese, compatibilità ${m.compatibility_score}% — dai un'occhiata tra le stanze proposte qui a destra.`,
      }));

      const { error: chatError } = await db.from("chat_messages").insert(chatMessages);
      if (chatError) {
        console.error("[matching-rooms] Errore invio notifiche proattive:", chatError);
      }
    }
  }
}
