import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getRoommateSafeProfile } from "@/lib/data/roommates";
import { isSeekerRole } from "@/lib/auth/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/roommates/[id]
 * Safe card only. Never returns email/phone.
 * Direct probe of a non-opted-in / non-matched student → 403.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    if (!isSeekerRole(session.role)) {
      return NextResponse.json({ error: "Solo studenti." }, { status: 403 });
    }

    const { id } = await params;
    const targetId = id?.trim();
    if (!targetId) {
      return NextResponse.json({ error: "ID mancante." }, { status: 400 });
    }

    const db = createServiceSupabaseClient();
    const result = await getRoommateSafeProfile(db, session.id, targetId);

    if (!result.ok) {
      const status = result.code === "not_found" ? 404 : 403;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      matched: result.matched,
      profile: {
        userId: result.card.userId,
        displayName: result.card.displayName,
        universityLabel: result.card.universityLabel,
        bio: result.card.bio,
        compatibilityScore: result.card.compatibilityScore,
        reasons: result.card.reasons,
        alreadyInterested: result.card.alreadyInterested,
        matched: result.card.matched,
        conversationId: result.matched ? result.card.conversationId : null,
        email: null,
        phone: null,
        contactUnlocked: false,
      },
    });
  } catch {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }
}
