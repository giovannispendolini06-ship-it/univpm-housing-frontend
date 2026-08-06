"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";
import {
  EMPTY_LANDLORD_LEAD_DRAFT,
  normalizeLandlordSource,
  normalizeLandlordZone,
  type LandlordLeadDraft,
} from "@/lib/landlord-leads";

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

function strOrNull(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  return s || null;
}

function intOrNull(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function landlordLeadsDbError(error: { code?: string; message: string }): Error {
  if (
    error.code === "PGRST205" ||
    /landlord_leads|schema cache/i.test(error.message)
  ) {
    return new Error(
      "Tabella landlord_leads assente su Supabase. Esegui frontend/supabase/migration_landlord_leads.sql nel SQL Editor, poi riprova.",
    );
  }
  return new Error(error.message);
}

function parsePrice(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return String(Math.round(value));
  }
  if (typeof value === "string") {
    const match = value.replace(/\s/g, "").match(/(\d{2,5})(?:[.,]\d{1,2})?/);
    if (!match) return "";
    const n = Number(match[1]);
    if (Number.isFinite(n) && n > 0) return String(n);
  }
  return "";
}

function parseArredato(value: unknown): "" | "true" | "false" {
  if (value === true || value === "true") return "true";
  if (value === false || value === "false") return "false";
  return "";
}

function parseOptionalString(value: unknown): string {
  if (value == null) return "";
  if (typeof value !== "string") return "";
  return value.trim();
}

/**
 * Estrae campi landlord_leads da testo annuncio incollato (Idealista/Subito/…).
 * Non salva nulla: restituisce una bozza da revisionare nel form.
 */
export async function extractLandlordLeadFromText(
  rawText: string,
): Promise<{ ok: true; draft: LandlordLeadDraft } | { ok: false; error: string }> {
  await assertAdmin();

  const text = rawText.trim();
  if (text.length < 40) {
    return {
      ok: false,
      error: "Incolla un testo più lungo (almeno qualche riga dell'annuncio).",
    };
  }
  if (text.length > 12_000) {
    return {
      ok: false,
      error: "Testo troppo lungo: incolla solo la scheda annuncio, non l'intera pagina.",
    };
  }

  // Evita che qualcuno passi solo un URL sperando in un fetch automatico
  if (/^https?:\/\/\S+$/i.test(text)) {
    return {
      ok: false,
      error:
        "Incolla il testo dell'annuncio (copia-incolla dalla pagina), non solo il link: Idealista e Subito bloccano il download automatico.",
    };
  }

  const SYSTEM_PROMPT = `Sei un assistente che estrae dati strutturati da annunci immobiliari italiani (Idealista, Subito, Facebook, messaggi WhatsApp) per un CRM di proprietari ad Ancona.

Rispondi SOLO con un oggetto JSON valido, senza markdown e senza testo fuori dal JSON.
Non inventare dati assenti nel testo. Se un campo non è presente o non è affidabile, usa null.

Schema obbligatorio (nomi esatti):
{
  "nome": string | null,
  "telefono": string | null,
  "indirizzo_immobile": string | null,
  "zona": "centro" | "tavernelle" | "torrette" | "altro" | null,
  "fonte": "idealista" | "subito" | "passaparola" | "amministratore" | "volantinaggio" | "altro" | null,
  "prezzo_richiesto": number | null,
  "arredato": true | false | null,
  "is_listing": boolean
}

Regole:
- is_listing: true solo se il testo sembra un annuncio/immobiliare o un messaggio di contatto su un immobile; false se è testo non pertinente.
- zona: mappa il quartiere/indirizzo ad Ancona. centro = Centro/Villarey/Economia; tavernelle = Tavernelle/Monte Dago/Ingegneria; torrette = Torrette/Quartiere Adriatico/Ospedale. Se non è chiaro → "altro". Se l'indirizzo non è ad Ancona o manca → null.
- fonte: deduci dal testo (es. menzione Idealista/Subito). Se non chiaro → null (NON inventare).
- prezzo_richiesto: solo il canone mensile in euro (numero intero), senza spese accessorie se separate e chiare.
- arredato: true se dice arredato/ammobiliato/arredo completo; false se non arredato/vuoto/da arredare; null se non detto.
- telefono: solo cifre/spazi/+ se esplicitamente presente; spesso manca → null.
- nome: solo se c'è un contatto/proprietario nominato; altrimenti null.`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      max_completion_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Estrai i campi dal seguente testo annuncio:\n\n${text}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return {
        ok: false,
        error: "L'AI ha restituito una risposta non valida. Riprova tra poco.",
      };
    }

    if (parsed.is_listing === false) {
      return {
        ok: false,
        error:
          "Questo testo non sembra un annuncio immobiliare. Incolla la scheda (indirizzo, prezzo, descrizione) e riprova.",
      };
    }

    const draft: LandlordLeadDraft = {
      ...EMPTY_LANDLORD_LEAD_DRAFT,
      nome: parseOptionalString(parsed.nome),
      telefono: parseOptionalString(parsed.telefono).replace(/[^\d+\s]/g, "").trim(),
      indirizzo_immobile: parseOptionalString(parsed.indirizzo_immobile),
      zona: normalizeLandlordZone(parsed.zona),
      fonte: normalizeLandlordSource(parsed.fonte),
      prezzo_richiesto: parsePrice(parsed.prezzo_richiesto),
      arredato: parseArredato(parsed.arredato),
    };

    if (!draft.zona && typeof parsed.zona === "string" && parsed.zona.trim()) {
      draft.zona = "altro";
    }

    const hasSignal =
      Boolean(draft.indirizzo_immobile) ||
      Boolean(draft.prezzo_richiesto) ||
      Boolean(draft.telefono) ||
      Boolean(draft.nome);

    if (!hasSignal) {
      return {
        ok: false,
        error:
          "Non sono riuscito a estrarre dati utili (indirizzo, prezzo o contatto). Controlla il testo incollato e riprova, oppure compila a mano.",
      };
    }

    return { ok: true, draft };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Errore sconosciuto";
    if (/OPENAI_API_KEY|Variabile d'ambiente/i.test(message)) {
      return { ok: false, error: "OpenAI non configurata su questo ambiente." };
    }
    return { ok: false, error: `Estrazione fallita: ${message}` };
  }
}

