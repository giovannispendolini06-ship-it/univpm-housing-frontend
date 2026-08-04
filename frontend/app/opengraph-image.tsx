import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Coabito | Trova casa vicino alla tua università";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Colori del tema "Adriatico" (teal profondo + corallo).
const SEA_600 = "#0F6E6A";
const SEA_100 = "#CFE6E4";
const SUNSET = "#FF6B4A";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: SEA_600,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              color: SEA_600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <span style={{ fontSize: 56, fontWeight: 700 }}>Coabito</span>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Trova casa chattando, non scorrendo annunci a caso.
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            color: SEA_100,
            maxWidth: 820,
          }}
        >
          Chatta con Vesta e scopri le stanze più compatibili con te.
        </div>

        <div
          style={{
            marginTop: 40,
            width: 160,
            height: 10,
            borderRadius: 999,
            backgroundColor: SUNSET,
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
