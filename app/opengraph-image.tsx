import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pakkelapp.no - Skann QR-kode, generer adresselapp";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 80, fontWeight: 800, color: "#E32D22" }}>
            Pakkelapp
          </span>
          <span style={{ fontSize: 80, fontWeight: 800, color: "#18181b" }}>
            .no
          </span>
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#52525b",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Skann QR-koden fra Posten/Bring-appen
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#52525b",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          og generer en adresselapp som PDF
        </div>
        <div
          style={{
            marginTop: 40,
            padding: "12px 32px",
            background: "#E32D22",
            color: "white",
            borderRadius: 12,
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          Gratis - Ingen registrering - Alt lokalt
        </div>
      </div>
    ),
    { ...size }
  );
}
