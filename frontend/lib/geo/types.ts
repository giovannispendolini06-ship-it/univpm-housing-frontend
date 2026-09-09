/** Tipi per il catalogo geo Coabito (paese → città → università → poli). */

export type CountryCode = "IT";

export type CityOperationalStatus = "active" | "coming_soon";

export type GeoPole = {
  /** Slug stabile (es. monte_dago) */
  slug: string;
  /** Nome mostrato in chat */
  name: string;
  /** Facoltà / aree tipiche (opzionale, per il prompt) */
  faculties?: readonly string[];
};

export type GeoUniversity = {
  slug: string;
  name: string;
  poles: readonly GeoPole[];
};

export type GeoCity = {
  slug: string;
  name: string;
  region: string;
  countryCode: CountryCode;
  status: CityOperationalStatus;
  universities: readonly GeoUniversity[];
};
