"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { fitCenterForPoints } from "@/lib/geo/ancona-zones";
import { useLocale } from "@/lib/i18n/LocaleContext";

type MapStyleId = "streets" | "satellite" | "dark";

const STYLE_URLS: Record<MapStyleId, string> = {
  streets: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
};

export type MarketplaceMapPoint = {
  id: string;
  title: string;
  subtitle?: string | null;
  href: string;
  lng: number;
  lat: number;
  approximate?: boolean;
  /** coral = guaranteed / accent; teal = default marketplace */
  accent?: "teal" | "coral";
  meta?: string | null;
  badge?: string | null;
};

export type MarketplaceMapLegendItem = {
  color: "coral" | "teal" | "ink";
  label: string;
};

type Props = {
  points: MarketplaceMapPoint[];
  legend?: MarketplaceMapLegendItem[];
  privacyNote?: string;
  emptyMessage?: string;
  className?: string;
  heightClassName?: string;
};

function pointsToGeoJSON(
  points: MarketplaceMapPoint[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      properties: {
        id: p.id,
        title: p.title,
        guaranteed: p.accent === "coral",
        approximate: Boolean(p.approximate),
      },
      geometry: {
        type: "Point",
        coordinates: [p.lng, p.lat],
      },
    })),
  };
}

/**
 * Shared Mapbox map for student / owner / admin surfaces.
 * Requires NEXT_PUBLIC_MAPBOX_TOKEN.
 */
export default function MarketplaceMap({
  points,
  legend,
  privacyNote,
  emptyMessage,
  className = "",
  heightClassName = "h-[min(70vh,560px)]",
}: Props) {
  const { t } = useLocale();
  const M = t.listingsMap;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [styleId, setStyleId] = useState<MapStyleId>("streets");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const selected = useMemo(
    () => (selectedId ? points.find((p) => p.id === selectedId) ?? null : null),
    [points, selectedId],
  );

  const fit = useMemo(() => fitCenterForPoints(points), [points]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!token || !containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: STYLE_URLS[styleId],
      center: fit.center,
      zoom: fit.zoom,
      attributionControl: true,
      cooperativeGestures: true,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );
    mapRef.current = map;

    function addLayers() {
      if (!map.getSource("listings")) {
        map.addSource("listings", {
          type: "geojson",
          data: pointsToGeoJSON(points),
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 48,
        });
      }

      if (!map.getLayer("clusters")) {
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "listings",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#0F6E6A",
            "circle-radius": ["step", ["get", "point_count"], 18, 4, 22, 8, 28],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "listings",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 12,
            "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          },
          paint: { "text-color": "#ffffff" },
        });
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "listings",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "case",
              ["get", "guaranteed"],
              "#FF6B4A",
              "#0F6E6A",
            ],
            "circle-radius": 9,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource("listings") as mapboxgl.GeoJSONSource;
        if (clusterId == null) return;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          const geometry = features[0].geometry;
          if (geometry.type !== "Point") return;
          map.easeTo({
            center: geometry.coordinates as [number, number],
            zoom,
            duration: reduceMotion ? 0 : 400,
          });
        });
      });

      map.on("click", "unclustered-point", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (id) setSelectedId(id);
      });

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });
    }

    map.on("load", addLayers);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Recreate when style changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, styleId, reduceMotion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("listings") as mapboxgl.GeoJSONSource | undefined;
    if (source) source.setData(pointsToGeoJSON(points));
    if (points.length > 0) {
      map.easeTo({
        center: fit.center,
        zoom: fit.zoom,
        duration: reduceMotion ? 0 : 450,
      });
    }
  }, [points, fit, reduceMotion]);

  if (!token) {
    return (
      <div
        className={`flex min-h-[320px] flex-col items-center justify-center rounded-xl2 border border-dashed border-sea-200 bg-sea-50/50 px-6 py-12 text-center ${className}`}
      >
        <p className="font-display text-lg font-bold text-ink">
          {M.tokenMissingTitle}
        </p>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          {M.tokenMissingBody}
        </p>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div
        className={`flex min-h-[240px] flex-col items-center justify-center rounded-xl2 border border-dashed border-sea-200 bg-sea-50/40 px-6 py-10 text-center ${className}`}
      >
        <p className="text-sm text-ink-muted">
          {emptyMessage ?? M.emptyPoints}
        </p>
      </div>
    );
  }

  const legendItems =
    legend ??
    ([
      { color: "coral" as const, label: M.legendGuaranteed },
      { color: "teal" as const, label: M.legendMarketplace },
    ] satisfies MarketplaceMapLegendItem[]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl2 border border-sea-100 bg-white shadow-card ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sea-100 bg-white px-3 py-2">
        <p className="text-[11px] text-ink-muted">
          {privacyNote ?? M.privacyNote}
        </p>
        <div
          className="flex rounded-full border border-sea-100 bg-bg p-0.5"
          role="group"
          aria-label={M.styleLabel}
        >
          {(
            [
              ["streets", M.styleStreets],
              ["satellite", M.styleSatellite],
              ["dark", M.styleDark],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStyleId(id)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                styleId === id
                  ? "bg-sea-600 text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className={`${heightClassName} w-full`} />

      <div className="flex flex-wrap gap-3 border-t border-sea-100 px-3 py-2 text-[11px] text-ink-muted">
        {legendItems.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                item.color === "coral"
                  ? "bg-sunset-500"
                  : item.color === "ink"
                    ? "bg-ink"
                    : "bg-sea-600"
              }`}
            />
            {item.label}
          </span>
        ))}
      </div>

      {selected && (
        <div className="absolute bottom-14 left-3 right-3 z-10 rounded-xl2 border border-sea-100 bg-white/95 p-3 shadow-card backdrop-blur sm:left-auto sm:right-3 sm:w-72">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="absolute right-2 top-2 text-xs font-semibold text-ink-muted"
            aria-label={M.closePreview}
          >
            ✕
          </button>
          <p className="pr-6 font-display text-sm font-bold text-ink">
            {selected.title}
          </p>
          {(selected.subtitle || selected.meta) && (
            <p className="mt-0.5 text-xs text-ink-muted">
              {[selected.subtitle, selected.meta].filter(Boolean).join(" · ")}
            </p>
          )}
          {selected.badge && (
            <span className="mt-1 inline-flex rounded-full bg-sea-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              {selected.badge}
            </span>
          )}
          <Link
            href={selected.href}
            className="mt-2 inline-flex text-xs font-semibold text-sea-700 underline"
          >
            {M.openDetails}
          </Link>
        </div>
      )}
    </div>
  );
}
