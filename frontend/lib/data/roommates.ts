import type { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { MatchLocale, MatchReason } from "@/lib/matching";
import {
  calculateRoommateMatchScore,
  toStudentProfileRow,
} from "@/lib/matching-roommates";
import { ensurePeerConversation } from "@/lib/data/messages";

type Db = ReturnType<typeof createServiceSupabaseClient>;

export type RoommateCard = {
  userId: string;
  displayName: string;
  universityLabel: string | null;
  bio: string | null;
  compatibilityScore: number;
  reasons: MatchReason[];
  alreadyInterested: boolean;
  matched: boolean;
  conversationId: string | null;
};

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function displayNameOf(user: { full_name?: string | null } | null | undefined) {
  return user?.full_name?.trim() || "Studente";
}

function universityLabelOf(row: Record<string, unknown>): string | null {
  const campus = Array.isArray(row.campuses) ? row.campuses[0] : row.campuses;
  const name = (campus as { name?: string } | null | undefined)?.name;
  if (name) return name;
  if (typeof row.polo_univpm === "string" && row.polo_univpm.trim()) {
    return row.polo_univpm.trim();
  }
  return null;
}

function bioOf(row: Record<string, unknown>): string | null {
  if (typeof row.additional_notes === "string" && row.additional_notes.trim()) {
    return row.additional_notes.trim().slice(0, 160);
  }
  if (typeof row.degree_course === "string" && row.degree_course.trim()) {
    return row.degree_course.trim().slice(0, 160);
  }
  return null;
}

export async function setOpenToGroupMatching(db: Db, userId: string, open: boolean) {
  return db.from("student_profiles").upsert(
    { user_id: userId, open_to_group_matching: open },
    { onConflict: "user_id" },
  );
}

export async function getOpenToGroupMatching(db: Db, userId: string) {
  const { data } = await db
    .from("student_profiles")
    .select("open_to_group_matching")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data?.open_to_group_matching);
}

export async function listRoommateSuggestions(
  db: Db,
  viewerId: string,
  opts?: { limit?: number; locale?: MatchLocale },
): Promise<RoommateCard[]> {
  const limit = Math.min(Math.max(opts?.limit ?? 8, 5), 10);
  const locale = opts?.locale ?? "it";

  const { data: meRaw } = await db
    .from("student_profiles")
    .select("*")
    .eq("user_id", viewerId)
    .maybeSingle();
  const me = meRaw ? toStudentProfileRow(meRaw as Record<string, unknown>) : null;
  if (!me) return [];

  const { data: myIntents } = await db
    .from("roommate_intents")
    .select("to_student_id, status")
    .eq("from_student_id", viewerId);

  const passedIds = new Set(
    (myIntents ?? [])
      .filter((i) => i.status === "passed")
      .map((i) => String(i.to_student_id)),
  );
  const interestedIds = new Set(
    (myIntents ?? [])
      .filter((i) => i.status === "interested")
      .map((i) => String(i.to_student_id)),
  );

  const { data: matches } = await db
    .from("roommate_matches")
    .select("id, student_a_id, student_b_id, conversation_id")
    .or(`student_a_id.eq.${viewerId},student_b_id.eq.${viewerId}`);

  const matchedIds = new Set<string>();
  const conversationByPeer = new Map<string, string | null>();
  for (const m of matches ?? []) {
    const peer =
      m.student_a_id === viewerId ? String(m.student_b_id) : String(m.student_a_id);
    matchedIds.add(peer);
    conversationByPeer.set(peer, m.conversation_id ? String(m.conversation_id) : null);
  }

  const { data: candidates } = await db
    .from("student_profiles")
    .select(
      `
      *,
      users:user_id ( id, full_name, role ),
      campuses:campus_id ( name )
    `,
    )
    .eq("open_to_group_matching", true)
    .neq("user_id", viewerId)
    .limit(80);

  const scored: RoommateCard[] = [];

  for (const row of candidates ?? []) {
    const userId = String(row.user_id);
    if (passedIds.has(userId)) continue;

    const user = Array.isArray(row.users) ? row.users[0] : row.users;
    if (!user || (user as { role?: string }).role !== "student") continue;

    const peer = toStudentProfileRow(row as Record<string, unknown>);
    if (!peer) continue;

    const result = calculateRoommateMatchScore(me, peer, locale);

    scored.push({
      userId,
      displayName: displayNameOf(user as { full_name?: string | null }),
      universityLabel: universityLabelOf(row as Record<string, unknown>),
      bio: bioOf(row as Record<string, unknown>),
      compatibilityScore: result.score,
      reasons: result.reasoning,
      alreadyInterested: interestedIds.has(userId),
      matched: matchedIds.has(userId),
      conversationId: conversationByPeer.get(userId) ?? null,
    });
  }

  return scored
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);
}

export async function expressRoommateInterest(
  db: Db,
  fromId: string,
  toId: string,
): Promise<
  | { ok: true; matched: boolean; conversationId: string | null; matchId: string | null }
  | { ok: false; error: string }
