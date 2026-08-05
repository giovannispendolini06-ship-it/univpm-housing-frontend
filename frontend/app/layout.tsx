import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://univpm-housing-frontend.vercel.app";

export const viewport: Viewport = {
  themeColor: "#0F6E6A",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Coabito | Trova casa vicino alla tua università",
    template: "%s | Coabito",
  },
  description:
    "Chatta con Vesta e scopri le stanze più compatibili con te, vicino al tuo ateneo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Coabito",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Coabito",
    title: "Coabito | Trova casa vicino alla tua università",
    description:
      "Chatta con Vesta e scopri le stanze più compatibili con te, vicino al tuo ateneo.",
  },
  twitter: {
    card: "summary",
    title: "Coabito | Trova casa vicino alla tua università",
    description:
      "Chatta con Vesta e scopri le stanze più compatibili con te, vicino al tuo ateneo.",
  },
  robots: {
    index: true,
    follow: true,
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
        <LocaleProvider>
          {children}
          <Analytics />
          <ServiceWorkerRegister />
        </LocaleProvider>
      </body>
    </html>
  );
}
