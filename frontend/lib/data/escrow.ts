import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { EscrowPayment, EscrowStatus } from "@/lib/escrow";

type Db = ReturnType<typeof createServiceSupabaseClient>;

function mapRow(row: Record<string, unknown>): EscrowPayment {
  return {
    id: String(row.id),
    applicationId: row.application_id ? String(row.application_id) : null,
    roomId: String(row.room_id),
    studentId: String(row.student_id),
    ownerId: String(row.owner_id),
    amountCents: Number(row.amount_cents) || 0,
    currency: String(row.currency ?? "eur"),
    status: row.status as EscrowStatus,
    coverage: (row.coverage as EscrowPayment["coverage"]) ?? null,
    firstMonthCents:
      row.first_month_cents != null ? Number(row.first_month_cents) : null,
    depositCents: row.deposit_cents != null ? Number(row.deposit_cents) : null,
    studentConfirmedAt: row.student_confirmed_at
      ? String(row.student_confirmed_at)
      : null,
    ownerConfirmedAt: row.owner_confirmed_at
      ? String(row.owner_confirmed_at)
      : null,
    createdAt: String(row.created_at),
  };
}

/** Soft-fail if migration not applied yet. */
export async function listEscrowForStudent(
  db: Db,
  studentId: string,
): Promise<EscrowPayment[]> {
  const { data, error } = await db
    .from("escrow_payments")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[escrow] listEscrowForStudent", error.message);
    return [];
  }
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function listEscrowForOwner(
  db: Db,
  ownerId: string,
): Promise<EscrowPayment[]> {
  const { data, error } = await db
    .from("escrow_payments")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[escrow] listEscrowForOwner", error.message);
    return [];
  }
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}
