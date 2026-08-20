"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/domain/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import PublicRoomCard from "@/components/listings/PublicRoomCard";

const MAX_COMPARE = 3;

export default function StanzeListWithCompare({
  listings,
}: {
  listings: Listing[];
}) {
  const { t } = useLocale();
  const C = t.listingsCompare;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => listings.find((l) => l.id === id))
        .filter((l): l is Listing => Boolean(l)),
    [listings, selectedIds],
  );

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  return (
    <div className={selectedIds.length >= 2 ? "pb-24" : undefined}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <PublicRoomCard
            key={listing.id}
            listing={listing}
            compareSelected={selectedIds.includes(listing.id)}
            compareDisabled={
              !selectedIds.includes(listing.id) && selectedIds.length >= MAX_COMPARE
            }
            onToggleCompare={() => toggle(listing.id)}
          />
        ))}
      </div>

      {selectedIds.length >= 2 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sea-100 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,42,46,0.08)] backdrop-blur-sm sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {C.selectedCount.replace("{n}", String(selectedIds.length))}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-full border border-sea-200 px-4 py-2 text-sm font-semibold text-ink-muted"
              >
                {C.clear}
              </button>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sea-700"
              >
                {C.compareButton.replace("{n}", String(selectedIds.length))}
              </button>
            </div>
          </div>
        </div>
      )}

      {open && selected.length >= 2 && (
        <CompareModal
          listings={selected}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function CompareModal({
  listings,
  onClose,
}: {
  listings: Listing[];
  onClose: () => void;
}) {
  const { t } = useLocale();
  const C = t.listingsCompare;
  const L = t.listingsCard;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full overflow-auto rounded-t-2xl bg-bg shadow-xl sm:max-w-5xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sea-100 bg-white px-4 py-3 sm:px-6">
          <h2 id="compare-title" className="font-display text-lg font-bold text-ink">
            {C.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-sea-700 hover:bg-sea-50"
          >
            {C.close}
          </button>
        </div>

        <div className="overflow-x-auto p-4 sm:p-6">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="w-28 py-2 pr-3 text-xs font-semibold uppercase tracking-wide text-ink-muted" />
                {listings.map((listing) => (
                  <th key={listing.id} className="px-2 py-2 align-bottom">
                    <div className="overflow-hidden rounded-xl border border-sea-100 bg-white shadow-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={listing.photoUrls[0]}
                        alt=""
                        className="h-28 w-full object-cover"
                      />
                      <div className="p-2.5">
                        <p className="font-display text-sm font-bold leading-snug text-ink">
                          {listing.title}
                        </p>
                        {listing.guaranteedRent && (
                          <span className="mt-1 inline-flex rounded-full bg-sea-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            {L.guaranteedRent}
                          </span>
                        )}
                        <Link
                          href={`/stanza/${listing.id}`}
                          className="mt-2 inline-block text-xs font-semibold text-sea-700 underline"
                        >
                          {L.seeDetails}
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label={C.rowPrice}>
                {listings.map((l) => (
                  <td key={l.id} className="px-2 py-3 align-top font-semibold tabular-nums text-ink">
                    {l.monthlyRent}€
                    <span className="block text-[11px] font-normal text-ink-muted">
                      {l.utilitiesEstimate > 0
                        ? `+ ${l.utilitiesEstimate}€ utenze`
                        : C.utilitiesIncludedHint}
                    </span>
                  </td>
                ))}
              </CompareRow>
              <CompareRow label={C.rowZone}>
                {listings.map((l) => (
                  <td key={l.id} className="px-2 py-3 align-top text-ink">
                    {l.neighbourhood ?? L.zoneTbd}
                    <span className="block text-[11px] text-ink-muted">{l.cityLabel}</span>
                  </td>
                ))}
              </CompareRow>
              <CompareRow label={C.rowDistance}>
                {listings.map((l) => (
                  <td key={l.id} className="px-2 py-3 align-top text-ink-muted">
                    {C.distancePending}
                  </td>
                ))}
              </CompareRow>
              <CompareRow label={C.rowMatch}>
                {listings.map((l) => (
                  <td key={l.id} className="px-2 py-3 align-top font-semibold text-ink">
                    {l.matchScore != null ? `${Math.round(l.matchScore)}%` : C.matchUnknown}
                  </td>
                ))}
              </CompareRow>
              <CompareRow label={C.rowGuaranteed}>
                {listings.map((l) => (
                  <td key={l.id} className="px-2 py-3 align-top text-ink">
                    {l.guaranteedRent ? C.yes : C.no}
                  </td>
                ))}
              </CompareRow>
              <CompareRow label={C.rowTags}>
                {listings.map((l) => {
                  const tags = (l.atmosphereTags ?? []).filter(Boolean);
                  return (
                    <td key={l.id} className="px-2 py-3 align-top text-ink">
                      {tags.length === 0 ? (
                        <span className="text-ink-muted">{C.noTags}</span>
                      ) : (
                        <ul className="flex flex-wrap gap-1">
                          {tags.map((tag) => (
                            <li
                              key={tag}
                              className="border border-dashed border-sea-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sea-700"
                              style={{ borderRadius: "4px 8px 4px 8px" }}
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  );
                })}
              </CompareRow>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <tr className="border-t border-sea-100">
      <th
        scope="row"
        className="py-3 pr-3 align-top text-xs font-semibold uppercase tracking-wide text-ink-muted"
      >
        {label}
      </th>
      {children}
    </tr>
  );
}
