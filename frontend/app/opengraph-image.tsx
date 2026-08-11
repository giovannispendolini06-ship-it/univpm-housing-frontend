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
          padding: "72px 80px",
          backgroundColor: SEA_600,
          // Satori (@vercel/og) requires an explicit shape keyword before the
          // size (circle/ellipse); bare "700px 500px at …" fails the parser.
          backgroundImage:
            "radial-gradient(circle 500px at 85% 20%, rgba(255,107,74,0.35), transparent 60%), radial-gradient(circle 600px at 10% 90%, rgba(8,47,45,0.55), transparent 55%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              color: SEA_600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            C
          </div>
          <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: -1 }}>
            Coabito
          </span>
        </div>

        <div
          style={{
            marginTop: 44,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.12,
            maxWidth: 920,
            letterSpacing: -1.5,
          }}
        >
          Trova casa chattando, non scorrendo annunci a caso.
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 30,
            color: SEA_100,
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          Chatta con Vesta e scopri le stanze più compatibili con te, vicino al
          tuo ateneo.
        </div>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 140,
              height: 10,
              borderRadius: 999,
              backgroundColor: SUNSET,
            }}
          />
          <span style={{ fontSize: 22, color: SEA_100 }}>coabito.it</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
