"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Verifica che chi chiama sia davvero un admin, PRIMA di ogni scrittura.
// Usa il client legato alla sessione (rispetta RLS: uno può leggere solo il
// proprio ruolo), non il service client: così nessuno può auto-promuoversi.
// ---------------------------------------------------------------------------
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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

// ---------------------------------------------------------------------------
// Recupera un'anteprima dell'annuncio esterno usando i metadati Open Graph
// (gli stessi che WhatsApp/Facebook usano per mostrare l'anteprima di un
// link). Non è uno scraper completo: legge solo dati pubblici pensati per
// essere condivisi, e se il sito blocca la richiesta si torna al
// riempimento manuale, senza bloccare l'admin.
// ---------------------------------------------------------------------------
export interface ListingPreview {
  title: string | null;
  image: string | null;
  description: string | null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMetaTag(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtmlEntities(match[1]);
  }
  return null;
}

export interface ListingPreviewResult {
  preview?: ListingPreview;
  error?: string;
}

export async function fetchListingPreview(url: string): Promise<ListingPreviewResult> {
  await assertAdmin();

  if (!url || !url.startsWith("http")) {
    return { error: "Link non valido." };
  }

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BindoBot/1.0)",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(String(res.status));
    html = await res.text();
  } catch {
    return {
      error:
        "Non sono riuscito a recuperare un'anteprima automatica per questo link (il sito potrebbe bloccare le richieste automatiche). Compila i campi a mano qui sotto.",
    };
  }

  return {
    preview: {
      title: extractMetaTag(html, "og:title"),
      image: extractMetaTag(html, "og:image"),
      description: extractMetaTag(html, "og:description"),
    },
  };
}

// ---------------------------------------------------------------------------
// Crea un nuovo lead esterno (un annuncio trovato su Idealista/Subito/ecc.)
// ---------------------------------------------------------------------------
export async function createLead(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const externalUrl = String(formData.get("external_url") ?? "").trim();
  if (!externalUrl) {
    throw new Error("Il link dell'annuncio è obbligatorio.");
  }

  const priceRaw = formData.get("price");
  const price = priceRaw ? Number(priceRaw) : null;

  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const { error } = await db.from("leads_external").insert({
    source: String(formData.get("source") ?? "altro"),
    external_url: externalUrl,
    title: String(formData.get("title") ?? "").trim() || null,
    price: Number.isFinite(price) ? price : null,
    zone: String(formData.get("zone") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    contract_type: String(formData.get("contract_type") ?? "") || null,
    status: "nuovo",
    raw_data: {
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(description ? { description } : {}),
    },
  });

  if (error) {
    // Il vincolo unique su external_url fa fallire l'insert se l'annuncio
    // è già stato tracciato in precedenza: è un errore atteso, non un bug.
    throw new Error(
      error.code === "23505"
        ? "Questo annuncio è già presente nella lista."
        : `Errore nel salvataggio: ${error.message}`,
    );
  }

  revalidatePath("/admin/leads");
}

// ---------------------------------------------------------------------------
// Collega un lead esterno a un immobile già presente nel tuo database, e lo
// marca automaticamente come "convertito".
// ---------------------------------------------------------------------------
export async function linkLeadToProperty(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const leadId = String(formData.get("lead_id") ?? "");
  const propertyId = String(formData.get("property_id") ?? "");

  if (!leadId || !propertyId) {
    throw new Error("Seleziona un immobile da collegare.");
  }

  const { error } = await db
    .from("leads_external")
    .update({ matched_property_id: propertyId, status: "convertito" })
    .eq("id", leadId);

  if (error) {
    throw new Error(`Errore nel collegamento: ${error.message}`);
  }

  revalidatePath("/admin/leads");
}

// ---------------------------------------------------------------------------
// Aggiorna solo lo stato di un lead (es. "in_revisione", "contattato",
// "scartato"), senza necessariamente collegarlo a un immobile.
// ---------------------------------------------------------------------------
export async function updateLeadStatus(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const leadId = String(formData.get("lead_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!leadId || !status) {
    throw new Error("Dati mancanti per l'aggiornamento.");
  }

  const { error } = await db
    .from("leads_external")
    .update({ status })
    .eq("id", leadId);

  if (error) {
    throw new Error(`Errore nell'aggiornamento: ${error.message}`);
  }

  revalidatePath("/admin/leads");
}
