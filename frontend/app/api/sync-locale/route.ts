// app/api/sync-locale/route.ts
//
// La lingua scelta con il selettore vive in un cookie del browser — utile
// per l'interfaccia, ma invisibile alle azioni lato server (creazione di
// una stanza, registrazione di un affitto) che generano contenuto per uno
// specifico studente. Questa route salva la scelta sul profilo, così quel
// contenuto può essere generato nella lingua giusta anche fuori da una
// richiesta diretta dello studente.

import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const studentId = body?.studentId;
  const locale = body?.locale;

  if (!studentId || (locale !== "it" && locale !== "en")) {
    return NextResponse.json({ error: "Dati non validi." }, { status: 400 });
  }

  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user || user.id !== studentId) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
  }

  const db = createServiceSupabaseClient();
  const { error } = await db
    .from("users")
    .update({ preferred_locale: locale })
    .eq("id", studentId);

  if (error) {
    console.error("[api/sync-locale] Errore salvataggio lingua:", error);
    return NextResponse.json({ error: "Errore nel salvataggio." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
