/**
 * Listing typology + contract duration helpers shared by owner publish,
 * /stanze filters, and Vesta matching.
 */

import type {
  ContractDurationType,
  PropertyType,
  RoomType,
} from "@/lib/domain/types";

export type { ContractDurationType, PropertyType };

export const PROPERTY_TYPES: PropertyType[] = [
  "stanza_singola",
  "stanza_doppia",
  "appartamento_intero",
  "monolocale",
];

export const CONTRACT_DURATION_TYPES: ContractDurationType[] = [
  "anno_accademico",
  "annuale",
  "breve_periodo",
  "flessibile",
];

export function isPropertyType(
  value: string | null | undefined,
): value is PropertyType {
  return (
    value === "stanza_singola" ||
    value === "stanza_doppia" ||
    value === "appartamento_intero" ||
    value === "monolocale"
  );
}

export function isContractDurationType(
  value: string | null | undefined,
): value is ContractDurationType {
  return (
    value === "anno_accademico" ||
    value === "annuale" ||
    value === "breve_periodo" ||
    value === "flessibile"
  );
}

/** Whole-unit listings: roommate fields / cohabitation scores do not apply. */
export function isWholeUnitProperty(
  propertyType: PropertyType | string | null | undefined,
): boolean {
  return (
    propertyType === "appartamento_intero" || propertyType === "monolocale"
  );
}

/** Map property_type → legacy properties.contract_type for older UI. */
export function legacyContractType(propertyType: PropertyType): string {
  switch (propertyType) {
    case "stanza_doppia":
      return "stanza_doppia";
    case "appartamento_intero":
    case "monolocale":
      return "intero_appartamento";
    case "stanza_singola":
    default:
      return "stanza_singola";
  }
}

/** Infer rooms.room_type from property_type. */
export function roomTypeFromPropertyType(
  propertyType: PropertyType,
): RoomType | null {
  switch (propertyType) {
    case "stanza_doppia":
      return "doppia";
    case "stanza_singola":
      return "singola";
    case "appartamento_intero":
    case "monolocale":
      return null;
    default:
      return null;
  }
}

/** Default min months hint from duration type (null for flessibile). */
export function minMonthsFromDuration(
  duration: ContractDurationType,
): number | null {
  switch (duration) {
    case "breve_periodo":
      return 3;
    case "anno_accademico":
      return 10;
    case "annuale":
      return 12;
    case "flessibile":
      return null;
    default:
      return null;
  }
}

/**
 * Duration search filter:
 * - flessibile listings match any selected duration
 * - otherwise exact match
 * - null/unknown excluded when a duration filter is active
 */
export function matchesContractDurationFilter(
  listingDuration: ContractDurationType | string | null | undefined,
  filter: string,
): boolean {
  if (filter === "all") return true;
  if (!listingDuration) return false;
  if (listingDuration === "flessibile") return true;
  return listingDuration === filter;
}

export function inferPropertyType(
  explicit: string | null | undefined,
  contractType: string | null | undefined,
): PropertyType | null {
  if (isPropertyType(explicit)) return explicit;
  if (contractType === "stanza_doppia") return "stanza_doppia";
  if (
    contractType === "intero_appartamento" ||
    contractType === "appartamento_intero"
  ) {
    return "appartamento_intero";
  }
  if (contractType === "monolocale") return "monolocale";
  if (contractType === "stanza_singola") return "stanza_singola";
  return null;
}

export function inferContractDurationType(
  explicit: string | null | undefined,
  contractType: string | null | undefined,
  minMonths: number | null | undefined,
): ContractDurationType | null {
  if (isContractDurationType(explicit)) return explicit;
  if (contractType === "transitorio") return "breve_periodo";
  if (typeof minMonths === "number") {
    if (minMonths <= 6) return "breve_periodo";
    if (minMonths >= 11) return "annuale";
    if (minMonths >= 7) return "anno_accademico";
  }
  return null;
}
