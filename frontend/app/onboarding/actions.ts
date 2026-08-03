"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { sendEmail, buildWelcomeEmail } from "@/lib/email";

interface OnboardingResult {
  error?: string;
}

// ---------------------------------------------------------------------------
// NB tecnico: questa funzione NON lancia mai un Error per errori di
// validazione — restituisce { error } e basta. Il redirect finale (successo)
// resta l'unica cosa che può "lanciare" (è come funziona redirect() in
// Next.js). Tenerli separati evita che un try/catch sul client intercetti
// per sbaglio anche il redirect riuscito.
// ---------------------------------------------------------------------------
export async function completeOnboarding(formData: FormData): Promise<OnboardingResult> {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await authClient
    .from("users")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "student";

  const phone = String(formData.get("phone") ?? "").trim();
  const fiscalCode = String(formData.get("fiscal_code") ?? "").trim();
  const dateOfBirth = String(formData.get("date_of_birth") ?? "").trim();

  if (!phone) return { error: "Il numero di telefono è obbligatorio." };
  if (!fiscalCode) return { error: "Il codice fiscale (o P.IVA) è obbligatorio." };
  if (role === "student" && !dateOfBirth) {
    return { error: "La data di nascita è obbligatoria." };
  }

  const avatarFile = formData.get("avatar");
  if (!(avatarFile instanceof File) || avatarFile.size === 0) {
    return { error: "La foto profilo è obbligatoria." };
  }

  const db = createServiceSupabaseClient();

  const extension = avatarFile.name.split(".").pop() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await db.storage
    .from("avatars")
    .upload(path, avatarFile, {
      contentType: avatarFile.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    return { error: `Errore nel caricamento della foto: ${uploadError.message}` };
  }

  const { data: publicUrlData } = db.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await db
    .from("users")
    .update({
      phone,
      fiscal_code: fiscalCode,
      date_of_birth: role === "student" ? dateOfBirth : null,
      avatar_url: publicUrlData.publicUrl,
      profile_completed: true,
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: `Errore nel salvataggio: ${updateError.message}` };
  }

  revalidatePath("/onboarding");

  // Email di benvenuto, personalizzata in base al ruolo. Non blocca mai il
  // flusso: se fallisce, sendEmail() logga soltanto e prosegue.
  const welcomeEmail = buildWelcomeEmail({
    fullName: profile?.full_name ?? "",
    role: role === "owner" ? "owner" : "student",
  });
  await sendEmail({ to: user.email ?? "", ...welcomeEmail });

  // Solo qui, dopo il successo, chiamiamo redirect (nessun try/catch attorno
  // a questa funzione sul client, così il redirect funziona regolarmente).
  redirect(role === "owner" ? "/owner" : role === "admin" ? "/admin" : "/dashboard");
}
