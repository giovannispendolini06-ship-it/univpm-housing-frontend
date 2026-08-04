import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://coabito.it";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Coabito | Trova casa vicino alla tua università",
  description:
    "Chatta con Vesta e scopri le stanze più compatibili con te, vicino al tuo ateneo.",
  openGraph: {
    title: "Coabito | Trova casa vicino alla tua università",
    description:
      "Chatta con Vesta e scopri le stanze più compatibili con te, vicino al tuo ateneo.",
    url: SITE_URL,
    siteName: "Coabito",
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
