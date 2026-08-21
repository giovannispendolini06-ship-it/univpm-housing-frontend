/**
 * Smoke checks for the geo catalog used by Vesta multi-city.
 * Run: npx tsx scripts/check-geo-catalog.ts
 */
import {
  getActiveCity,
  getCityBySlug,
  listCities,
} from "../lib/geo/catalog";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const cities = listCities();
assert(cities.length >= 40, `expected many cities, got ${cities.length}`);

const ancona = getActiveCity();
assert(ancona.slug === "ancona", "active city must be Ancona");
assert(ancona.countryCode === "IT", "Ancona country IT");
assert(ancona.universities.some((u) => u.slug === "univpm"), "UNIVPM present");
assert(
  ancona.universities[0]!.poles.some((p) => p.slug === "monte_dago"),
  "Monte Dago pole",
);

const milano = getCityBySlug("milano");
assert(milano?.status === "coming_soon", "Milano coming_soon");
assert((milano?.universities.length ?? 0) >= 4, "Milano unis");

const comingSoon = cities.filter((c) => c.status === "coming_soon");
assert(comingSoon.length === cities.length - 1, "only Ancona active");

const countries = new Set(cities.map((c) => c.countryCode));
assert(countries.size === 1 && countries.has("IT"), "only IT for now");

console.log(`ok: ${cities.length} cities, active=${ancona.name}`);
console.log("All geo catalog checks passed.");
