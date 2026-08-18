"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { sendEmail, buildWelcomeEmail } from "@/lib/email";
import { upsertLifestyleProfile } from "@/lib/data/profiles";
import { computeRoomMatches } from "@/lib/matching-rooms";
import type { StudentProfileRow } from "@/lib/matching";

interface OnboardingResult {
  error?: string;
}

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

  // Student lifestyle (stage 2) — short prefs before chat value
  let budgetMax: number | null = null;
  let moveIn: string | null = null;
  let polo: string | null = null;
  let cleanliness: number | null = null;
  let isSmoker: boolean | null = null;
  let toleratesSmokers: boolean | null = null;
  let hasPets: boolean | null = null;

  if (role === "student") {
    budgetMax = Number(formData.get("budget_max"));
    if (!Number.isFinite(budgetMax) || budgetMax < 100) {
      return { error: "Indica un budget mensile realistico (minimo 100€)." };
    }
    moveIn = String(formData.get("preferred_move_in_date") ?? "").trim() || null;
    if (!moveIn) return { error: "Indica una data di ingresso preferita." };
    polo = String(formData.get("polo_univpm") ?? "").trim() || null;
    if (!polo) return { error: "Seleziona il tuo polo / campus." };
    cleanliness = Number(formData.get("cleanliness_level"));
    if (!Number.isFinite(cleanliness) || cleanliness < 1 || cleanliness > 5) {
      return { error: "Indica il tuo livello di ordine (1–5)." };
    }
    isSmoker = formData.get("is_smoker") === "yes";
    toleratesSmokers = formData.get("tolerates_smokers") === "yes";
    hasPets = formData.get("has_pets") === "yes";
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

  if (role === "student") {
    // Resolve campus_id from polo code when possible
    let campusId: string | null = null;
    const { data: campuses } = await db
      .from("campuses")
      .select("id, code")
      .ilike("code", polo ?? "");
    campusId = campuses?.[0]?.id ?? null;

    const { error: lifestyleError } = await upsertLifestyleProfile(db, {
      userId: user.id,
      budgetMax,
      preferredMoveInDate: moveIn,
      poloUnivpm: polo,
      campusId,
      cleanlinessLevel: cleanliness,
      isSmoker,
      toleratesSmokers,
      hasPets,
      sociabilityLevel: 3,
      guestsFrequency: "a_volte",
      studyHabit: "flessibile",
    });

    if (lifestyleError) {
      console.error("[onboarding] lifestyle", lifestyleError.message);
      // Non blocchiamo l'account: Vesta può completare dopo
    } else {
      try {
        const { data: sp } = await db
          .from("student_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (sp && sp.budget_max) {
          await computeRoomMatches(db, sp as StudentProfileRow, "it");
        }
      } catch (err) {
        console.error("[onboarding] match seed", err);
      }
    }
  }

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  revalidatePath("/stanze");

  const welcomeEmail = buildWelcomeEmail({
    fullName: profile?.full_name ?? "",
    role: role === "owner" ? "owner" : "student",
  });
  await sendEmail({ to: user.email ?? "", ...welcomeEmail });

  redirect(
    role === "owner" ? "/host/properties" : role === "admin" ? "/admin" : "/dashboard",
  );
}
