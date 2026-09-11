import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import StudentShell from "@/components/student/StudentShell";
import CommunityComposer from "@/components/community/CommunityComposer";
import GroupMembershipButton from "@/components/community/GroupMembershipButton";
import {
  coinquiliniHrefForGroup,
  ensureCommunityAutoJoin,
  getCommunityGroup,
  listCommunityPosts,
} from "@/lib/data/community";

export const dynamic = "force-dynamic";

type Params = Promise<{ groupId: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  return { title: "Bacheca community | Coabito", robots: { index: false } };
}

export default async function CommunityGroupPage({
  params,
}: {
  params: Params;
}) {
  const session = await requireSession();
  if (session.role !== "student") {
    redirect(session.role === "owner" ? "/owner" : "/dashboard");
  }

  const { groupId } = await params;
  const db = createServiceSupabaseClient();
  const group = await getCommunityGroup(db, groupId, session.id);
  if (!group) notFound();

  const posts = group.isMember
    ? await listCommunityPosts(db, group.id)
    : [];
  const coinquiliniHref = coinquiliniHrefForGroup(group);

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/community"
          className="mb-4 inline-block text-sm text-ink-muted underline"
        >
          ← Tutti i gruppi
        </Link>

        <header className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">
                {group.name}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                {group.city}
                {group.university ? ` · ${group.university}` : " · tutta la città"}
                {" · "}
                {group.memberCount} membr{group.memberCount === 1 ? "o" : "i"}
              </p>
            </div>
            <GroupMembershipButton
              groupId={group.id}
              isMember={group.isMember}
            />
          </div>
          <p className="mt-3 text-sm text-ink-muted">{group.description}</p>

          <Link
            href={coinquiliniHref}
            className="mt-4 inline-flex rounded-full bg-sea-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sea-700"
          >
            Trova coinquilini in {group.city}
            {group.university ? ` · ${group.university}` : ""} →
          </Link>
        </header>

        {!group.isMember ? (
          <div className="rounded-xl2 border border-dashed border-sea-200 bg-white px-4 py-8 text-center">
            <p className="font-display font-bold text-ink">
              Bacheca riservata ai membri
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
              Unisciti al gruppo per leggere e scrivere tip su quartieri,
              trasferimenti e coinquilini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <CommunityComposer groupId={group.id} />

            <section>
              <h2 className="mb-3 font-display text-sm font-bold text-ink">
                Bacheca
              </h2>
              {posts.length === 0 ? (
                <p className="rounded-xl2 border border-sea-100 bg-white px-4 py-6 text-center text-sm text-ink-muted">
                  Ancora nessun post. Scrivi il primo messaggio qui sopra.
                </p>
              ) : (
                <ul className="space-y-3">
                  {posts.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-xl2 border border-sea-100 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-xs font-semibold text-sea-700">
                          {p.authorName}
                        </p>
                        <time
                          className="text-[10px] text-ink-muted"
                          dateTime={p.createdAt}
                        >
                          {new Date(p.createdAt).toLocaleString("it-IT", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">
                        {p.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </StudentShell>
  );
}
