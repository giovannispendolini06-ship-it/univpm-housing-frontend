"use server";

import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";

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

// ---------------------------------------------------------------------------
// Ricalcola le statistiche chiave del business e chiede al modello un
// commento breve e concreto in italiano. Va richiamata dall'admin quando
// vuole (bottone), non ad ogni caricamento della pagina, per non consumare
// credito OpenAI inutilmente.
// ---------------------------------------------------------------------------
export async function generateAdminInsight(): Promise<string> {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const [{ data: properties }, { data: rooms }, { data: leads }, { data: users }, { data: inquiries }] =
    await Promise.all([
      db.from("properties").select("id, status, monthly_rent_to_owner"),
      db.from("rooms").select("id, property_id, price_monthly, is_available"),
      db.from("leads_external").select("status"),
      db.from("users").select("role"),
      db.from("owner_inquiries").select("status"),
    ]);

  const occupiedRooms = (rooms ?? []).filter((r) => !r.is_available);
  const monthlyRevenue = occupiedRooms.reduce((sum, r) => sum + Number(r.price_monthly), 0);
  const occupiedPropertyIds = new Set(occupiedRooms.map((r) => r.property_id));
  const monthlyCost = (properties ?? [])
    .filter((p) => occupiedPropertyIds.has(p.id))
    .reduce((sum, p) => sum + Number(p.monthly_rent_to_owner), 0);

  const summary = {
    immobili_attivi: (properties ?? []).filter((p) => p.status === "attivo").length,
    immobili_affittati: (properties ?? []).filter((p) => p.status === "affittato").length,
    immobili_bozza: (properties ?? []).filter((p) => p.status === "bozza").length,
    stanze_totali: rooms?.length ?? 0,
    stanze_occupate: occupiedRooms.length,
    stanze_libere: (rooms?.length ?? 0) - occupiedRooms.length,
    ricavo_mensile_stimato_eur: monthlyRevenue,
    costo_mensile_proprietari_eur: monthlyCost,
    margine_mensile_stimato_eur: monthlyRevenue - monthlyCost,
    studenti_registrati: (users ?? []).filter((u) => u.role === "student").length,
    lead_esterni_totali: leads?.length ?? 0,
    lead_da_lavorare: (leads ?? []).filter((l) => l.status === "nuovo").length,
    richieste_proprietari_totali: inquiries?.length ?? 0,
    richieste_proprietari_da_contattare: (inquiries ?? []).filter((i) => i.status === "nuovo").length,
    richieste_proprietari_convertite: (inquiries ?? []).filter((i) => i.status === "convertito").length,
  };

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    max_completion_tokens: 400,
    messages: [
      {
        role: "system",
        content:
          "Sei un analista di business per una piattaforma immobiliare studentesca. " +
          "Ricevi dei numeri in JSON e scrivi un breve commento in italiano (massimo 4-5 frasi), " +
          "concreto e diretto, che evidenzi cosa sta andando bene, cosa richiede attenzione, e " +
          "un suggerimento pratico e specifico. Niente preamboli, vai dritto al punto. Non " +
          "inventare numeri che non ti ho dato.",
      },
      {
        role: "user",
        content: `Dati attuali della piattaforma:\n${JSON.stringify(summary, null, 2)}`,
      },
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ??
    "Non sono riuscito a generare un'analisi in questo momento."
  );
}
