import type { UserRole } from "@/lib/domain/types";

/** Seeker roles share the same housing dashboard / student_profiles table. */
export type SeekerRole = "student" | "worker";

export function isSeekerRole(role: string | null | undefined): role is SeekerRole {
  return role === "student" || role === "worker";
}

export function isOwnerRole(role: string | null | undefined): boolean {
  return role === "owner";
}

/** Roles allowed at public signup (admin never via client). */
export function parseSignupRole(raw: unknown): UserRole | null {
  if (raw === "student" || raw === "worker" || raw === "owner") return raw;
  return null;
}
