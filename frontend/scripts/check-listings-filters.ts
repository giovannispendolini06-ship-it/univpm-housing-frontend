/**
 * Lightweight sanity checks for /stanze filter matching (no Jest required).
 * Run: npx tsx scripts/check-listings-filters.ts
 */
import type { Listing } from "../lib/domain/types";
import {
  DEFAULT_FILTERS,
  filterAndSortListings,
  matchesFilters,
} from "../lib/listings-filters";

function base(partial: Partial<Listing>): Listing {
  return {
    id: "1",
    propertyId: "p1",
    title: "Singola Torrette",
    cityLabel: "Ancona",
    neighbourhood: "Torrette",
    monthlyRent: 380,
    utilitiesEstimate: 30,
    deposit: null,
    contractType: "stanza_singola",
    availableFrom: "2026-09-01",
    roomTypeLabel: "Singola",
    furnished: true,
    privateBathroom: true,
    amenities: ["Wifi", "Lavatrice"],
    photoUrls: [],
    hasRealPhoto: false,
    landlordVerified: true,
    guaranteedRent: true,
    propertyStatus: "attivo",
    sizeSqm: 14,
    hasBalcony: false,
    hasElevator: false,
    flatmatesCount: 2,
    roomType: "singola",
    heatingType: "autonomo",
    minContractMonths: 6,
    petsAllowed: false,
    smokingAllowed: false,
    createdAt: "2026-01-01T00:00:00Z",
    ...partial,
  };
}

let failed = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("ok:", msg);
  }
}

const listing = base({});

assert(
  matchesFilters(listing, DEFAULT_FILTERS),
  "default filters match",
);
assert(
  !matchesFilters(listing, { ...DEFAULT_FILTERS, maxPrice: 300 }),
  "budget excludes expensive",
);
assert(
  matchesFilters(listing, { ...DEFAULT_FILTERS, zona: "torrette" }),
  "zona torrette",
);
assert(
  !matchesFilters(listing, { ...DEFAULT_FILTERS, zona: "centro" }),
  "zona centro excludes",
);
assert(
  matchesFilters(listing, { ...DEFAULT_FILTERS, mq: "m" }),
  "mq band m (12-18)",
);
assert(
  matchesFilters(listing, {
    ...DEFAULT_FILTERS,
    features: ["bagno", "wifi", "garantito"],
  }),
  "feature checkboxes",
);
assert(
  !matchesFilters(listing, {
    ...DEFAULT_FILTERS,
    features: ["animali"],
  }),
  "pets filter excludes when false",
);

const sorted = filterAndSortListings(
  [base({ id: "a", monthlyRent: 400 }), base({ id: "b", monthlyRent: 300 })],
  DEFAULT_FILTERS,
  "price_asc",
);
assert(sorted[0].id === "b", "sort price_asc");

if (failed > 0) {
  console.error(`\n${failed} failed`);
  process.exit(1);
}
console.log("\nAll filter checks passed.");