> {
  if (fromId === toId) return { ok: false, error: "Non puoi interessarti a te stesso." };

  const { data: target } = await db
    .from("student_profiles")
    .select("open_to_group_matching")
    .eq("user_id", toId)
    .maybeSingle();
  if (!target?.open_to_group_matching) {
    return { ok: false, error: "Questo profilo non è disponibile per il matching." };
  }

  const { error: upsertError } = await db.from("roommate_intents").upsert(
    {
      from_student_id: fromId,
      to_student_id: toId,
      status: "interested",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "from_student_id,to_student_id" },
  );
  if (upsertError) return { ok: false, error: upsertError.message };

  const { data: reciprocal } = await db
    .from("roommate_intents")
    .select("id")
    .eq("from_student_id", toId)
    .eq("to_student_id", fromId)
    .eq("status", "interested")
    .maybeSingle();

  if (!reciprocal) {
    return { ok: true, matched: false, conversationId: null, matchId: null };
  }

  const [a, b] = orderedPair(fromId, toId);
  const { data: existing } = await db
    .from("roommate_matches")
    .select("id, conversation_id")
    .eq("student_a_id", a)
    .eq("student_b_id", b)
    .maybeSingle();

  if (existing?.id) {
    return {
      ok: true,
      matched: true,
      conversationId: existing.conversation_id
        ? String(existing.conversation_id)
        : null,
      matchId: String(existing.id),
    };
  }

  const { data: match, error: matchError } = await db
    .from("roommate_matches")
    .insert({ student_a_id: a, student_b_id: b })
    .select("id")
    .single();
  if (matchError || !match) {
    return { ok: false, error: matchError?.message ?? "Match non creato." };
  }

  const peer = await ensurePeerConversation(db, {
    listingId: null,
    applicationId: null,
    roommateMatchId: String(match.id),
    participantIds: [fromId, toId],
  });

  if (peer.conversationId) {
    await db
      .from("roommate_matches")
      .update({ conversation_id: peer.conversationId })
      .eq("id", match.id);
  }

  return {
    ok: true,
    matched: true,
    conversationId: peer.conversationId,
    matchId: String(match.id),
  };
}

export async function passRoommate(
  db: Db,
  fromId: string,
  toId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await db.from("roommate_intents").upsert(
    {
      from_student_id: fromId,
      to_student_id: toId,
      status: "passed",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "from_student_id,to_student_id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function areRoommatesMatched(db: Db, userA: string, userB: string) {
  const [a, b] = orderedPair(userA, userB);
  const { data } = await db
    .from("roommate_matches")
    .select("id")
    .eq("student_a_id", a)
    .eq("student_b_id", b)
    .maybeSingle();
  return Boolean(data?.id);
}

export async function listMatchedRoommateIds(db: Db, userId: string): Promise<string[]> {
  const { data } = await db
    .from("roommate_matches")
    .select("student_a_id, student_b_id")
    .or(`student_a_id.eq.${userId},student_b_id.eq.${userId}`);
  return (data ?? []).map((m) =>
    m.student_a_id === userId ? String(m.student_b_id) : String(m.student_a_id),
  );
}

/**
 * Safe profile card. Never returns email/phone.
 * Unmatched + not opted-in → forbidden.
 */
export async function getRoommateSafeProfile(
  db: Db,
  viewerId: string,
  targetId: string,
): Promise<
  | { ok: true; matched: boolean; card: RoommateCard }
  | { ok: false; error: string; code: "forbidden" | "not_found" }
> {
  const matched = await areRoommatesMatched(db, viewerId, targetId);

  const { data: targetProfile } = await db
    .from("student_profiles")
    .select(
      `
      *,
      users:user_id ( id, full_name, role ),
      campuses:campus_id ( name )
    `,
    )
    .eq("user_id", targetId)
    .maybeSingle();

  if (!targetProfile) {
    return { ok: false, error: "Profilo non trovato.", code: "not_found" };
  }

  if (!matched && !targetProfile.open_to_group_matching) {
    return { ok: false, error: "Profilo non disponibile.", code: "forbidden" };
  }

  const user = Array.isArray(targetProfile.users)
    ? targetProfile.users[0]
    : targetProfile.users;

  const { data: meRaw } = await db
    .from("student_profiles")
    .select("*")
    .eq("user_id", viewerId)
    .maybeSingle();
  const me = meRaw ? toStudentProfileRow(meRaw as Record<string, unknown>) : null;
  const peer = toStudentProfileRow(targetProfile as Record<string, unknown>);
  const result =
    me && peer
      ? calculateRoommateMatchScore(me, peer, "it")
      : { score: 0, reasoning: [] as MatchReason[] };

  let conversationId: string | null = null;
  if (matched) {
    const [a, b] = orderedPair(viewerId, targetId);
    const { data: match } = await db
      .from("roommate_matches")
      .select("conversation_id")
      .eq("student_a_id", a)
      .eq("student_b_id", b)
      .maybeSingle();
    conversationId = match?.conversation_id ? String(match.conversation_id) : null;
  }

  return {
    ok: true,
    matched,
    card: {
      userId: targetId,
      displayName: displayNameOf(user as { full_name?: string | null }),
      universityLabel: universityLabelOf(targetProfile as Record<string, unknown>),
      bio: bioOf(targetProfile as Record<string, unknown>),
      compatibilityScore: result.score,
      reasons: result.reasoning,
      alreadyInterested: matched,
      matched,
      conversationId,
    },
  };
}
