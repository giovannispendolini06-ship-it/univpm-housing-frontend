import { ImageResponse } from "next/og";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "Stanza su Coabito";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SEA_600 = "#0F6E6A";
const SEA_100 = "#CFE6E4";
const SUNSET = "#FF6B4A";
const INK = "#0F2A2E";

type Params = Promise<{ id: string }>;

/**
 * Share preview for WhatsApp / social — zone + price only (never exact address).
 */
export default async function StanzaOpengraphImage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  let title = "Stanza su Coabito";
  let zoneLine = "Ancona";
  let priceLine = "";
  let guaranteed = false;

  try {
    const db = createServiceSupabaseClient();
    const { data: room } = await db
      .from("rooms")
      .select(
        "room_label, price_monthly, properties:property_id ( zone, city, guaranteed_rent, status )",
      )
      .eq("id", id)
      .maybeSingle();

    const property = Array.isArray(room?.properties)
      ? room?.properties[0]
      : room?.properties;

    if (room && property) {
      title = String(room.room_label ?? title);
      const zone = (property as { zone?: string | null }).zone?.trim();
      const city =
        (property as { city?: string | null }).city?.trim() || "Ancona";
      // Privacy: zone + city only — never address
      zoneLine = zone ? `${zone}, ${city}` : city;
      priceLine = `${Number(room.price_monthly) || 0}€/mese`;
      guaranteed =
        (property as { guaranteed_rent?: boolean }).guaranteed_rent === true;
    }
  } catch {
    /* fallback branding */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#F4F8F7",
          backgroundImage: `radial-gradient(circle at 90% 10%, rgba(255,107,74,0.22), transparent 55%), radial-gradient(circle at 5% 90%, rgba(15,110,106,0.18), transparent 50%)`,
          color: INK,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: SEA_600,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            C
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, color: SEA_600 }}>
            Coabito
          </span>
          {guaranteed ? (
            <span
              style={{
                marginLeft: 12,
                borderRadius: 999,
                backgroundColor: SEA_600,
                color: "#fff",
                fontSize: 18,
                fontWeight: 600,
                padding: "8px 16px",
              }}
            >
              Canone garantito
            </span>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -1,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 30, color: "#5C7A78" }}>{zoneLine}</div>
          {priceLine ? (
            <div style={{ fontSize: 40, fontWeight: 700, color: SEA_600 }}>
              {priceLine}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: SEA_100,
          }}
        >
          <span style={{ color: "#5C7A78" }}>
            Marketplace abitativo · coabito.it
          </span>
          <span
            style={{
              backgroundColor: SUNSET,
              color: "#fff",
              borderRadius: 999,
              padding: "10px 20px",
              fontWeight: 600,
            }}
          >
            Scopri su Coabito
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
