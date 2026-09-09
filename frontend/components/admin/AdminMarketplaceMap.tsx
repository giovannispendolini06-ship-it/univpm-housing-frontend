"use client";

import { useMemo, useState } from "react";
import { coordsForListing } from "@/lib/geo/ancona-zones";
import { useLocale } from "@/lib/i18n/LocaleContext";
import MarketplaceMap, {
  type MarketplaceMapPoint,
} from "@/components/listings/MarketplaceMap";

export type AdminMapProperty = {
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

type CityStat = { city: string; count: number };

export default function AdminMarketplaceMap({
  properties,
}: {
  properties: AdminMapProperty[];
}) {
  const { t } = useLocale();
  const M = t.roleMaps;
  const [cityFilter, setCityFilter] = useState<string>("all");

  const cityStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of properties) {
      const city = (p.city?.trim() || M.unknownCity).replace(/\s+/g, " ");
      map.set(city, (map.get(city) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([city, count]) => ({ city, count }) satisfies CityStat)
      .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
  }, [properties, M.unknownCity]);

  const filtered = useMemo(() => {
    if (cityFilter === "all") return properties;
    return properties.filter(
      (p) => (p.city?.trim() || M.unknownCity) === cityFilter,
    );
  }, [properties, cityFilter, M.unknownCity]);

  const points = useMemo(() => {
    const out: MarketplaceMapPoint[] = [];
    for (const p of filtered) {
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
        href: `/admin/properties/${p.id}`,
        lng: c.lng,
        lat: c.lat,
        approximate: c.approximate,
        accent: p.guaranteedRent ? "coral" : "teal",
        meta: `${p.monthlyRentToOwner}€ · ${p.statusLabel}`,
        badge: p.statusLabel,
      });
    }
    return out;
  }, [filtered]);

  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="font-display text-lg font-bold text-ink">{M.adminTitle}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">{M.adminSubtitle}</p>
      </div>

      {cityStats.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCityFilter("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              cityFilter === "all"
                ? "bg-sea-600 text-white"
                : "bg-white text-ink-muted shadow-sm ring-1 ring-sea-100"
            }`}
          >
            {M.allCities} · {properties.length}
          </button>
          {cityStats.map((s) => (
            <button
              key={s.city}
              type="button"
              onClick={() => setCityFilter(s.city)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                cityFilter === s.city
                  ? "bg-sea-600 text-white"
                  : "bg-white text-ink-muted shadow-sm ring-1 ring-sea-100"
              }`}
            >
              {s.city} · {s.count}
            </button>
          ))}
        </div>
      )}

      <MarketplaceMap
        points={points}
        privacyNote={M.adminPrivacyNote}
        emptyMessage={M.adminEmpty}
        heightClassName="h-[min(55vh,480px)]"
        legend={[
          { color: "coral", label: M.guaranteedBadge },
          { color: "teal", label: M.marketplaceBadge },
        ]}
      />
    </section>
  );
}
