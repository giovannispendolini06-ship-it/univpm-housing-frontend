// POST /api/owner/applications/[id]/accept
//
// Accepts a candidatura for a room owned by the authenticated owner.
// Ownership is verified with the user-scoped Supabase client (RLS):
// calling this for someone else's listing returns 403.
// Tenancy + closed_leases side effects use the service role after authz.

import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { acceptApplicationAndOpenTenancy } from "@/lib/data/applications";
import { ensurePeerConversation } from "@/lib/data/messages";
import {
  sendEmail,
  buildApplicationStatusEmail,
} from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const params = await Promise.resolve(context.params);
  const applicationId = params.id?.trim();
  if (!applicationId) {
    return NextResponse.json({ error: "application id mancante." }, { status: 400 });
  }

  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sessione non valida." }, { status: 401 });
  }

  const { data: profile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "owner" && profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Solo proprietari o admin possono accettare candidature." },
      { status: 403 },
    );
  }

  // RLS: owners only see applications on their own rooms.
  // A direct call for another owner's listing yields no row → 403.
  const { data: visibleApp, error: visibleError } = await authClient
    .from("room_applications")
    .select("id, room_id, student_id, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (visibleError) {
    return NextResponse.json(
      { error: visibleError.message },
      { status: 500 },
    );
  }
  if (!visibleApp) {
    return NextResponse.json(
      { error: "Candidatura non trovata o non di tua competenza." },
      { status: 403 },
    );
  }

  let ownerId = user.id;
  if (profile.role === "admin") {
    const dbPeek = createServiceSupabaseClient();
    const { data: appRow } = await dbPeek
      .from("room_applications")
      .select(
        `id, rooms:room_id!inner ( properties:property_id!inner ( owner_id ) )`,
      )
      .eq("id", applicationId)
      .maybeSingle();
    const room = Array.isArray(appRow?.rooms) ? appRow?.rooms[0] : appRow?.rooms;
    const propRaw = room
      ? (room as { properties?: unknown }).properties
      : null;
    const prop = Array.isArray(propRaw) ? propRaw[0] : propRaw;
    ownerId =
      (prop as { owner_id?: string } | null | undefined)?.owner_id ?? user.id;
  }

  const db = createServiceSupabaseClient();
  const result = await acceptApplicationAndOpenTenancy(db, {
    applicationId,
    actorOwnerId: ownerId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    await ensurePeerConversation(db, {
      listingId: result.roomId,
      applicationId,
      participantIds: [ownerId, result.studentId],
    });
  } catch (err) {
    console.error("[api/accept] conversation", err);
  }

  try {
    const notifyIds = [
      result.studentId,
      ...result.rejected.map((r) => r.studentId),
    ];
    const { data: users } = await db
      .from("users")
      .select("id, email, full_name")
      .in("id", notifyIds);
    const byId = new Map((users ?? []).map((u) => [String(u.id), u]));

    const acceptedUser = byId.get(result.studentId);
    if (acceptedUser?.email) {
      await sendEmail({
        to: acceptedUser.email,
        ...buildApplicationStatusEmail({
          fullName: acceptedUser.full_name ?? "",
          statusLabel: "accettata",
        }),
      });
    }
    for (const rej of result.rejected) {
      const u = byId.get(rej.studentId);
      if (!u?.email) continue;
      await sendEmail({
        to: u.email,
        ...buildApplicationStatusEmail({
          fullName: u.full_name ?? "",
          statusLabel: "rifiutata",
        }),
      });
    }
  } catch (err) {
    console.error("[api/accept] notify", err);
  }

  return NextResponse.json({
    ok: true,
    tenancyId: result.tenancyId,
    closedLeaseId: result.closedLeaseId,
    rejectedCount: result.rejected.length,
  });
}
