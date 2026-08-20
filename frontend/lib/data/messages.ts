import type { createServiceSupabaseClient } from "@/lib/supabase/server";

type Db = ReturnType<typeof createServiceSupabaseClient>;

/**
 * Peer messaging data access (architecture only for P0).
 * Tables: conversations, conversation_participants, peer_messages.
 * Full realtime UI is deferred — these helpers power the /messages stub.
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

/**
 * Opens a peer thread after an application is accepted.
 * Called from application status flow when ready (service role).
 */
export async function ensurePeerConversation(
  db: Db,
  input: {
    listingId: string | null;
    applicationId: string;
    participantIds: [string, string];
  },
) {
  const { data: existing } = await db
    .from("conversations")
    .select("id")
    .eq("application_id", input.applicationId)
    .maybeSingle();

  if (existing?.id) return { conversationId: existing.id as string, created: false };

  const { data: conversation, error } = await db
    .from("conversations")
    .insert({
      listing_id: input.listingId,
      application_id: input.applicationId,
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