export async function createLandlordLead(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const nome = String(formData.get("nome") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  if (!nome) throw new Error("Il nome è obbligatorio.");
  if (!telefono) throw new Error("Il telefono è obbligatorio.");

  const arredatoRaw = String(formData.get("arredato") ?? "");
  const arredato =
    arredatoRaw === "true" || arredatoRaw === "on"
      ? true
      : arredatoRaw === "false" || arredatoRaw === "off"
        ? false
        : null;

  const { data, error } = await db
    .from("landlord_leads")
    .insert({
      nome,
      telefono,
      email: strOrNull(formData.get("email")),
      indirizzo_immobile: strOrNull(formData.get("indirizzo_immobile")),
      zona: strOrNull(formData.get("zona")),
      fonte: strOrNull(formData.get("fonte")),
      link_annuncio: strOrNull(formData.get("link_annuncio")),
      prezzo_richiesto: intOrNull(formData.get("prezzo_richiesto")),
      arredato,
      stato: String(formData.get("stato") ?? "da_contattare"),
      data_ultimo_contatto: strOrNull(formData.get("data_ultimo_contatto")),
      data_prossimo_followup: strOrNull(formData.get("data_prossimo_followup")),
      note: strOrNull(formData.get("note")),
    })
    .select("id")
    .single();

  if (error) throw landlordLeadsDbError(error);

  revalidatePath("/admin/pipeline");
  redirect(`/admin/pipeline/${data.id}`);
}

export async function quickAddLandlordLead(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const nome = String(formData.get("nome") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  if (!nome) return { ok: false, error: "Il nome è obbligatorio." };
  if (!telefono) return { ok: false, error: "Il telefono è obbligatorio." };

  const arredatoRaw = String(formData.get("arredato") ?? "");
  const arredato =
    arredatoRaw === "true" ? true : arredatoRaw === "false" ? false : null;

  const { error } = await db.from("landlord_leads").insert({
    nome,
    telefono,
    indirizzo_immobile: strOrNull(formData.get("indirizzo_immobile")),
    zona: strOrNull(formData.get("zona")),
    fonte: strOrNull(formData.get("fonte")),
    prezzo_richiesto: intOrNull(formData.get("prezzo_richiesto")),
    arredato,
    stato: "da_contattare",
  });

  if (error) return { ok: false, error: landlordLeadsDbError(error).message };

  revalidatePath("/admin/pipeline");
  return { ok: true };
}

export async function updateLandlordLead(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID mancante.");

  const nome = String(formData.get("nome") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  if (!nome) throw new Error("Il nome è obbligatorio.");
  if (!telefono) throw new Error("Il telefono è obbligatorio.");

  const arredatoRaw = String(formData.get("arredato") ?? "");
  const arredato =
    arredatoRaw === "true" ? true : arredatoRaw === "false" ? false : null;

  const { error } = await db
    .from("landlord_leads")
    .update({
      nome,
      telefono,
      email: strOrNull(formData.get("email")),
      indirizzo_immobile: strOrNull(formData.get("indirizzo_immobile")),
      zona: strOrNull(formData.get("zona")),
      fonte: strOrNull(formData.get("fonte")),
      link_annuncio: strOrNull(formData.get("link_annuncio")),
      prezzo_richiesto: intOrNull(formData.get("prezzo_richiesto")),
      arredato,
      stato: String(formData.get("stato") ?? "da_contattare"),
      data_ultimo_contatto: strOrNull(formData.get("data_ultimo_contatto")),
      data_prossimo_followup: strOrNull(formData.get("data_prossimo_followup")),
      note: strOrNull(formData.get("note")),
    })
    .eq("id", id);

  if (error) throw landlordLeadsDbError(error);

  revalidatePath("/admin/pipeline");
  revalidatePath(`/admin/pipeline/${id}`);
  redirect(`/admin/pipeline/${id}`);
}

export async function updateLandlordLeadStatus(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const id = String(formData.get("id") ?? "");
  const stato = String(formData.get("stato") ?? "");
  if (!id || !stato) throw new Error("Dati mancanti.");

  const today = new Date().toISOString().slice(0, 10);
  const { error } = await db
    .from("landlord_leads")
    .update({
      stato,
      data_ultimo_contatto: today,
    })
    .eq("id", id);

  if (error) throw landlordLeadsDbError(error);

  revalidatePath("/admin/pipeline");
  revalidatePath(`/admin/pipeline/${id}`);
}

export async function deleteLandlordLead(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID mancante.");

  const { error } = await db.from("landlord_leads").delete().eq("id", id);
  if (error) throw landlordLeadsDbError(error);

  revalidatePath("/admin/pipeline");
  redirect("/admin/pipeline");
}
