import type { createServiceSupabaseClient } from "@/lib/supabase/server";

type Db = ReturnType<typeof createServiceSupabaseClient>;

/**
 * Peer messaging data access (architecture only for P0).
 * Tables: conversations, conversation_participants, peer_messages.
 * Full realtime UI is deferred — these helpers power the /messages stub
 * and roommate mutual-match unlock.
 */

export async function listConversationsForUser(db: Db, userId: string) {
  return db
    .from("conversation_participants")
    .select(
      `
      conversation_id,
      last_read_at,
      conversations:conversation_id (
        id,
        listing_id,
        application_id,
        roommate_match_id,
        created_at,
        updated_at
      )
    `,
    )
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });
}

export async function listMessages(db: Db, conversationId: string) {
  return db
    .from("peer_messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);
}

export async function insertPeerMessage(
  db: Db,
  input: { conversationId: string; senderId: string; body: string },
) {
  const body = input.body.trim().slice(0, 4000);
  if (!body) return { data: null, error: { message: "Messaggio vuoto." } };

  return db
    .from("peer_messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      body,
    })
    .select("id, created_at")
    .single();
}

export async function isConversationParticipant(
  db: Db,
  conversationId: string,
  userId: string,
) {
  const { data } = await db
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data?.user_id);
}

/**
 * Opens a peer thread after an application is accepted OR after a mutual
 * roommate match. applicationId and roommateMatchId are optional alternatives.
 */
export async function ensurePeerConversation(
  db: Db,
  input: {
    listingId: string | null;
    applicationId?: string | null;
    roommateMatchId?: string | null;
    participantIds: [string, string];
  },
) {
  if (input.applicationId) {
    const { data: existing } = await db
      .from("conversations")
      .select("id")
      .eq("application_id", input.applicationId)
      .maybeSingle();
    if (existing?.id) {
      return { conversationId: existing.id as string, created: false };
    }
  }

  if (input.roommateMatchId) {
    const { data: existing } = await db
      .from("conversations")
      .select("id")
      .eq("roommate_match_id", input.roommateMatchId)
      .maybeSingle();
    if (existing?.id) {
      return { conversationId: existing.id as string, created: false };
    }
  }

  const { data: conversation, error } = await db
    .from("conversations")
    .insert({
      listing_id: input.listingId,
      application_id: input.applicationId ?? null,
      roommate_match_id: input.roommateMatchId ?? null,
    })
    .select("id")
    .single();

  if (error || !conversation) {
    return { conversationId: null as string | null, created: false, error };
  }

  await db.from("conversation_participants").insert(
    input.participantIds.map((userId) => ({
      conversation_id: conversation.id,
      user_id: userId,
    })),
  );

  return { conversationId: conversation.id as string, created: true };
}
