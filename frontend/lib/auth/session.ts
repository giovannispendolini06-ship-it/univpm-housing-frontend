import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import type { UserRole } from "@/lib/domain/types";

export type SessionUser = {
  id: string;
  email: string | null;
  role: UserRole;
  fullName: string | null;
  profileCompleted: boolean;
  verificationStatus: string;
};

/** Authenticated user + public.users row. Redirects to /login if missing. */
export async function requireSession(): Promise<SessionUser> {
  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceSupabaseClient();
  const { data: profile } = await db
    .from("users")
    .select("role, full_name, profile_completed, verification_status, email")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    role: (profile?.role as UserRole) ?? "student",
    fullName: profile?.full_name ?? null,
    profileCompleted: profile?.profile_completed === true,
    verificationStatus: profile?.verification_status ?? "none",
  };
}

export async function requireRole(roles: UserRole[]): Promise<SessionUser> {
  const session = await requireSession();
  if (!roles.includes(session.role)) {
    if (session.role === "admin") redirect("/admin");
    if (session.role === "owner") redirect("/owner");
    redirect("/dashboard");
  }
  return session;
}

export async function getOptionalSession(): Promise<SessionUser | null> {
  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return null;

  const db = createServiceSupabaseClient();
  const { data: profile } = await db
    .from("users")
    .select("role, full_name, profile_completed, verification_status, email")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    role: (profile?.role as UserRole) ?? "student",
    fullName: profile?.full_name ?? null,
    profileCompleted: profile?.profile_completed === true,
    verificationStatus: profile?.verification_status ?? "none",
  };
}
