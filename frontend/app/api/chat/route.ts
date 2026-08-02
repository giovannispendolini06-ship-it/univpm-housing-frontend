// app/api/chat/route.ts
//
// Flusso:
// 1. Riceve { studentId, message, history } dal ChatPanel React.
// 2. Verifica che lo studente sia autenticato e coincida con studentId.
// 3. Chiama OpenAI con il system prompt di Dado + storico conversazione.
// 4. Se il modello ha prodotto il blocco <STUDENT_DATA_JSON>, aggiorna
//    student_profiles su Supabase.
// 5. Recupera le stanze disponibili ad Ancona e i relativi coinquilini
//    attuali, ricalcola i match_scores e li salva.
// 6. Risponde con { reply, rooms } pronto per il frontend.

import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";
import { DADO_SYSTEM_PROMPT } from "@/lib/system-prompt";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import {
  calculateMatchScore,
  type StudentProfileRow,
} from "@/lib/matching";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Tipi della request/response
// ---------------------------------------------------------------------------

interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  studentId: string;
  message: string;
  history?: ChatHistoryItem[];
}

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 30;
const STUDENT_DATA_REGEX = /<STUDENT_DATA_JSON>([\s\S]*?)<\/STUDENT_DATA_JSON>/;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // --- 1. Parsing e validazione input -------------------------------------
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo della richiesta non è un JSON valido." },
      { status: 400 },
    );
  }

  const { studentId, message, history = [] } = body;

  if (!studentId || typeof studentId !== "string") {
    return NextResponse.json(
      { error: "Campo 'studentId' mancante o non valido." },
      { status: 400 },
    );
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Campo 'message' mancante o vuoto." },
      { status: 400 },
    );
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Messaggio troppo lungo (max ${MAX_MESSAGE_LENGTH} caratteri).` },
      { status: 400 },
    );
  }

  const trimmedHistory = history.slice(-MAX_HISTORY_ITEMS);

  // --- 2. Autenticazione ----------------------------------------------------
  let userId: string;
  try {
    const authClient = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sessione non valida. Effettua di nuovo il login." },
        { status: 401 },
      );
    }
    if (user.id !== studentId) {
      return NextResponse.json(
        { error: "Non puoi agire per conto di un altro utente." },
        { status: 403 },
      );
    }
    userId = user.id;
  } catch (err) {
    console.error("[api/chat] Errore di autenticazione:", err);
    return NextResponse.json(
      { error: "Errore interno durante la verifica dell'utente." },
      { status: 500 },
    );
  }

  // Da qui in poi usiamo il service client: il motore di matching deve
  // poter leggere/scrivere anche dati che le policy RLS lato utente non
  // esporrebbero (es. profili di altri studenti per il confronto coinquilini).
  const db = createServiceSupabaseClient();

  // --- 3. Chiamata a OpenAI ------------------------------------------------
  let assistantReplyRaw: string;
  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: DADO_SYSTEM_PROMPT },
        ...trimmedHistory.map((item) => ({
          role: item.role,
          content: item.content,
        })),
        { role: "user" as const, content: message },
      ],
    });

    assistantReplyRaw = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!assistantReplyRaw) {
      throw new Error("Risposta vuota dal modello.");
    }
  } catch (err) {
    console.error("[api/chat] Errore chiamata OpenAI:", err);
    return NextResponse.json(
      {
        error:
          "Il servizio di chat non è al momento disponibile. Riprova tra qualche istante.",
      },
      { status: 502 },
    );
  }

  // --- 4. Estrazione del blocco JSON e aggiornamento profilo ---------------
  const jsonMatch = assistantReplyRaw.match(STUDENT_DATA_REGEX);
  const replyForUser = assistantReplyRaw.replace(STUDENT_DATA_REGEX, "").trim();

  if (jsonMatch) {
    try {
      const extracted = JSON.parse(jsonMatch[1]);
      const updatePayload = buildProfileUpdatePayload(extracted);

      if (Object.keys(updatePayload).length > 0) {
        const { error: upsertError } = await db
          .from("student_profiles")
          .upsert(
            { user_id: userId, ...updatePayload },
            { onConflict: "user_id" },
          );

        if (upsertError) {
          // Non blocchiamo la risposta all'utente per un errore di
          // salvataggio: lo logghiamo e proseguiamo comunque.
          console.error("[api/chat] Errore upsert student_profiles:", upsertError);
        }
      }
    } catch (err) {
      console.error("[api/chat] JSON non valido nel blocco STUDENT_DATA_JSON:", err);
      // Continuiamo comunque: il messaggio di chat resta valido anche se
      // l'estrazione strutturata fallisce.
    }
  }

  // --- 5. Recupero profilo aggiornato, stanze e calcolo match -------------
  let rooms: unknown[] = [];
  try {
    const { data: studentProfile, error: profileError } = await db
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    // Se il profilo non ha ancora i campi minimi, non calcoliamo match:
    // rispondiamo solo con la chat.
    if (studentProfile?.polo_univpm && studentProfile?.budget_max) {
      rooms = await computeRoomMatches(db, studentProfile as StudentProfileRow);
    }
  } catch (err) {
    console.error("[api/chat] Errore nel calcolo dei match:", err);
    // Anche qui: un fallimento nel matching non deve impedire allo
    // studente di continuare a chattare con Dado.
    rooms = [];
  }

  return NextResponse.json({ reply: replyForUser, rooms });
}

// ---------------------------------------------------------------------------
// Helper: filtra e valida il payload estratto dal JSON del modello prima di
// scriverlo su Supabase (non fidarsi mai ciecamente dell'output del modello).
// ---------------------------------------------------------------------------
function buildProfileUpdatePayload(extracted: Record<string, unknown>) {
  const allowedKeys = [
    "polo_univpm",
    "degree_course",
    "study_year",
    "budget_max",
    "preferred_move_in_date",
    "study_habit",
    "sociability_level",
    "guests_frequency",
    "is_smoker",
    "has_pets",
    "cleanliness_level",
    "additional_notes",
  ] as const;

  const payload: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    const value = extracted[key];
    if (value !== null && value !== undefined) {
      payload[key] = value;
    }
  }
  return payload;
}

// ---------------------------------------------------------------------------
// Helper: recupera stanze disponibili + coinquilini attuali e calcola/salva
// i match_scores per lo studente corrente.
// ---------------------------------------------------------------------------
async function computeRoomMatches(
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

  // NB: qui assumiamo l'esistenza di `room_tenancies` (room_id, student_id,
  // ended_at) per sapere chi vive già in ciascuna property — vedi il
  // commento in lib/matching.ts per la migration da aggiungere.
  const propertyIds = roomsData
    .map((r: any) => r.properties?.id)
    .filter(Boolean);

  const { data: tenancies, error: tenanciesError } = await db
    .from("room_tenancies")
    .select("student_id, room_id, ended_at, rooms:room_id ( property_id )")
    .is("ended_at", null)
    .in("rooms.property_id", propertyIds);

  if (tenanciesError) {
    console.error("[api/chat] room_tenancies non disponibile:", tenanciesError);
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

  // Persistiamo i punteggi (upsert: uno studente può essere ricalcolato
  // più volte sulla stessa stanza mano a mano che il profilo si arricchisce).
  const { error: matchUpsertError } = await db
    .from("match_scores")
    .upsert(matchRows, { onConflict: "student_id,room_id" });

  if (matchUpsertError) {
    console.error("[api/chat] Errore salvataggio match_scores:", matchUpsertError);
  }

  return enrichedRooms.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
}
