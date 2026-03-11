import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pakkelapp.no - QR til adresselapp",
  description:
    "Skann QR-kode fra Posten/Bring-appen og generer adresselapp for utskrift",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className="antialiased">{children}</body>
    </html>
  );
}
