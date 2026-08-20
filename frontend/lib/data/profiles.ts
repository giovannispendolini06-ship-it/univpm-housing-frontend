import { createServiceSupabaseClient } from "@/lib/supabase/server";

type Db = ReturnType<typeof createServiceSupabaseClient>;

export type LifestyleUpsert = {
  userId: string;
  budgetMax?: number | null;
  preferredMoveInDate?: string | null;
  studyHabit?: string | null;
  sociabilityLevel?: number | null;
  guestsFrequency?: string | null;
  cleanlinessLevel?: number | null;
  isSmoker?: boolean | null;
  hasPets?: boolean | null;
  degreeCourse?: string | null;
  toleratesSmokers?: boolean | null;
  campusId?: string | null;
  poloUnivpm?: string | null;
};

export async function upsertLifestyleProfile(db: Db, input: LifestyleUpsert) {
  const row: Record<string, unknown> = {
    user_id: input.userId,
  };
  if (input.budgetMax !== undefined) row.budget_max = input.budgetMax;
  if (input.preferredMoveInDate !== undefined) {
    row.preferred_move_in_date = input.preferredMoveInDate;
  }
  if (input.studyHabit !== undefined) row.study_habit = input.studyHabit;
  if (input.sociabilityLevel !== undefined) {
    row.sociability_level = input.sociabilityLevel;
  }
  if (input.guestsFrequency !== undefined) {
    row.guests_frequency = input.guestsFrequency;
  }
  if (input.cleanlinessLevel !== undefined) {
    row.cleanliness_level = input.cleanlinessLevel;
  }
  if (input.isSmoker !== undefined) row.is_smoker = input.isSmoker;
  if (input.hasPets !== undefined) row.has_pets = input.hasPets;
  if (input.degreeCourse !== undefined) row.degree_course = input.degreeCourse;
  if (input.toleratesSmokers !== undefined) {
    row.tolerates_smokers = input.toleratesSmokers;
  }
  if (input.campusId !== undefined) row.campus_id = input.campusId;
  if (input.poloUnivpm !== undefined) row.polo_univpm = input.poloUnivpm;

  return db.from("student_profiles").upsert(row, { onConflict: "user_id" });
}

export async function getLifestyleProfile(db: Db, userId: string) {
  return db.from("student_profiles").select("*").eq("user_id", userId).maybeSingle();
}

export async function listCampuses(db: Db) {
  return db
    .from("campuses")
    .select("id, name, code, city_id")
    .order("name", { ascending: true });
}
