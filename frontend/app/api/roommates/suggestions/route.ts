import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { isSeekerRole } from "@/lib/auth/roles";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import {
  getOpenToGroupMatching,
  listRoommateSuggestions,
} from "@/lib/data/roommates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/roommates/suggestions — auth only, no contact fields. */
export async function GET() {
  try {
    const session = await requireSession();
    if (!isSeekerRole(session.role)) {
      return NextResponse.json({ error: "Solo studenti." }, { status: 403 });
    }

    const db = createServiceSupabaseClient();
    const optedIn = await getOpenToGroupMatching(db, session.id);
    if (!optedIn) {
      return NextResponse.json({
        optedIn: false,
        suggestions: [],
        message: "Attiva il matching persone dal profilo o da /coinquilini.",
      });
    }

    const suggestions = await listRoommateSuggestions(db, session.id, { limit: 8 });

    return NextResponse.json({
      optedIn: true,
      suggestions: suggestions.map((s) => ({
        userId: s.userId,
        displayName: s.displayName,
        universityLabel: s.universityLabel,
        bio: s.bio,
        compatibilityScore: s.compatibilityScore,
        reasons: s.reasons,
        alreadyInterested: s.alreadyInterested,
        matched: s.matched,
        conversationId: s.matched ? s.conversationId : null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }
}
