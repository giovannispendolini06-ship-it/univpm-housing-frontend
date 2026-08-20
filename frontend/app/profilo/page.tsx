import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getLifestyleProfile } from "@/lib/data/profiles";
import {
  computeProfileCompletion,
  displayFullName,
  type ProfileSex,
} from "@/lib/profile-completion";
import type { VerificationStatus } from "@/lib/verification";
import StudentShell from "@/components/student/StudentShell";
import ProfiloContent from "./ProfiloContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Il tuo profilo | Coabito",
};

export default async function ProfiloPage() {
  const session = await requireSession();
  const db = createServiceSupabaseClient();

  const { data: user } = await db
    .from("users")
    .select(
      "full_name, last_name, email, phone, avatar_url, fiscal_code, date_of_birth, place_of_birth, sex, has_guarantor, iban, company_name, verification_status, role",
    )
    .eq("id", session.id)
    .single();

  const lifestyleRow =
    session.role === "student"
      ? (await getLifestyleProfile(db, session.id)).data
      : null;

  const home =
    session.role === "owner"
      ? "/owner"
      : session.role === "admin"
        ? "/admin"
        : "/dashboard";

  const isStudent = session.role === "student";
  const completion = computeProfileCompletion(
    session.role === "owner" ? "owner" : session.role === "admin" ? "admin" : "student",
    user,
  );

  const guarantorValue: "yes" | "no" | "" =
    user?.has_guarantor === true
      ? "yes"
      : user?.has_guarantor === false
        ? "no"
        : "";

  const formInitial =
    session.role === "student" || session.role === "owner"
      ? {
          full_name: user?.full_name ?? "",
          last_name: user?.last_name ?? "",
          phone: user?.phone ?? "",
          date_of_birth: user?.date_of_birth ?? "",
          place_of_birth: user?.place_of_birth ?? "",
          sex: ((user?.sex as ProfileSex | null) ?? "") as ProfileSex | "",
          has_guarantor: guarantorValue,
          fiscal_code: user?.fiscal_code ?? "",
          iban: user?.iban ?? "",
          company_name: user?.company_name ?? "",
          avatar_url: user?.avatar_url ?? null,
        }
      : null;

  const lifestyle = lifestyleRow
    ? {
        budget_max: lifestyleRow.budget_max as number | null,
        preferred_move_in_date: lifestyleRow.preferred_move_in_date as string | null,
        polo_univpm: lifestyleRow.polo_univpm as string | null,
        cleanliness_level: lifestyleRow.cleanliness_level as number | null,
        sociability_level: lifestyleRow.sociability_level as number | null,
        is_smoker: lifestyleRow.is_smoker as boolean | null,
        has_pets: lifestyleRow.has_pets as boolean | null,
      }
    : null;

  const body = (
    <ProfiloContent
      role={session.role}
      email={user?.email ?? session.email}
      displayName={displayFullName(user ?? {})}
      completion={completion}
      formInitial={formInitial}
      verificationStatus={
        (user?.verification_status as VerificationStatus) ?? "none"
      }
      lifestyle={lifestyle}
      homeHref={home}
    />
  );

  if (isStudent) {
    return <StudentShell>{body}</StudentShell>;
  }

  return <main className="mx-auto min-h-dvh max-w-lg bg-bg">{body}</main>;
}
