import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pakkelapp.no - Gratis adresselapp fra QR-kode | Posten & Bring",
  description:
    "Skann QR-koden fra Posten/Bring-appen og generer en adresselapp som PDF. Gratis, ingen registrering, alt skjer lokalt i nettleseren. Perfekt for pakkebokser og hjemmelevering.",
  keywords: [
    "pakkelapp",
    "adresselapp",
    "posten",
    "bring",
    "qr-kode",
    "fraktlabel",
    "norgespakke",
    "pakkeboks",
    "shipping label",
    "finn fiks ferdig",
    "pakke",
    "etikett",
  ],
  authors: [{ name: "Nilsen Konsult", url: "https://pakkelapp.no" }],
  creator: "Nilsen Konsult",
  publisher: "Nilsen Konsult",
  metadataBase: new URL("https://pakkelapp.no"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: "https://pakkelapp.no",
    siteName: "Pakkelapp.no",
    title: "Pakkelapp.no - Gratis adresselapp fra QR-kode",
    description:
      "Skann QR-koden fra Posten/Bring-appen og last ned en ferdig adresselapp som PDF. Gratis og helt lokalt i nettleseren.",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pakkelapp.no - Gratis adresselapp fra QR-kode",
    description:
      "Skann QR-koden fra Posten/Bring-appen og last ned en ferdig adresselapp som PDF.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#E32D22" />
      </head>
      <body className="antialiased">
        {children}
        <Script
          src="https://rybbit.mkapi.no/api/script.js"
          data-site-id="adc06d5af951"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
