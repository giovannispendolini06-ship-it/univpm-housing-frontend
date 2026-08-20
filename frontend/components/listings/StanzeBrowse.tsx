"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Listing } from "@/lib/domain/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import StanzeListWithCompare from "@/components/listings/StanzeListWithCompare";

const ListingsMap = dynamic(() => import("@/components/listings/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-xl2 border border-sea-100 bg-sea-50/40 text-sm text-ink-muted">
      …
    </div>
  ),
});

type ViewMode = "list" | "map";

export default function StanzeBrowse({ listings }: { listings: Listing[] }) {
  const { t } = useLocale();
  const M = t.listingsMap;
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {listings.length === 1
            ? M.countOne
            : M.countMany.replace("{n}", String(listings.length))}
        </p>
        <div
          className="flex rounded-full border border-sea-100 bg-white p-0.5 shadow-sm"
          role="group"
          aria-label={M.viewLabel}
        >
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              view === "list"
                ? "bg-sea-600 text-white"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {M.viewList}
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            aria-pressed={view === "map"}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              view === "map"
                ? "bg-sea-600 text-white"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {M.viewMap}
          </button>
        </div>
      </div>

      {view === "list" ? (
        <StanzeListWithCompare listings={listings} />
      ) : (
        <ListingsMap listings={listings} />
      )}
    </div>
  );
}
