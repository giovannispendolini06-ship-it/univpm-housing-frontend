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

  const { error } = await db.from("leads_external").insert({
    source: String(formData.get("source") ?? "altro"),
    external_url: externalUrl,
    title: String(formData.get("title") ?? "").trim() || null,
    price: Number.isFinite(price) ? price : null,
    zone: String(formData.get("zone") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    contract_type: String(formData.get("contract_type") ?? "") || null,
    status: "nuovo",
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
