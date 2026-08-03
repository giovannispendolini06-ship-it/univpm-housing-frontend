// lib/matching-rooms.ts
//
// Estratto da app/api/chat/route.ts perché ora serve in due punti:
// 1. Dentro la chat, dopo ogni messaggio (come prima).
// 2. In /api/matches, per ricaricare le stanze già calcolate quando lo
//    studente riapre il sito, senza dover riscrivere a Nomi.

import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { calculateMatchScore, type StudentProfileRow } from "@/lib/matching";

export async function computeRoomMatches(
  db: ReturnType<typeof createServiceSupabaseClient>,
  student: StudentProfileRow,
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
