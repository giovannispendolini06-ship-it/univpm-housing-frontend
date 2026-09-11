import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { isSeekerRole } from "@/lib/auth/roles";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/community/posts
 * Body: { groupId, content }
 * Uses the user-scoped Supabase client so RLS rejects non-members.
 */
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    if (!isSeekerRole(session.role)) {
      return NextResponse.json({ error: "Solo studenti." }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as {
      groupId?: string;
      content?: string;
    } | null;

    const groupId = body?.groupId?.trim();
    const content = (body?.content ?? "").replace(/\s+/g, " ").trim().slice(0, 1000);
    if (!groupId || content.length < 1) {
      return NextResponse.json(
        { error: "groupId e content obbligatori." },
        { status: 400 },
      );
    }

    // Prefer user session client → RLS must allow insert (member only).
    let inserted: { id: string } | null = null;
    let rlsError: string | null = null;

    try {
      const userDb = await createServerSupabaseClient();
      const { data, error } = await userDb
        .from("community_posts")
        .insert({
          group_id: groupId,
          author_id: session.id,
          content,
        })
        .select("id")
        .single();
      if (error) rlsError = error.message;
      else if (data) inserted = { id: String(data.id) };
    } catch (err) {
      rlsError = err instanceof Error ? err.message : "RLS/client error";
    }

    if (!inserted) {
      // Confirm membership via service role for a clear 403
      const service = createServiceSupabaseClient();
      const { data: membership } = await service
        .from("community_group_members")
        .select("user_id")
        .eq("group_id", groupId)
        .eq("user_id", session.id)
        .maybeSingle();

      if (!membership) {
        return NextResponse.json(
          { error: "Non sei membro di questo gruppo.", code: "forbidden_rls" },
          { status: 403 },
        );
      }

      return NextResponse.json(
        { error: rlsError ?? "Inserimento non riuscito." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }
}
