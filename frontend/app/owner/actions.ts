"use server";

import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";

/**
 * Genera un breve commento per il proprietario sullo stato dei suoi
 * immobili. Scelta di sicurezza deliberata: la query qui sotto NON
 * seleziona mai monthly_rent_to_owner né price_monthly — anche se
 * volessimo, il modello non potrebbe mai menzionare un prezzo perché
 * quel dato non gli arriva proprio. Il margine resta visibile solo
 * nel pannello admin, mai qui.
 */
export async function generateOwnerInsight(): Promise<string> {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") redirect("/dashboard");

  const db = createServiceSupabaseClient();

  // Solo stato e date: NESSUN campo di prezzo/canone in questa query.
  const { data: properties } = await db
    .from("properties")
    .select("id, address, zone, status, created_at, rooms(id, room_label, is_available)")
    .eq("owner_id", user.id);

  if (!properties || properties.length === 0) {
    return "Non hai ancora nessun immobile collegato al tuo account.";
  }

  const roomIds = properties.flatMap((p) => (p.rooms ?? []).map((r) => r.id));

  const { data: matches } = roomIds.length
    ? await db
        .from("match_scores")
        .select("room_id, compatibility_score")
        .in("room_id", roomIds)
        .gte("compatibility_score", 70)
    : { data: [] as { room_id: string; compatibility_score: number }[] };

  const compatibleCountByRoom = new Map<string, number>();
  for (const m of matches ?? []) {
    compatibleCountByRoom.set(m.room_id, (compatibleCountByRoom.get(m.room_id) ?? 0) + 1);
  }

  const summary = properties.map((p) => ({
    indirizzo: p.address,
    zona: p.zone,
    stato: p.status,
    stanze: (p.rooms ?? []).map((r) => ({
      nome: r.room_label,
      libera: r.is_available,
      studenti_compatibili: r.is_available ? (compatibleCountByRoom.get(r.id) ?? 0) : null,
    })),
  }));

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    max_completion_tokens: 300,
    messages: [
      {
        role: "system",
        content: `Sei Vesta, l'assistente di Coabito. Scrivi un breve commento (massimo 3-4 frasi, tono caldo e diretto, in italiano) per un proprietario sullo stato dei suoi immobili, basandoti SOLO sui dati forniti (stato, stanze libere/occupate, numero di studenti compatibili in attesa). Non menzionare mai prezzi, canoni o guadagni: non li conosci e non devono comparire. Se ci sono stanze libere con studenti compatibili in attesa, incoraggialo a contattarti per definire i dettagli. Se tutto è occupato, congratulati brevemente.`,
      },
      { role: "user", content: JSON.stringify(summary) },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() ?? "Nessuna novità particolare al momento.";
}
