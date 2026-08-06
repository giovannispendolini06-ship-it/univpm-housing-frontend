"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

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

export async function createLandlordLead(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const nome = String(formData.get("nome") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  if (!nome) throw new Error("Il nome è obbligatorio.");
  if (!telefono) throw new Error("Il telefono è obbligatorio.");

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
      arredato:
        formData.get("arredato") === "on"
          ? true
          : formData.get("arredato") === "off"
            ? false
            : null,
      stato: String(formData.get("stato") ?? "da_contattare"),
      data_ultimo_contatto: strOrNull(formData.get("data_ultimo_contatto")),
      data_prossimo_followup: strOrNull(formData.get("data_prossimo_followup")),
      note: strOrNull(formData.get("note")),
    })
    .select("id")
    .single();

  if (error) throw new Error(`Errore nel salvataggio: ${error.message}`);

  revalidatePath("/admin/pipeline");
  redirect(`/admin/pipeline/${data.id}`);
}

export async function quickAddLandlordLead(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const nome = String(formData.get("nome") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  if (!nome) throw new Error("Il nome è obbligatorio.");
  if (!telefono) throw new Error("Il telefono è obbligatorio.");

  const { error } = await db.from("landlord_leads").insert({
    nome,
    telefono,
    indirizzo_immobile: strOrNull(formData.get("indirizzo_immobile")),
    zona: strOrNull(formData.get("zona")),
    fonte: strOrNull(formData.get("fonte")),
    stato: "da_contattare",
  });

  if (error) throw new Error(`Errore nel salvataggio: ${error.message}`);

  revalidatePath("/admin/pipeline");
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

  if (error) throw new Error(`Errore nell'aggiornamento: ${error.message}`);

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

  if (error) throw new Error(`Errore: ${error.message}`);

  revalidatePath("/admin/pipeline");
  revalidatePath(`/admin/pipeline/${id}`);
}

export async function deleteLandlordLead(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID mancante.");

  const { error } = await db.from("landlord_leads").delete().eq("id", id);
  if (error) throw new Error(`Errore: ${error.message}`);

  revalidatePath("/admin/pipeline");
  redirect("/admin/pipeline");
}
