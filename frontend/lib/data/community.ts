import type { createServiceSupabaseClient } from "@/lib/supabase/server";

type Db = ReturnType<typeof createServiceSupabaseClient>;

export type CommunityGroup = {
  id: string;
  city: string;
  university: string | null;
  name: string;
  description: string;
  createdAt: string;
  memberCount: number;
  isMember: boolean;
};

export type CommunityPost = {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

function mapGroup(
  row: Record<string, unknown>,
  memberCount: number,
  isMember: boolean,
): CommunityGroup {
  return {
    id: String(row.id),
    city: String(row.city),
    university: row.university ? String(row.university) : null,
    name: String(row.name),
    description: String(row.description ?? ""),
    createdAt: String(row.created_at),
    memberCount,
    isMember,
  };
}

/** Profile geo used for auto-join. */
export async function getStudentGeo(db: Db, userId: string) {
  const { data } = await db
    .from("student_profiles")
    .select("city_id, university_id, city_slug, university_slug")
    .eq("user_id", userId)
    .maybeSingle();

  let citySlug =
    typeof data?.city_slug === "string" && data.city_slug.trim()
      ? data.city_slug.trim()
      : null;
  let universitySlug =
    typeof data?.university_slug === "string" && data.university_slug.trim()
      ? data.university_slug.trim()
      : null;

  if (!citySlug && data?.city_id) {
    const { data: city } = await db
      .from("cities")
      .select("slug")
      .eq("id", data.city_id)
      .maybeSingle();
    citySlug = city?.slug ? String(city.slug) : null;
  }
  if (!universitySlug && data?.university_id) {
    const { data: uni } = await db
      .from("universities")
      .select("slug")
      .eq("id", data.university_id)
      .maybeSingle();
    universitySlug = uni?.slug ? String(uni.slug) : null;
  }

  return { citySlug, universitySlug };
}

/**
 * Auto-join groups matching city (+ university when set).
 * Skips groups the user left manually (community_group_opt_outs).
 */
export async function ensureCommunityAutoJoin(db: Db, userId: string) {
  const geo = await getStudentGeo(db, userId);
  if (!geo.citySlug) {
    return { joined: [] as string[], citySlug: null as string | null, universitySlug: null as string | null };
  }

  const { data: existing } = await db
    .from("community_group_members")
    .select("group_id")
    .eq("user_id", userId);
  const existingIds = new Set((existing ?? []).map((r) => String(r.group_id)));

  const { data: optOuts } = await db
    .from("community_group_opt_outs")
    .select("group_id")
    .eq("user_id", userId);
  const optedOut = new Set((optOuts ?? []).map((r) => String(r.group_id)));

  const { data: groups } = await db
    .from("community_groups")
    .select("id, city, university, name")
    .eq("city", geo.citySlug);

  const candidates = (groups ?? []).filter((g) => {
    if (g.university == null) return true;
    return geo.universitySlug != null && g.university === geo.universitySlug;
  });

  const joined: string[] = [];
  for (const g of candidates) {
    const id = String(g.id);
    if (existingIds.has(id) || optedOut.has(id)) continue;
    const { error } = await db.from("community_group_members").insert({
      group_id: id,
      user_id: userId,
    });
    if (!error) joined.push(id);
  }

  return {
    joined,
    citySlug: geo.citySlug,
    universitySlug: geo.universitySlug,
  };
}

export async function listCommunityGroupsForUser(
  db: Db,
  userId: string,
): Promise<CommunityGroup[]> {
  const { data: groups } = await db
    .from("community_groups")
    .select("id, city, university, name, description, created_at")
    .order("name", { ascending: true });

  if (!groups?.length) return [];

  const groupIds = groups.map((g) => String(g.id));

  const { data: memberships } = await db
    .from("community_group_members")
    .select("group_id")
    .eq("user_id", userId)
    .in("group_id", groupIds);
  const memberSet = new Set((memberships ?? []).map((m) => String(m.group_id)));

  const { data: counts } = await db
    .from("community_group_members")
    .select("group_id")
    .in("group_id", groupIds);

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    const id = String(row.group_id);
    countMap.set(id, (countMap.get(id) ?? 0) + 1);
  }

  return groups.map((g) =>
    mapGroup(
      g as Record<string, unknown>,
      countMap.get(String(g.id)) ?? 0,
      memberSet.has(String(g.id)),
    ),
  );
}

export async function getCommunityGroup(
  db: Db,
  groupId: string,
  userId: string,
): Promise<CommunityGroup | null> {
  const { data } = await db
    .from("community_groups")
    .select("id, city, university, name, description, created_at")
    .eq("id", groupId)
    .maybeSingle();
  if (!data) return null;

  const { count } = await db
    .from("community_group_members")
    .select("user_id", { count: "exact", head: true })
    .eq("group_id", groupId);

  const { data: membership } = await db
    .from("community_group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  return mapGroup(data as Record<string, unknown>, count ?? 0, Boolean(membership));
}

export async function joinCommunityGroup(db: Db, groupId: string, userId: string) {
  await db
    .from("community_group_opt_outs")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  return db.from("community_group_members").upsert(
    { group_id: groupId, user_id: userId },
    { onConflict: "group_id,user_id" },
  );
}

export async function leaveCommunityGroup(db: Db, groupId: string, userId: string) {
  await db
    .from("community_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  return db.from("community_group_opt_outs").upsert(
    { group_id: groupId, user_id: userId, left_at: new Date().toISOString() },
    { onConflict: "group_id,user_id" },
  );
}

export async function listCommunityPosts(
  db: Db,
  groupId: string,
  limit = 40,
): Promise<CommunityPost[]> {
  const { data, error } = await db
    .from("community_posts")
    .select(
      `
      id, group_id, author_id, content, created_at,
      users:author_id ( full_name )
    `,
    )
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[community] listPosts", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const author = Array.isArray(row.users) ? row.users[0] : row.users;
    return {
      id: String(row.id),
      groupId: String(row.group_id),
      authorId: String(row.author_id),
      authorName:
        (author as { full_name?: string | null } | null)?.full_name?.trim() ||
        "Studente",
      content: String(row.content),
      createdAt: String(row.created_at),
    };
  });
}

export async function createCommunityPost(
  db: Db,
  input: { groupId: string; authorId: string; content: string },
) {
  const content = input.content.replace(/\s+/g, " ").trim().slice(0, 1000);
  if (content.length < 1) {
    return { data: null, error: { message: "Scrivi un messaggio." } };
  }

  const { data: membership } = await db
    .from("community_group_members")
    .select("user_id")
    .eq("group_id", input.groupId)
    .eq("user_id", input.authorId)
    .maybeSingle();
  if (!membership) {
    return { data: null, error: { message: "Non sei membro di questo gruppo." } };
  }

  return db
    .from("community_posts")
    .insert({
      group_id: input.groupId,
      author_id: input.authorId,
      content,
    })
    .select("id")
    .single();
}

export function coinquiliniHrefForGroup(group: {
  city: string;
  university: string | null;
}) {
  const params = new URLSearchParams();
  params.set("city", group.city);
  if (group.university) params.set("university", group.university);
  return `/coinquilini?${params.toString()}`;
}
