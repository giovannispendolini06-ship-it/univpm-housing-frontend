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
    propertyType: "stanza_singola",
    contractDurationType: "breve_periodo",
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

assert(
  matchesFilters(listing, {
    ...DEFAULT_FILTERS,
    propertyType: "stanza_singola",
  }),
  "propertyType stanza_singola matches",
);
assert(
  !matchesFilters(listing, {
    ...DEFAULT_FILTERS,
    propertyType: "appartamento_intero",
  }),
  "propertyType appartamento_intero excludes room",
);

const whole = base({
  id: "whole",
  propertyType: "monolocale",
  contractType: "monolocale",
  flatmatesCount: 0,
  roomType: null,
  contractDurationType: "annuale",
});
assert(
  matchesFilters(whole, {
    ...DEFAULT_FILTERS,
    propertyType: "monolocale",
  }),
  "propertyType monolocale matches",
);
assert(
  !matchesFilters(whole, { ...DEFAULT_FILTERS, coinq: "1" }),
  "whole unit with 0 flatmates excluded by coinq=1",
);

// Duration: student anno_accademico excludes breve_periodo unless flessibile
assert(
  !matchesFilters(listing, {
    ...DEFAULT_FILTERS,
    durata: "anno_accademico",
  }),
  "anno_accademico filter excludes breve_periodo listing",
);
assert(
  matchesFilters(
    base({ contractDurationType: "anno_accademico", minContractMonths: 10 }),
    { ...DEFAULT_FILTERS, durata: "anno_accademico" },
  ),
  "anno_accademico listing matches anno_accademico filter",
);
assert(
  matchesFilters(
    base({ contractDurationType: "flessibile", minContractMonths: null }),
    { ...DEFAULT_FILTERS, durata: "anno_accademico" },
  ),
  "flessibile listing matches any duration filter (anno_accademico)",
);
assert(
  matchesFilters(
    base({ contractDurationType: "flessibile", minContractMonths: null }),
    { ...DEFAULT_FILTERS, durata: "breve_periodo" },
  ),
  "flessibile listing matches breve_periodo filter",
);
assert(
  matchesFilters(listing, {
    ...DEFAULT_FILTERS,
    durata: "breve_periodo",
  }),
  "breve_periodo listing matches breve_periodo filter",
);
assert(
  !matchesFilters(
    base({ contractDurationType: null }),
    { ...DEFAULT_FILTERS, durata: "annuale" },
  ),
  "null duration excluded when duration filter active",
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
