/**
 * Progressive profile completion % for students and owners.
 * Used on /profilo and (next) authenticated student homepage.
 *
 * Fiscal code is intentionally NOT required here — collected at
 * application time. Lifestyle prefs come from Vesta (read-only on profile).
 */

export type ProfileSex = "F" | "M" | "X" | "prefer_not";

export type ProgressiveUserFields = {
  full_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  place_of_birth?: string | null;
  sex?: string | null;
  has_guarantor?: boolean | null;
  fiscal_code?: string | null;
  iban?: string | null;
  company_name?: string | null;
  verification_status?: string | null;
};

export type ProfileCompletion = {
  percent: number;
  filled: number;
  total: number;
  missingKeys: string[];
};

function filled(value: unknown): boolean {
  if (typeof value === "boolean") return true; // answered yes/no
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0;
  return value != null;
}

const STUDENT_KEYS: { key: keyof ProgressiveUserFields; id: string }[] = [
  { key: "full_name", id: "firstName" },
  { key: "last_name", id: "lastName" },
  { key: "date_of_birth", id: "dateOfBirth" },
  { key: "place_of_birth", id: "placeOfBirth" },
  { key: "sex", id: "sex" },
  { key: "phone", id: "phone" },
  { key: "has_guarantor", id: "guarantor" },
  { key: "avatar_url", id: "avatar" },
  { key: "verification_status", id: "verification" },
];

const OWNER_KEYS: { key: keyof ProgressiveUserFields; id: string }[] = [
  { key: "full_name", id: "firstName" },
  { key: "phone", id: "phone" },
  { key: "fiscal_code", id: "fiscal" },
  { key: "iban", id: "iban" },
  { key: "avatar_url", id: "avatar" },
  { key: "verification_status", id: "verification" },
];

function isVerified(status: string | null | undefined): boolean {
  return status === "verified";
}

/**
 * Owners: company_name OR last_name counts as "identity extras" (+1 slot).
 */
export function computeProfileCompletion(
  role: "student" | "owner" | "admin",
  user: ProgressiveUserFields | null | undefined,
): ProfileCompletion {
  if (!user || role === "admin") {
    return { percent: 100, filled: 1, total: 1, missingKeys: [] };
  }

  if (role === "student") {
    const missing: string[] = [];
    let n = 0;
    for (const { key, id } of STUDENT_KEYS) {
      if (key === "verification_status") {
        if (isVerified(user.verification_status)) n += 1;
        else missing.push(id);
        continue;
      }
      if (filled(user[key])) n += 1;
      else missing.push(id);
    }
    const total = STUDENT_KEYS.length;
    return {
      percent: Math.round((n / total) * 100),
      filled: n,
      total,
      missingKeys: missing,
    };
  }

  // owner
  const missing: string[] = [];
  let n = 0;
  const total = OWNER_KEYS.length + 1; // + identity (cognome o ragione sociale)

  for (const { key, id } of OWNER_KEYS) {
    if (key === "verification_status") {
      if (isVerified(user.verification_status) || user.verification_status === "pending") {
        n += 1;
      } else missing.push(id);
      continue;
    }
    if (filled(user[key])) n += 1;
    else missing.push(id);
  }

  if (filled(user.last_name) || filled(user.company_name)) n += 1;
  else missing.push("ownerIdentity");

  return {
    percent: Math.round((n / total) * 100),
    filled: n,
    total,
    missingKeys: missing,
  };
}

export function displayFullName(user: {
  full_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
}): string {
  if (user.company_name?.trim()) return user.company_name.trim();
  return [user.full_name, user.last_name].filter(Boolean).join(" ").trim() || "—";
}
