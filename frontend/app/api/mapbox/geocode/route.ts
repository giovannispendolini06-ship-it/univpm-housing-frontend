import { NextResponse } from "next/server";
import {
  fetchNearbyPois,
  suggestAddresses,
} from "@/lib/mapbox-geocoding";

export const runtime = "nodejs";

/**
 * GET ?q=via+roma+bologna — address suggestions
 * GET ?lat=&lng=&city=&audience= — nearby POIs for that pin
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (lat && lng) {
    const city = searchParams.get("city")?.trim() || "Italia";
    const audienceRaw = searchParams.get("audience") ?? "entrambi";
    const audience =
      audienceRaw === "studenti" || audienceRaw === "lavoratori"
        ? audienceRaw
        : "entrambi";
    const pois = await fetchNearbyPois({
      latitude: Number(lat),
      longitude: Number(lng),
      city,
      audience,
    });
    return NextResponse.json({ pois });
  }

  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }
  const suggestions = await suggestAddresses(q);
  return NextResponse.json({ suggestions });
}
