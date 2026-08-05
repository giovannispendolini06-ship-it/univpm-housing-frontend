// app/api/chat/route.ts
//
// Flusso:
// 1. Riceve { studentId, message, history } dal ChatPanel React.
// 2. Verifica che lo studente sia autenticato e coincida con studentId.
// 3. Chiama OpenAI con il system prompt di Vesta + storico conversazione.
// 4. Se il modello ha prodotto il blocco <STUDENT_DATA_JSON>, aggiorna
//    student_profiles su Supabase.
// 5. Recupera le stanze disponibili ad Ancona e i relativi coinquilini
//    attuali, ricalcola i match_scores e li salva.
// 6. Salva il turno di conversazione (messaggio + risposta) in
//    chat_messages, così resta disponibile la prossima volta che lo
//    studente riapre il sito.
// 7. Risponde con { reply, rooms } pronto per il frontend.

import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";
import { DADO_SYSTEM_PROMPT } from "@/lib/system-prompt";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import type { StudentProfileRow } from "@/lib/matching";
import { computeRoomMatches } from "@/lib/matching-rooms";

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
  locale?: "it" | "en";
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

  const { studentId, message, history = [], locale = "it" } = body;

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
      const updatePayload = await buildProfileUpdatePayload(extracted, db);

      if (Object.keys(updatePayload).length > 0) {
        const { error: upsertError } = await db
          .from("student_profiles")
          .upsert(
            { user_id: userId, ...updatePayload },
            { onConflict: "user_id" },
          );

        if (upsertError) {
          console.error("[api/chat] Errore upsert student_profiles:", upsertError);
        }
      }
    } catch (err) {
      console.error("[api/chat] JSON non valido nel blocco STUDENT_DATA_JSON:", err);
    }
  }

  // --- 5. Salva il turno di conversazione nello storico ---------------------
  // Non blocca mai la risposta: se il salvataggio fallisce, lo studente
  // vede comunque la risposta di Vesta, semplicemente non resterà salvata.
  try {
    await db.from("chat_messages").insert([
      { student_id: userId, role: "user", content: message },
      { student_id: userId, role: "assistant", content: replyForUser },
    ]);
  } catch (err) {
    console.error("[api/chat] Errore salvataggio chat_messages:", err);
  }

  // --- 6. Recupero profilo aggiornato, stanze e calcolo match -------------
  let rooms: unknown[] = [];
  try {
    const { data: studentProfile, error: profileError } = await db
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (studentProfile?.campus_id && studentProfile?.budget_max) {
      rooms = await computeRoomMatches(
        db,
        studentProfile as StudentProfileRow,
        locale,
      );
    }
  } catch (err) {
    console.error("[api/chat] Errore nel calcolo dei match:", err);
    rooms = [];
  }

  return NextResponse.json({ reply: replyForUser, rooms });
}

// ---------------------------------------------------------------------------
// Helper: filtra e valida il payload estratto dal JSON del modello prima di
// scriverlo su Supabase (non fidarsi mai ciecamente dell'output del modello).
// ---------------------------------------------------------------------------
const POLO_CODE_TO_CAMPUS_NAME: Record<string, string> = {
  monte_dago: "Monte Dago",
  torrette: "Torrette",
  centro_economia_giurisprudenza: "Centro (Economia/Giurisprudenza)",
};

async function buildProfileUpdatePayload(
  extracted: Record<string, unknown>,
  db: ReturnType<typeof createServiceSupabaseClient>,
) {
  const allowedKeys = [
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

  const polo = extracted.polo_univpm;
  if (typeof polo === "string" && polo !== "altro") {
    const campusName = POLO_CODE_TO_CAMPUS_NAME[polo];
    if (campusName) {
      const { data: campus } = await db
        .from("campuses")
        .select("id")
        .eq("name", campusName)
        .maybeSingle();
      if (campus?.id) {
        payload.campus_id = campus.id;
      }
    }
  }

  return payload;
}
