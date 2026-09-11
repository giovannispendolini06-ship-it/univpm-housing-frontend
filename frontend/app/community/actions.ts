"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import {
  createCommunityPost,
  joinCommunityGroup,
  leaveCommunityGroup,
} from "@/lib/data/community";

export async function joinGroupAction(groupId: string) {
  const session = await requireSession();
  if (session.role !== "student") {
    return { ok: false as const, error: "Solo gli studenti possono unirsi." };
  }
  const id = groupId?.trim();
  if (!id) return { ok: false as const, error: "Gruppo non valido." };

  const db = createServiceSupabaseClient();
  const { error } = await joinCommunityGroup(db, id, session.id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/community");
  revalidatePath(`/community/${id}`);
  return { ok: true as const };
}

export async function leaveGroupAction(groupId: string) {
  const session = await requireSession();
  if (session.role !== "student") {
    return { ok: false as const, error: "Non autorizzato." };
  }
  const id = groupId?.trim();
  if (!id) return { ok: false as const, error: "Gruppo non valido." };

  const db = createServiceSupabaseClient();
  const { error } = await leaveCommunityGroup(db, id, session.id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/community");
  revalidatePath(`/community/${id}`);
  return { ok: true as const };
}

export async function createPostAction(input: {
  groupId: string;
  content: string;
}) {
  const session = await requireSession();
  if (session.role !== "student") {
    return { ok: false as const, error: "Solo gli studenti possono scrivere." };
  }
  const groupId = input.groupId?.trim();
  if (!groupId) return { ok: false as const, error: "Gruppo non valido." };

  const db = createServiceSupabaseClient();
  const { data, error } = await createCommunityPost(db, {
    groupId,
    authorId: session.id,
    content: input.content ?? "",
  });
  if (error || !data) {
    return {
      ok: false as const,
      error: error?.message ?? "Post non pubblicato.",
    };
  }

  revalidatePath(`/community/${groupId}`);
  return { ok: true as const, id: String(data.id) };
}
