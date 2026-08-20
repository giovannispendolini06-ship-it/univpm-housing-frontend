"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Listing } from "@/lib/domain/types";
import { ANCONA_CENTER, coordsForListing } from "@/lib/geo/ancona-zones";
import { useLocale } from "@/lib/i18n/LocaleContext";

type MapStyleId = "streets" | "satellite" | "dark";

const STYLE_URLS: Record<MapStyleId, string> = {
  streets: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  // Branded dark: Mapbox dark + we tint overlays with Coabito teal clusters
  dark: "mapbox://styles/mapbox/dark-v11",
};

type MapPoint = {
  id: string;
  title: string;
  rent: number;
  guaranteed: boolean;
  lng: number;
  lat: number;
  approximate: boolean;
};

function toPoints(listings: Listing[]): MapPoint[] {
  const out: MapPoint[] = [];
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
      rent: l.monthlyRent,
      guaranteed: l.guaranteedRent,
      lng: c.lng,
      lat: c.lat,
      approximate: c.approximate,
    });
  }
  return out;
}

function pointsToGeoJSON(points: MapPoint[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      properties: {
        id: p.id,
        title: p.title,
        rent: p.rent,
        guaranteed: p.guaranteed,
        approximate: p.approximate,
      },
      geometry: {
        type: "Point",
        coordinates: [p.lng, p.lat],
      },
    })),
  };
}

/**
 * Interactive Mapbox marketplace map: style switcher, clustering, teal/coral pins.
 * Requires NEXT_PUBLIC_MAPBOX_TOKEN. Pins are zone-level unless lat/lng exist.
 */
export default function ListingsMap({ listings }: { listings: Listing[] }) {
  const { t } = useLocale();
  const M = t.listingsMap;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [styleId, setStyleId] = useState<MapStyleId>("streets");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const points = useMemo(() => toPoints(listings), [listings]);
  const selected = selectedId
    ? listings.find((l) => l.id === selectedId) ?? null
    : null;

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
      center: ANCONA_CENTER,
      zoom: 12,
      attributionControl: true,
      cooperativeGestures: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
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
    // Recreate map when style changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, styleId, reduceMotion]);

  // Update geojson when listings change (same map instance)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("listings") as mapboxgl.GeoJSONSource | undefined;
    if (source) source.setData(pointsToGeoJSON(points));
  }, [points]);

  if (!token) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl2 border border-dashed border-sea-200 bg-sea-50/50 px-6 py-12 text-center">
        <p className="font-display text-lg font-bold text-ink">{M.tokenMissingTitle}</p>
        <p className="mt-2 max-w-md text-sm text-ink-muted">{M.tokenMissingBody}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl2 border border-sea-100 bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sea-100 bg-white px-3 py-2">
        <p className="text-[11px] text-ink-muted">{M.privacyNote}</p>
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

      <div ref={containerRef} className="h-[min(70vh,560px)] w-full" />

      <div className="flex flex-wrap gap-3 border-t border-sea-100 px-3 py-2 text-[11px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sunset-500" />
          {M.legendGuaranteed}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sea-600" />
          {M.legendMarketplace}
        </span>
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
          <p className="pr-6 font-display text-sm font-bold text-ink">{selected.title}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {selected.neighbourhood ?? "—"} · {selected.monthlyRent}€
          </p>
          {selected.guaranteedRent && (
            <span className="mt-1 inline-flex rounded-full bg-sea-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              {t.listingsCard.guaranteedRent}
            </span>
          )}
          <Link
            href={`/stanza/${selected.id}`}
            className="mt-2 inline-flex text-xs font-semibold text-sea-700 underline"
          >
            {t.listingsCard.seeDetails}
          </Link>
        </div>
      )}
    </div>
  );
}
