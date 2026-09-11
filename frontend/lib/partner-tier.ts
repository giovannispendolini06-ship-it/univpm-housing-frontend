import type { createServiceSupabaseClient } from "@/lib/supabase/server";
import { sendEmail, buildPartnerUpgradeEmail } from "@/lib/email";

export type PartnerTier = "standard" | "partner" | "fondatrice";

export const PARTNER_CLOSED_LEASES_THRESHOLD = 3;
export const PARTNER_LOOKBACK_MONTHS = 12;

/** Fixed visibility boost for Partner / Fondatrice in recommended sort. */
export const PARTNER_VISIBILITY_BOOST = 3;

type Db = ReturnType<typeof createServiceSupabaseClient>;

export function partnerBadgeLabel(tier: PartnerTier | null | undefined): string | null {
  if (tier === "fondatrice") return "Agenzia Fondatrice";
  if (tier === "partner") return "Partner Coabito";
  return null;
}

export function isPartnerOrAbove(tier: PartnerTier | null | undefined): boolean {
  return tier === "partner" || tier === "fondatrice";
}

export async function countClosedLeasesLast12Months(
  db: Db,
  ownerId: string,
): Promise<number> {
  const since = new Date();
  since.setMonth(since.getMonth() - PARTNER_LOOKBACK_MONTHS);
  const { count, error } = await db
    .from("closed_leases")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .gte("closed_at", since.toISOString());

  if (error) {
    console.error("[partner-tier] closed_leases count", error.message);
    return 0;
  }
  return count ?? 0;
}

export type PartnerTierSnapshot = {
  tier: PartnerTier;
  foundingRate: boolean;
  closedLeasesLast12Months: number;
  leasesNeededForPartner: number;
  upgradedToPartner: boolean;
};

/**
 * On owner dashboard open: Standard + ≥3 closed_leases / 12 mo → Partner.
 * Fondatrice is never auto-changed (never demoted).
 */
export async function syncOwnerPartnerTier(
  db: Db,
  ownerId: string,
): Promise<PartnerTierSnapshot> {
  const { data: row } = await db
    .from("users")
    .select("partner_tier, founding_rate, email, full_name")
    .eq("id", ownerId)
    .maybeSingle();

  const current = (row?.partner_tier as PartnerTier | null) ?? "standard";
  const foundingRate = row?.founding_rate === true;
  const closed = await countClosedLeasesLast12Months(db, ownerId);
  const needed = Math.max(0, PARTNER_CLOSED_LEASES_THRESHOLD - closed);

  if (current === "fondatrice") {
    return {
      tier: "fondatrice",
      foundingRate: true,
      closedLeasesLast12Months: closed,
      leasesNeededForPartner: 0,
      upgradedToPartner: false,
    };
  }

  if (current === "standard" && closed >= PARTNER_CLOSED_LEASES_THRESHOLD) {
    const now = new Date().toISOString();
    const { error } = await db
      .from("users")
      .update({
        partner_tier: "partner",
        tier_updated_at: now,
      })
      .eq("id", ownerId)
      .eq("partner_tier", "standard");

    if (error) {
      console.error("[partner-tier] upgrade failed", error.message);
      return {
        tier: "standard",
        foundingRate,
        closedLeasesLast12Months: closed,
        leasesNeededForPartner: needed,
        upgradedToPartner: false,
      };
    }

    if (row?.email) {
      try {
        await sendEmail({
          to: row.email,
          ...buildPartnerUpgradeEmail({
            fullName: (row as { full_name?: string | null }).full_name ?? "",
          }),
        });
      } catch (err) {
        console.error("[partner-tier] upgrade email", err);
      }
    }

    return {
      tier: "partner",
      foundingRate,
      closedLeasesLast12Months: closed,
      leasesNeededForPartner: 0,
      upgradedToPartner: true,
    };
  }

  return {
    tier: current,
    foundingRate,
    closedLeasesLast12Months: closed,
    leasesNeededForPartner: current === "standard" ? needed : 0,
    upgradedToPartner: false,
  };
}

export type MarketReportStats = {
  zone: string;
  avgMonthlyRent: number | null;
  listingCount: number;
  avgOccupancyDays: number | null;
  closedLeasesCount: number;
};

/** Zone aggregates from published rooms + closed_leases (simple queries only). */
export async function fetchOwnerMarketReport(
  db: Db,
  ownerId: string,
): Promise<MarketReportStats[]> {
  const { data: props } = await db
    .from("properties")
    .select("id, zone, city")
    .eq("owner_id", ownerId);

  const zones = Array.from(
    new Set(
      (props ?? [])
        .map((p) => (p.zone?.trim() || p.city?.trim() || "").trim())
        .filter(Boolean),
    ),
  );
  if (zones.length === 0) return [];

  const reports: MarketReportStats[] = [];

  for (const zone of zones.slice(0, 6)) {
    const { data: zoneProps } = await db
      .from("properties")
      .select("id, zone, city")
      .or(`zone.ilike.%${zone}%,city.ilike.%${zone}%`)
      .limit(200);

    const propertyIds = (zoneProps ?? []).map((p) => p.id as string);
    if (propertyIds.length === 0) {
      reports.push({
        zone,
        avgMonthlyRent: null,
        listingCount: 0,
        avgOccupancyDays: null,
        closedLeasesCount: 0,
      });
      continue;
    }

    const { data: rooms } = await db
      .from("rooms")
      .select("id, price_monthly, property_id")
      .in("property_id", propertyIds)
      .limit(500);

    const prices = (rooms ?? [])
      .map((r) => Number((r as { price_monthly?: number }).price_monthly))
      .filter((n) => Number.isFinite(n) && n > 0);
    const avgMonthlyRent =
      prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : null;

    const roomIds = (rooms ?? []).map((r) => r.id as string);
    let closedLeasesCount = 0;
    let avgOccupancyDays: number | null = null;

    if (roomIds.length > 0) {
      const since = new Date();
      since.setMonth(since.getMonth() - 12);
      const { data: leases } = await db
        .from("closed_leases")
        .select("room_id, closed_at")
        .in("room_id", roomIds)
        .gte("closed_at", since.toISOString())
        .limit(500);

      closedLeasesCount = leases?.length ?? 0;

      if (leases && leases.length > 0) {
        const { data: tenancies } = await db
          .from("room_tenancies")
          .select("room_id, started_at, ended_at")
          .in(
            "room_id",
            leases.map((l) => l.room_id),
          )
          .limit(500);

        const durations: number[] = [];
        for (const t of tenancies ?? []) {
          if (!t.started_at) continue;
          const start = Date.parse(String(t.started_at));
          const end = t.ended_at
            ? Date.parse(String(t.ended_at))
            : Date.now();
          if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
            continue;
          }
          durations.push((end - start) / (1000 * 60 * 60 * 24));
        }
        if (durations.length > 0) {
          avgOccupancyDays = Math.round(
            durations.reduce((a, b) => a + b, 0) / durations.length,
          );
        }
      }
    }

    reports.push({
      zone,
      avgMonthlyRent,
      listingCount: rooms?.length ?? 0,
      avgOccupancyDays,
      closedLeasesCount,
    });
  }

  return reports;
}
