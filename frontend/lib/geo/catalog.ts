import { ITALY_GEO_CATALOG } from "./italy-catalog";
import type { GeoCity, GeoUniversity } from "./types";

export function listCities(): readonly GeoCity[] {
  return ITALY_GEO_CATALOG;
}

export function getCityBySlug(slug: string): GeoCity | undefined {
  return ITALY_GEO_CATALOG.find((c) => c.slug === slug);
}

export function getActiveCity(): GeoCity {
  const active = ITALY_GEO_CATALOG.find((c) => c.status === "active");
  if (!active) {
    throw new Error("Nessuna città operativa nel catalogo geo.");
  }
  return active;
}

export function getUniversity(
  citySlug: string,
  universitySlug: string,
): GeoUniversity | undefined {
  return getCityBySlug(citySlug)?.universities.find(
    (u) => u.slug === universitySlug,
  );
}

/** Testo compatto da iniettare nel system prompt di Vesta. */
export function formatCatalogForPrompt(): string {
  const lines: string[] = [];
  for (const city of ITALY_GEO_CATALOG) {
    const statusLabel =
      city.status === "active" ? "DISPONIBILE ORA" : "PRESTO DISPONIBILE";
    const unis = city.universities
      .map((u) => {
        const poles =
          u.poles.length > 0
            ? u.poles
                .map((p) => {
                  const fac = p.faculties?.length
                    ? ` [${p.faculties.join(", ")}]`
                    : "";
                  return `${p.name} (${p.slug})${fac}`;
                })
                .join("; ")
            : "poli non ancora dettagliati";
        return `${u.name} [${u.slug}]: ${poles}`;
      })
      .join(" | ");
    lines.push(
      `- ${city.name} [${city.slug}] (${city.region}, ${city.countryCode}) — ${statusLabel}: ${unis}`,
    );
  }
  return lines.join("\n");
}

/** Mappa slug polo Ancona/legacy → nome campus in DB attuale. */
export const ANCONA_POLO_TO_CAMPUS_NAME: Record<string, string> = {
  monte_dago: "Monte Dago",
  torrette: "Torrette",
  villarey: "Centro (Economia/Giurisprudenza)",
  centro_economia_giurisprudenza: "Centro (Economia/Giurisprudenza)",
};

export function waitlistCityPath(citySlug: string): string {
  return `/lista-attesa?city=${encodeURIComponent(citySlug)}`;
}
