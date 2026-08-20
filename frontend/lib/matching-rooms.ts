// lib/matching-rooms.ts
//
// Estratto da app/api/chat/route.ts perché ora serve in due punti:
// 1. Dentro la chat, dopo ogni messaggio (come prima).
// 2. In /api/matches, per ricaricare le stanze già calcolate quando lo
//    studente riapre il sito, senza dover riscrivere a Vesta.

import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { calculateMatchScore, type StudentProfileRow } from "@/lib/matching";
import { sendEmail, buildNewRoomMatchEmail } from "@/lib/email";
import { stopWaitlistNurture } from "@/lib/waitlist-nurture";

function buildDistancesByProperty(
  rows: { property_id: string; campus_id: string; distance_km: number | null }[],
): Map<string, Map<string, number | null>> {
  const byProperty = new Map<string, Map<string, number | null>>();
  for (const row of rows) {
    let byCampus = byProperty.get(row.property_id);
    if (!byCampus) {
      byCampus = new Map();
      byProperty.set(row.property_id, byCampus);
    }
    byCampus.set(row.campus_id, row.distance_km);
  }
  return byProperty;
}

function distanceKmFromMap(
  byProperty: Map<string, Map<string, number | null>>,
  propertyId: string,
  campusId: string | null,
): number | null {
  if (!campusId) return null;
  const byCampus = byProperty.get(propertyId);
  if (!byCampus) return null;
  return byCampus.get(campusId) ?? null;
}

export async function computeRoomMatches(
  db: ReturnType<typeof createServiceSupabaseClient>,
  student: StudentProfileRow,
  locale: "it" | "en" = "it",
) {
  const { data: activeCities, error: citiesError } = await db
    .from("cities")
    .select("id")
    .eq("is_active", true);

  if (citiesError) throw citiesError;

  const activeCityIds = (activeCities ?? []).map((c) => c.id);
  if (activeCityIds.length === 0) return [];

  const { data: roomsData, error: roomsError } = await db
    .from("rooms")
    .select(
      `
      id, price_monthly, estimated_utilities, is_available, room_label,
      services_included, available_from,
      properties:property_id!inner ( id, zone, city_id, status )
    `,
    )
    .eq("is_available", true)
    .eq("properties.status", "attivo")
    .in("properties.city_id", activeCityIds)
    .limit(50);

  if (roomsError) throw roomsError;
  if (!roomsData || roomsData.length === 0) return [];

  const propertyIds = roomsData
    .map((r: any) => r.properties?.id)
    .filter(Boolean);

  const { data: distanceRows, error: distancesError } = await db
    .from("property_campus_distances")
    .select("property_id, campus_id, distance_km")
    .in("property_id", propertyIds);

  if (distancesError) {
    console.error("[matching-rooms] property_campus_distances non disponibile:", distancesError);
  }

  const distancesByProperty = buildDistancesByProperty(distanceRows ?? []);

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
    const distanceKm = distanceKmFromMap(
      distancesByProperty,
      property?.id,
      student.campus_id,
    );

    const { score, reasoning } = calculateMatchScore(
      student,
      room,
      property,
      roommates,
      distanceKm,
      locale,
    );

    matchRows.push({
      student_id: student.user_id,
      room_id: room.id,
      compatibility_score: score,
      ai_reasoning: { reasons: reasoning },
      algorithm_version: "v2-multicity",
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
      properties:property_id ( id, zone, city_id )
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

  const { data: distanceRows, error: distancesError } = await db
    .from("property_campus_distances")
    .select("campus_id, distance_km")
    .eq("property_id", property.id);

  if (distancesError) {
    console.error("[matching-rooms] property_campus_distances non disponibile:", distancesError);
  }

  const distancesByCampus = new Map(
    (distanceRows ?? []).map((d) => [d.campus_id, d.distance_km]),
  );

  function distanceKmForCampus(campusId: string | null): number | null {
    if (!campusId) return null;
    return distancesByCampus.get(campusId) ?? null;
  }

  const { data: students } = await db
    .from("student_profiles")
    .select("*")
    .not("campus_id", "is", null)
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
    const distanceKm = distanceKmForCampus(student.campus_id);
    const { score, reasoning } = calculateMatchScore(
      student,
      room as any,
      property,
      (roommateProfiles ?? []) as StudentProfileRow[],
      distanceKm,
    );
    return {
      student_id: student.user_id,
      room_id: roomId,
      compatibility_score: score,
      ai_reasoning: { reasons: reasoning },
      algorithm_version: "v2-multicity",
    };
  });

  const { error } = await db
    .from("match_scores")
    .upsert(matchRows, { onConflict: "student_id,room_id" });

  if (error) {
    console.error("[matching-rooms] Errore ricalcolo match per la stanza:", error);
  }

  if (notifyStudents) {
    const HIGH_MATCH_THRESHOLD = 75;
    const notifyRows = matchRows.filter((m) => m.compatibility_score >= HIGH_MATCH_THRESHOLD);

    if (notifyRows.length > 0) {
      const zoneLabel = property.zone ? ` a ${property.zone}` : "";

      const notifyStudentIds = notifyRows.map((m) => m.student_id);
      const { data: notifyUsers } = await db
        .from("users")
        .select("id, full_name, email, preferred_locale")
        .in("id", notifyStudentIds);

      const userByStudent = new Map((notifyUsers ?? []).map((u: any) => [u.id, u]));

      const chatMessages = notifyRows.map((m) => {
        const user = userByStudent.get(m.student_id);
        const studentLocale = user?.preferred_locale === "en" ? "en" : "it";
        const content =
          studentLocale === "en"
            ? `I found a new room that might interest you! 🏠 ${room.room_label}${zoneLabel ? ` in ${property.zone}` : ""}, €${room.price_monthly}/month, compatibility ${m.compatibility_score}% — check out the rooms suggested on the right.`
            : `Ho trovato una nuova stanza che potrebbe interessarti! 🏠 ${room.room_label}${zoneLabel}, ${room.price_monthly}€/mese, compatibilità ${m.compatibility_score}% — dai un'occhiata tra le stanze proposte qui a destra.`;

        return {
          student_id: m.student_id,
          role: "assistant" as const,
          content,
        };
      });

      const { error: chatError } = await db.from("chat_messages").insert(chatMessages);
      if (chatError) {
        console.error("[matching-rooms] Errore invio notifiche proattive:", chatError);
      }

      for (const m of notifyRows) {
        const user = userByStudent.get(m.student_id);
        if (!user?.email) continue;

        const studentLocale = user.preferred_locale === "en" ? "en" : "it";
        const matchEmail = buildNewRoomMatchEmail({
          fullName: user.full_name ?? "",
          roomLabel: room.room_label,
          zone: property.zone,
          priceMonthly: room.price_monthly,
          matchScore: m.compatibility_score,
          locale: studentLocale,
        });
        sendEmail({ to: user.email, ...matchEmail });

        // Interrompe la sequenza nurture waitlist: ha già ricevuto una stanza.
        stopWaitlistNurture(db, {
          userId: m.student_id,
          email: user.email,
        });
      }
    }
  }
}
