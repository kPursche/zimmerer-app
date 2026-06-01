import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chor-Website-Builder",
  description:
    "Bestehende Chor-Website crawlen, Bilder extrahieren und aufbereiten, Website-Ziel wählen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
