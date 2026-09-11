/** Client-safe partner program helpers (no server / email imports). */

export type PartnerTier = "standard" | "partner" | "fondatrice";

export const PARTNER_CLOSED_LEASES_THRESHOLD = 3;
export const PARTNER_LOOKBACK_MONTHS = 12;

/** Fixed visibility boost for Partner / Fondatrice in recommended sort. */
export const PARTNER_VISIBILITY_BOOST = 3;

export function partnerBadgeLabel(tier: PartnerTier | null | undefined): string | null {
  if (tier === "fondatrice") return "Agenzia Fondatrice";
  if (tier === "partner") return "Partner Coabito";
  return null;
}

export function isPartnerOrAbove(tier: PartnerTier | null | undefined): boolean {
  return tier === "partner" || tier === "fondatrice";
}

export type PartnerTierSnapshot = {
  tier: PartnerTier;
  foundingRate: boolean;
  closedLeasesLast12Months: number;
  leasesNeededForPartner: number;
  upgradedToPartner: boolean;
};

export type MarketReportStats = {
  zone: string;
  avgMonthlyRent: number | null;
  listingCount: number;
  avgOccupancyDays: number | null;
  closedLeasesCount: number;
};
