"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProfileCompletionRing from "@/components/profile/ProfileCompletionRing";
import PublicRoomCard from "@/components/listings/PublicRoomCard";
import VestaAvatar from "@/components/VestaAvatar";
import MyHomeCard, { type MyTenancy } from "@/components/MyHomeCard";
import MyPaymentsSection from "@/components/MyPaymentsSection";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { Listing } from "@/lib/domain/types";
import type { ProfileCompletion } from "@/lib/profile-completion";
import { readSavedRoomIds } from "@/lib/saved-rooms";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export type HomeApplication = {
  id: string;
  status: string;
  roomId: string | null;
  roomLabel: string;
  zone: string;
  city: string;
};

const STATUS_IT: Record<string, string> = {
  submitted: "Inviata",
  under_review: "In revisione",
  accepted: "Accettata",
  rejected: "Rifiutata",
  withdrawn: "Ritirata",
};

const STATUS_EN: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

type SavedPreview = {
  id: string;
  title: string;
  zone: string;
  price: number;
  imageUrl: string | null;
};

export default function StudentHomeContent({
  firstName,
  completion,
  matchCount,
  recommended,
  applications,
  vestaProgressDone,
  vestaProgressTotal,
  hasVestaProfile,
  studentId,
  myTenancy,
  isAdmin,
}: {
  firstName: string;
  completion: ProfileCompletion;
  matchCount: number;
  recommended: Listing[];
  applications: HomeApplication[];
  vestaProgressDone: number;
  vestaProgressTotal: number;
  hasVestaProfile: boolean;
  studentId: string;
  myTenancy: MyTenancy | null;
  isAdmin: boolean;
}) {
  const { t, locale } = useLocale();
  const H = t.studentHome;
  const statusMap = locale === "en" ? STATUS_EN : STATUS_IT;
  const [saved, setSaved] = useState<SavedPreview[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSaved() {
      const ids = readSavedRoomIds().slice(0, 6);
      if (ids.length === 0) {
        if (!cancelled) setSaved([]);
        return;
      }
      const supabase = createClientSupabaseClient();
      const { data } = await supabase
        .from("rooms")
        .select(
          `
          id, room_label, price_monthly, property_id,
          properties:property_id ( zone )
        `,
        )
        .in("id", ids);

      if (cancelled) return;
      if (!data) {
        setSaved([]);
        return;
      }

      const propertyIds = data
        .map((r) => String((r as { property_id?: string }).property_id ?? ""))
        .filter(Boolean);
      const { data: images } =
        propertyIds.length > 0
          ? await supabase
              .from("property_images")
              .select("property_id, url, sort_order")
              .in("property_id", propertyIds)
              .order("sort_order", { ascending: true })
          : { data: [] as { property_id: string; url: string }[] };

      const imageByProperty = new Map<string, string>();
      for (const img of images ?? []) {
        const pid = String(img.property_id);
        if (!imageByProperty.has(pid) && img.url) {
          imageByProperty.set(pid, String(img.url));
        }
      }

      const byId = new Map(data.map((r) => [String(r.id), r]));
      const ordered: SavedPreview[] = [];
      for (const id of ids) {
        const row = byId.get(id);
        if (!row) continue;
        const propertyRaw = (row as { properties?: unknown }).properties;
        const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
        const propertyId = String((row as { property_id?: string }).property_id ?? "");
        ordered.push({
          id: String(row.id),
          title: String((row as { room_label?: string }).room_label ?? "Stanza"),
          zone: String(
            (property as { zone?: string } | null | undefined)?.zone ?? "Ancona",
          ),
          price: Number((row as { price_monthly?: number }).price_monthly ?? 0),
          imageUrl: imageByProperty.get(propertyId) ?? null,
        });
      }
      setSaved(ordered);
    }

    loadSaved();
    function onSync() {
      void loadSaved();
    }
    window.addEventListener("coabito:saved-rooms", onSync);
    window.addEventListener("storage", onSync);
    return () => {
      cancelled = true;
      window.removeEventListener("coabito:saved-rooms", onSync);
      window.removeEventListener("storage", onSync);
    };
  }, []);

  const greetingName = firstName.trim() || (locale === "en" ? "there" : "ciao");
  const profileIncomplete = completion.percent < 100;
  const vestaIncomplete = vestaProgressDone < vestaProgressTotal;

  return (
    <div className="px-4 py-6 sm:px-6">
      {isAdmin && (
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white"
          >
            Admin
          </Link>
        </div>
      )}

      <header className="mb-6 motion-safe:animate-fade-in-up">
        <p className="text-sm font-medium text-sea-700">{H.eyebrow}</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {H.greeting.replace("{name}", greetingName)}
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-ink-muted">{H.subtitle}</p>
      </header>

      {myTenancy && (
        <div className="mb-6 space-y-4">
          <MyHomeCard tenancy={myTenancy} />
          <MyPaymentsSection studentId={studentId} />
        </div>
      )}

      <section
        className="mb-6 flex flex-col gap-4 rounded-2xl border border-sea-100 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5 motion-safe:animate-fade-in-up"
        aria-labelledby="home-profile-title"
      >
        <div className="flex items-center gap-4">
          <ProfileCompletionRing percent={completion.percent} size={72} />
          <div>
            <h2 id="home-profile-title" className="font-display text-base font-bold text-ink">
              {t.profile.completionLabel.replace("{n}", String(completion.percent))}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {profileIncomplete ? H.profileHint : H.profileDone}
            </p>
          </div>
        </div>
        <Link
          href="/profilo"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-sea-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700"
        >
          {profileIncomplete ? H.completeProfile : H.viewProfile}
        </Link>
      </section>

      <section
        className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-sea-600 to-sea-800 p-4 text-white sm:p-5 motion-safe:animate-fade-in-up"
        aria-labelledby="home-vesta-title"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <VestaAvatar size={48} className="ring-2 ring-white/30" />
            <div>
              <h2 id="home-vesta-title" className="font-display text-lg font-bold">
                {H.vestaTitle}
              </h2>
              <p className="mt-1 text-sm text-white/85">
                {hasVestaProfile
                  ? matchCount > 0
                    ? H.vestaMatches.replace("{n}", String(matchCount))
                    : H.vestaNoMatches
                  : H.vestaStart}
              </p>
              {vestaIncomplete && hasVestaProfile && (
                <p className="mt-1 text-xs text-white/70">
                  {H.vestaProgress
                    .replace("{done}", String(vestaProgressDone))
                    .replace("{total}", String(vestaProgressTotal))}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/vesta"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-sunset-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sunset-600"
          >
            {hasVestaProfile ? H.vestaResume : H.vestaCta}
          </Link>
        </div>
      </section>

      <section className="mb-8" aria-labelledby="home-recommended-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2
              id="home-recommended-title"
              className="font-display text-lg font-bold text-ink"
            >
              {H.recommendedTitle}
            </h2>
            <p className="text-xs text-ink-muted">{H.recommendedSubtitle}</p>
          </div>
          <Link
            href="/stanze"
            className="shrink-0 text-xs font-semibold text-sea-700 underline underline-offset-2"
          >
            {H.seeAll}
          </Link>
        </div>

        {recommended.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sea-200 bg-white/60 px-4 py-8 text-center">
            <p className="font-display text-sm font-bold text-ink">{H.recommendedEmpty}</p>
            <p className="mt-1 text-xs text-ink-muted">{H.recommendedEmptyHint}</p>
            <Link
              href="/vesta"
              className="mt-4 inline-flex rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {H.vestaCta}
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recommended.map((listing) => (
              <li key={listing.id}>
                <PublicRoomCard listing={listing} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8" aria-labelledby="home-apps-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 id="home-apps-title" className="font-display text-lg font-bold text-ink">
              {H.appsTitle}
            </h2>
            <p className="text-xs text-ink-muted">{H.appsSubtitle}</p>
          </div>
          <Link
            href="/applications"
            className="shrink-0 text-xs font-semibold text-sea-700 underline underline-offset-2"
          >
            {H.seeAll}
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sea-200 bg-white/60 px-4 py-6 text-center">
            <p className="text-sm text-ink-muted">{H.appsEmpty}</p>
            <Link
              href="/stanze"
              className="mt-3 inline-flex text-sm font-semibold text-sea-700 underline"
            >
              {H.browseRooms}
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {applications.map((app) => (
              <li
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 shadow-card"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-ink">
                    {app.roomLabel}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {app.zone} · {app.city}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-semibold text-sea-700">
                    {statusMap[app.status] ?? app.status}
                  </span>
                  {app.roomId && (
                    <Link
                      href={`/stanza/${app.roomId}`}
                      className="text-xs font-semibold text-sea-700 underline"
                    >
                      {H.openListing}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-4" aria-labelledby="home-saved-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 id="home-saved-title" className="font-display text-lg font-bold text-ink">
              {H.savedTitle}
            </h2>
            <p className="text-xs text-ink-muted">{H.savedSubtitle}</p>
          </div>
        </div>

        {saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sea-200 bg-white/60 px-4 py-6 text-center">
            <p className="text-sm text-ink-muted">{H.savedEmpty}</p>
            <Link
              href="/stanze"
              className="mt-3 inline-flex text-sm font-semibold text-sea-700 underline"
            >
              {H.browseRooms}
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((room) => (
              <li key={room.id}>
                <Link
                  href={`/stanza/${room.id}`}
                  className="flex gap-3 rounded-xl bg-white p-3 shadow-card transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      room.imageUrl ||
                      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400&auto=format&fit=crop"
                    }
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover bg-sea-50"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-ink">
                      {room.title}
                    </p>
                    <p className="text-xs text-ink-muted">{room.zone}</p>
                    <p className="mt-0.5 text-xs font-semibold text-ink">
                      {room.price}€
                      <span className="font-normal text-ink-muted">
                        {" "}
                        {t.roomCard.perMonth}
                      </span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
