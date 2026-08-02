import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dado — trova la stanza giusta",
  description:
    "Chatta con Dado e scopri stanze e coinquilini compatibili con il tuo stile di vita.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
