"use client";

import { useMemo } from "react";
import type { Listing } from "@/lib/domain/types";
import { coordsForListing } from "@/lib/geo/ancona-zones";
import { useLocale } from "@/lib/i18n/LocaleContext";
import MarketplaceMap, {
  type MarketplaceMapPoint,
} from "@/components/listings/MarketplaceMap";

/**
 * Student marketplace map on /stanze — available rooms as interactive pins.
 */
export default function ListingsMap({ listings }: { listings: Listing[] }) {
  const { t } = useLocale();
  const M = t.listingsMap;

  const points = useMemo(() => {
    const out: MarketplaceMapPoint[] = [];
    for (const l of listings) {
      const c = coordsForListing({
        latitude: l.latitude,
        longitude: l.longitude,
        neighbourhood: l.neighbourhood,
        cityLabel: l.cityLabel,
      });
      if (!c) continue;
      out.push({
        id: l.id,
        title: l.title,
        subtitle: l.neighbourhood ?? l.cityLabel,
        href: `/stanza/${l.id}`,
        lng: c.lng,
        lat: c.lat,
        approximate: c.approximate,
        accent: l.guaranteedRent ? "coral" : "teal",
        meta: `${l.monthlyRent}€`,
        badge: l.guaranteedRent ? t.listingsCard.guaranteedRent : null,
      });
    }
    return out;
  }, [listings, t.listingsCard.guaranteedRent]);

  return (
    <MarketplaceMap
      points={points}
      privacyNote={M.privacyNote}
      emptyMessage={M.emptyPoints}
    />
  );
}
