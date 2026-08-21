/**
 * Stima indicativa del canone garantito Coabito (pagina /proprietari).
 * Fonte prezzi €/mq: valori di partenza del modello finanziario Coabito
 * (Torrette 11, Centro 13, Palombina 10) — non dati OMI ufficiali aggiornati.
 * Sconto canone garantito fisso al 9% (×0.91).
 */

export type EstimateZone = "torrette" | "centro" | "palombina";
export type EstimateCondition = "buono" | "rinfrescare" | "ristrutturato";

export const ZONE_PRICE_PER_MQ: Record<EstimateZone, number> = {
  torrette: 11,
  centro: 13,
  palombina: 10,
};

export const CONDITION_MULTIPLIER: Record<EstimateCondition, number> = {
  buono: 1.0,
  rinfrescare: 0.9,
  ristrutturato: 1.1,
};

/** Sconto fisso del modello finanziario — non modificare senza conferma. */
export const GUARANTEED_RENT_FACTOR = 0.91;

/** Range indicativo ±7% intorno al valore centrale. */
export const ESTIMATE_RANGE_FACTOR = 0.07;

export const MQ_MIN = 50;
export const MQ_MAX = 130;
export const MQ_DEFAULT = 85;

export type GuaranteedRentEstimateInput = {
  zone: EstimateZone;
  rooms: 2 | 3 | 4;
  sizeSqm: number;
  condition: EstimateCondition;
};

export type GuaranteedRentEstimate = {
  marketRent: number;
  guaranteed: number;
  low: number;
  high: number;
  pricePerMq: number;
  multiplier: number;
};

function roundToTen(n: number): number {
  return Math.round(n / 10) * 10;
}

export function estimateGuaranteedRent(
  input: GuaranteedRentEstimateInput,
): GuaranteedRentEstimate {
  const pricePerMq = ZONE_PRICE_PER_MQ[input.zone];
  const multiplier = CONDITION_MULTIPLIER[input.condition];
  const mq = Math.min(MQ_MAX, Math.max(MQ_MIN, input.sizeSqm));

  const marketRent = pricePerMq * mq * multiplier;
  const guaranteed = roundToTen(marketRent * GUARANTEED_RENT_FACTOR);
  const low = roundToTen(guaranteed * (1 - ESTIMATE_RANGE_FACTOR));
  const high = roundToTen(guaranteed * (1 + ESTIMATE_RANGE_FACTOR));

  return { marketRent, guaranteed, low, high, pricePerMq, multiplier };
}
