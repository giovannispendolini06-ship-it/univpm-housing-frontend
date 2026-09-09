"use client";

import { useMemo } from "react";
import { coordsForListing } from "@/lib/geo/ancona-zones";
import { useLocale } from "@/lib/i18n/LocaleContext";
import MarketplaceMap, {
  type MarketplaceMapPoint,
} from "@/components/listings/MarketplaceMap";

export type OwnerMapProperty = {
  id: string;
  address: string;
  zone: string | null;
  city: string | null;
  status: string;
  statusLabel: string;
  monthlyRentToOwner: number;
  guaranteedRent: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export default function OwnerPropertiesMap({
  properties,
}: {
  properties: OwnerMapProperty[];
}) {
  const { t } = useLocale();
  const M = t.roleMaps;

  const points = useMemo(() => {
    const out: MarketplaceMapPoint[] = [];
    for (const p of properties) {
      const c = coordsForListing({
        latitude: p.latitude,
        longitude: p.longitude,
        neighbourhood: p.zone,
        cityLabel: p.city,
      });
      if (!c) continue;
      out.push({
        id: p.id,
        title: p.address,
        subtitle: [p.zone, p.city].filter(Boolean).join(" · ") || null,
        href: `/owner/properties/${p.id}`,
        lng: c.lng,
        lat: c.lat,
        approximate: c.approximate,
        accent: p.guaranteedRent ? "coral" : "teal",
        meta: `${p.monthlyRentToOwner}€ · ${p.statusLabel}`,
        badge: p.guaranteedRent ? M.guaranteedBadge : M.marketplaceBadge,
      });
    }
    return out;
  }, [properties, M.guaranteedBadge, M.marketplaceBadge]);

  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="font-display text-lg font-bold text-ink">{M.ownerTitle}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">{M.ownerSubtitle}</p>
      </div>
      <MarketplaceMap
        points={points}
        privacyNote={M.ownerPrivacyNote}
        emptyMessage={M.ownerEmpty}
        heightClassName="h-[min(50vh,420px)]"
        legend={[
          { color: "coral", label: M.guaranteedBadge },
          { color: "teal", label: M.marketplaceBadge },
        ]}
      />
    </section>
  );
}
