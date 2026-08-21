import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import JsonLd from "@/components/JsonLd";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import { organizationJsonLd } from "@/lib/seo/structured-data";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/** Display: Fraunces — editorial warmth without cream/terracotta stock look */
const display = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

/** Body: Source Sans 3 — readable UI, pairs with Fraunces (matches email brand) */
const body = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

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
    url: SITE_URL,
    siteName: "Coabito",
    title: "Coabito | Trova casa vicino alla tua università",
    description:
      "Chatta con Vesta e scopri le stanze più compatibili con te, vicino al tuo ateneo.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Coabito | Trova casa vicino alla tua università",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coabito | Trova casa vicino alla tua università",
    description:
      "Chatta con Vesta e scopri le stanze più compatibili con te, vicino al tuo ateneo.",
    images: ["/twitter-image"],
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
        <JsonLd data={organizationJsonLd()} />
        <LocaleProvider>
          {children}
          <FloatingWhatsApp />
          <CookieConsentBanner />
          <ServiceWorkerRegister />
        </LocaleProvider>
      </body>
    </html>
  );
}
