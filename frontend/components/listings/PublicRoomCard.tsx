"use client";

import Link from "next/link";
import type { Listing } from "@/lib/domain/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import MatchScoreRing from "@/components/MatchScoreRing";
import VestaAvatar from "@/components/VestaAvatar";
import ShareListingButton from "@/components/listings/ShareListingButton";
import SaveRoomButton from "@/components/listings/SaveRoomButton";
import { buildMatchFitSentence } from "@/lib/match-explanation";

export default function PublicRoomCard({
  listing,
  compareSelected = false,
  compareDisabled = false,
  onToggleCompare,
}: {
  listing: Listing;
  compareSelected?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: () => void;
}) {
  const { t, locale } = useLocale();
  const total = listing.monthlyRent + listing.utilitiesEstimate;
  const photo = listing.photoUrls[0];
  const zoneLabel = `${listing.neighbourhood ?? t.listingsCard.zoneTbd} · ${listing.cityLabel}`;
  const score = listing.matchScore ?? null;
  const tags = (listing.atmosphereTags ?? []).filter(Boolean).slice(0, 3);

  const fitSentence =
    score != null && listing.matchReasons && listing.matchReasons.length > 0
      ? buildMatchFitSentence({
          reasons: listing.matchReasons,
          guaranteedRent: listing.guaranteedRent,
          locale: locale === "en" ? "en" : "it",
        })
      : null;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-xl2 border border-sea-100 bg-white shadow-card transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg">
      {onToggleCompare && (
        <label className="absolute left-2 top-2 z-10 flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-ink shadow-sm">
          <input
            type="checkbox"
            checked={compareSelected}
            disabled={compareDisabled && !compareSelected}
            onChange={onToggleCompare}
            className="h-4 w-4 rounded border-sea-200 text-sea-600 focus:ring-sea-500"
            aria-label={t.listingsCompare.selectAria}
          />
          <span>{t.listingsCompare.selectShort}</span>
        </label>
      )}

      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          className="h-44 w-full object-cover sm:h-48"
        />
        {!listing.hasRealPhoto && (
          <span className="absolute bottom-2 left-2 rounded-md bg-ink/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {t.listingsCard.photoSoon}
          </span>
        )}
        {listing.guaranteedRent && (
          <span
            className={`absolute inline-flex items-center gap-1 rounded-full bg-sea-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ${
              onToggleCompare
                ? "left-2 top-11 sm:left-auto sm:right-14 sm:top-2"
                : "left-2 top-2"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3.5 8.2l3 3 6-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t.listingsCard.guaranteedRent}
          </span>
        )}
        {score != null && (
          <div className="absolute right-2 top-2 rounded-full bg-white/95 p-0.5 shadow-card">
            <MatchScoreRing score={score} size={48} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="font-display text-base font-bold text-ink">{listing.title}</h2>
          {listing.landlordVerified && (
            <span className="rounded-full bg-sea-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sea-700">
              {t.listingsCard.verifiedOwner}
            </span>
          )}
        </div>

        <p className="text-xs text-ink-muted">{zoneLabel}</p>

        <p className="font-display text-sm font-bold text-ink">
          {listing.monthlyRent}€
          <span className="ml-1 font-body text-xs font-normal text-ink-muted">
            {t.roomCard.perMonth}
            {listing.utilitiesEstimate > 0
              ? ` ${t.roomCard.plusUtilities.replace(
                  "{utilities}",
                  String(listing.utilitiesEstimate),
                )}`
              : ""}
          </span>
        </p>
        <p className="text-[11px] text-ink-muted">
          {t.roomCard.total.replace("{total}", String(total))}
        </p>

        {fitSentence ? (
          <div className="flex gap-2 rounded-xl bg-sea-50/80 px-2.5 py-2">
            <VestaAvatar size={28} />
            <p className="text-[12px] leading-snug text-ink">{fitSentence}</p>
          </div>
        ) : (
          <p className="text-[12px] text-ink-muted">
            <Link href="/login?next=/dashboard" className="font-semibold text-sea-700 underline">
              {t.listingsCard.discoverFit}
            </Link>
          </p>
        )}

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="border border-dashed border-sea-200 bg-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sea-700"
                style={{ borderRadius: "4px 8px 4px 8px" }}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Link
            href={`/stanza/${listing.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-sea-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-sea-700"
          >
            {t.listingsCard.seeDetails}
          </Link>
          <SaveRoomButton roomId={listing.id} />
          <ShareListingButton
            roomId={listing.id}
            title={listing.title}
            zoneLabel={zoneLabel}
            priceMonthly={listing.monthlyRent}
          />
        </div>
      </div>
    </article>
  );
}
