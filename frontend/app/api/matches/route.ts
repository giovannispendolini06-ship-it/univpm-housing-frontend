// app/api/matches/route.ts
//
// Serve a UNA cosa sola: far ritrovare subito le stanze compatibili a uno
// studente che riapre il sito, senza dover riscrivere a Vesta. Nessuna
// chiamata a OpenAI qui dentro — solo letture dal database e lo stesso
// calcolo di compatibilità già usato in /api/chat, quindi resta leggero
// e veloce (nessun costo AI, solo query indicizzate).

import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import type { MatchLocale, StudentProfileRow } from "@/lib/matching";
import { computeRoomMatches } from "@/lib/matching-rooms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale: MatchLocale = localeParam === "en" ? "en" : "it";

  if (!studentId) {
    return NextResponse.json({ error: "studentId mancante." }, { status: 400 });
  }

  // --- Autenticazione: stesse regole della chat -----------------------------
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sessione non valida." }, { status: 401 });
  }
  if (user.id !== studentId) {
    return NextResponse.json(
      { error: "Non puoi vedere i match di un altro utente." },
      { status: 403 },
    );
  }

  const db = createServiceSupabaseClient();

  try {
    const { data: studentProfile } = await db
      .from("student_profiles")
      .select("*")
      .eq("user_id", studentId)
      .maybeSingle();

    if (!studentProfile?.polo_univpm || !studentProfile?.budget_max) {
      // Profilo non ancora completo: nessuna stanza da proporre finché
      // Vesta non ha raccolto almeno polo e budget.
      return NextResponse.json({ rooms: [] });
    }

    const rooms = await computeRoomMatches(
      db,
      studentProfile as StudentProfileRow,
      locale,
    );
    return NextResponse.json({ rooms });
  } catch (err) {
    console.error("[api/matches] Errore nel calcolo dei match:", err);
    return NextResponse.json({ rooms: [] });
  }
}
