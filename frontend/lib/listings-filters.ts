import type { Listing } from "@/lib/domain/types";
import {
  availabilityBand,
  listingHasFeature,
  sizeBand,
} from "@/lib/data/listings";

export type StanzeSort =
  | "recommended"
  | "price_asc"
  | "price_desc"
  | "newest";

export type StanzeFilterState = {
  maxPrice: number;
  zona: string; // "all" | zone slug/label
  tipo: string; // all | singola | doppia | dus
  mq: string; // all | s | m | l
  data: string; // all | subito | settembre
  durata: string; // all | 6 | 12
  coinq: string; // all | 1 | 2 | 3
  risc: string; // all | autonomo | centralizzato
  features: string[]; // bagno, arredata, …
};

export const DEFAULT_MAX_PRICE = 600;
export const MIN_PRICE_SLIDER = 150;
export const MAX_PRICE_SLIDER = 600;

export const DEFAULT_FILTERS: StanzeFilterState = {
  maxPrice: DEFAULT_MAX_PRICE,
  zona: "all",
  tipo: "all",
  mq: "all",
  data: "all",
  durata: "all",
  coinq: "all",
  risc: "all",
  features: [],
};

/** Canonical Ancona zones shown as chips; extra zones from data are appended. */
export const CANONICAL_ZONES = [
  { value: "torrette", match: /torrette/i },
  { value: "centro", match: /centro|villarey|piazza\s*roma|cavour/i },
  { value: "palombina", match: /palombina/i },
  { value: "tavernelle", match: /tavernelle|monte\s*dago|posatora/i },
] as const;

export function zoneSlug(neighbourhood: string | null | undefined): string | null {
  if (!neighbourhood?.trim()) return null;
  for (const z of CANONICAL_ZONES) {
    if (z.match.test(neighbourhood)) return z.value;
  }
  return neighbourhood.trim().toLowerCase().replace(/\s+/g, "-");
}

export function collectZones(listings: Listing[]): string[] {
  const fromData = new Set<string>();
  for (const l of listings) {
    const slug = zoneSlug(l.neighbourhood);
    if (slug) fromData.add(slug);
  }
  const ordered: string[] = [];
  for (const z of CANONICAL_ZONES) {
    if (fromData.has(z.value)) {
      ordered.push(z.value);
      fromData.delete(z.value);
    }
  }
  // Keep canonical order even if no listings yet (UX parity with reference)
  if (ordered.length === 0) {
    return CANONICAL_ZONES.map((z) => z.value);
  }
  return [...ordered, ...Array.from(fromData).sort()];
}

export function matchesFilters(
  listing: Listing,
  filters: StanzeFilterState,
): boolean {
  if (listing.monthlyRent > filters.maxPrice) return false;

  if (filters.zona !== "all") {
    const slug = zoneSlug(listing.neighbourhood);
    if (slug !== filters.zona) return false;
  }

  if (filters.tipo !== "all") {
    if (listing.roomType !== filters.tipo) return false;
  }

  if (filters.mq !== "all") {
    if (sizeBand(listing.sizeSqm) !== filters.mq) return false;
  }

  if (filters.data !== "all") {
    if (availabilityBand(listing.availableFrom) !== filters.data) return false;
  }

  if (filters.durata !== "all") {
    const months = listing.minContractMonths;
    if (months == null || String(months) !== filters.durata) return false;
  }

  if (filters.coinq !== "all") {
    const n = listing.flatmatesCount;
    if (n == null) return false;
    if (filters.coinq === "3") {
      if (n < 3) return false;
    } else if (String(n) !== filters.coinq) {
      return false;
    }
  }

  if (filters.risc !== "all") {
    if (listing.heatingType !== filters.risc) return false;
  }

  for (const f of filters.features) {
    if (!listingHasFeature(listing, f)) return false;
  }

  return true;
}

export function sortListings(
  listings: Listing[],
  sort: StanzeSort,
): Listing[] {
  const copy = [...listings];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => a.monthlyRent - b.monthlyRent);
    case "price_desc":
      return copy.sort((a, b) => b.monthlyRent - a.monthlyRent);
    case "newest":
      return copy.sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
        return tb - ta;
      });
    case "recommended":
    default:
      return copy.sort((a, b) => {
        const sa = a.matchScore ?? -1;
        const sb = b.matchScore ?? -1;
        if (sa !== sb) return sb - sa;
        // Prefer guaranteed + verified when no match scores
        const trust = (l: Listing) =>
          (l.guaranteedRent ? 2 : 0) + (l.landlordVerified ? 1 : 0);
        const td = trust(b) - trust(a);
        if (td !== 0) return td;
        return a.monthlyRent - b.monthlyRent;
      });
  }
}

export function filterAndSortListings(
  listings: Listing[],
  filters: StanzeFilterState,
  sort: StanzeSort,
): Listing[] {
  return sortListings(
    listings.filter((l) => matchesFilters(l, filters)),
    sort,
  );
}
