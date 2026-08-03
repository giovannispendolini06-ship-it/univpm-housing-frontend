import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bindo — Trova casa chattando, non scorrendo annunci a caso.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F6E6A 0%, #0A4F4C 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 700,
              color: "#0F6E6A",
            }}
          >
            B
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, color: "#ffffff" }}>Bindo</div>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 34,
            color: "#CFE6E4",
            maxWidth: 820,
            textAlign: "center",
            display: "flex",
          }}
        >
          Trova casa chattando, non scorrendo annunci a caso.
        </div>
      </div>
    ),
    { ...size },
  );
}
