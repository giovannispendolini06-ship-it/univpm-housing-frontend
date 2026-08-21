"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/domain/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import StanzeListWithCompare from "@/components/listings/StanzeListWithCompare";
import StanzeFiltersPanel from "@/components/listings/StanzeFiltersPanel";
import { publishStanzeFilterChrome } from "@/components/listings/StanzeFilterChrome";
import {
  collectZones,
  DEFAULT_FILTERS,
  filterAndSortListings,
  type StanzeFilterState,
  type StanzeSort,
} from "@/lib/listings-filters";
import styles from "./StanzeFilters.module.css";

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
  const F = t.listingsFilters;
  const [view, setView] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<StanzeFilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<StanzeSort>("recommended");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const zones = useMemo(() => collectZones(listings), [listings]);
  const filtered = useMemo(
    () => filterAndSortListings(listings, filters, sort),
    [listings, filters, sort],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const showFilters = useCallback(() => {
    setCollapsed(false);
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(min-width: 1024px)").matches
    ) {
      setMobileOpen(true);
    }
  }, []);

  useEffect(() => {
    publishStanzeFilterChrome({
      active: true,
      filtersCollapsed: collapsed,
      showFilters,
    });
    return () => {
      publishStanzeFilterChrome({
        active: false,
        filtersCollapsed: false,
        showFilters: () => {},
      });
    };
  }, [collapsed, showFilters]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const countLabel =
    filtered.length === 1
      ? F.headCountOne
      : F.headCount.replace("{n}", String(filtered.length));

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

        {view === "map" ? (
          <ListingsMap listings={filtered.length ? filtered : listings} />
        ) : (
          <div className="flex items-start gap-4 lg:gap-5">
            {/* Desktop sidebar */}
            <aside
              className={`${styles.panelSettle} hidden shrink-0 overflow-hidden lg:block ${
                collapsed
                  ? "pointer-events-none w-0 opacity-0 -mr-4"
                  : "w-[290px] opacity-100"
              }`}
              aria-hidden={collapsed}
            >
              <div className="w-[290px]">
                <StanzeFiltersPanel
                  filters={filters}
                  onChange={setFilters}
                  onReset={resetFilters}
                  onCollapse={() => setCollapsed(true)}
                  zones={zones}
                  resultCount={filtered.length}
                  variant="sidebar"
                />
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
                        setCollapsed((c) => !c);
                      } else {
                        setMobileOpen(true);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-sea-100 bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-sm"
                  >
                    <span aria-hidden>{collapsed ? "☰" : "‹"}</span>
                    <span className="lg:hidden">{F.show}</span>
                    <span className="hidden lg:inline">
                      {collapsed ? F.show : F.hide}
                    </span>
                  </button>
                  <h2 className="font-display text-xl font-semibold text-ink sm:text-[21px]">
                    {F.pageTitle}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[12.5px] text-ink-muted">{countLabel}</span>
                  <label className="sr-only" htmlFor="stanze-sort">
                    {F.sortLabel}
                  </label>
                  <select
                    id="stanze-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as StanzeSort)}
                    className="rounded-[10px] border border-sea-100 bg-white px-3.5 py-2 text-xs font-semibold text-ink-muted"
                  >
                    <option value="recommended">{F.sortRecommended}</option>
                    <option value="price_asc">{F.sortPriceAsc}</option>
                    <option value="price_desc">{F.sortPriceDesc}</option>
                    <option value="newest">{F.sortNewest}</option>
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-xl2 border border-sea-100 bg-white px-4 py-12 text-center shadow-card">
                  <p className="font-display text-lg font-bold text-ink">
                    {F.emptyTitle}
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
                    {F.emptyBody}
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sea-700"
                  >
                    {F.emptyCta}
                  </button>
                  <p className="mt-4 text-xs text-ink-muted">
                    <Link href="/lista-attesa" className="font-semibold text-sea-700 underline">
                      {t.nav.waitlist}
                    </Link>
                  </p>
                </div>
              ) : (
                <StanzeListWithCompare
                  listings={filtered}
                  expandedGrid={!collapsed}
                />
              )}
            </div>
          </div>
        )}

        {/* Mobile filter overlay / bottom sheet */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={F.title}
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="max-h-[88dvh] w-full overflow-y-auto rounded-t-2xl bg-bg p-3 shadow-xl sm:p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full px-3 py-1.5 text-sm font-semibold text-sea-700"
                  aria-label={F.closeOverlayAria}
                >
                  {t.listingsCompare.close}
                </button>
              </div>
              <StanzeFiltersPanel
                filters={filters}
                onChange={setFilters}
                onReset={() => {
                  resetFilters();
                }}
                zones={zones}
                resultCount={filtered.length}
                variant="sheet"
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="mt-3 w-full rounded-full bg-sea-600 py-3 text-sm font-semibold text-white"
              >
                {countLabel}
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
