import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { faqPageJsonLd } from "@/lib/seo/structured-data";
import { getConfirmedWaitlistCount } from "@/lib/waitlist-stats";
import { SITE_URL } from "@/lib/site";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Coabito | Trova casa vicino alla tua università",
  description:
    "Trova una stanza ad Ancona chattando con Vesta: matching per facoltà, budget e abitudini di convivenza. Gratuito per gli studenti UNIVPM.",
  alternates: { canonical: SITE_URL },
};

export default async function HomePage() {
  const waitlistCount = await getConfirmedWaitlistCount();
  return (
    <>
      <JsonLd data={faqPageJsonLd()} />
      <HomePageClient waitlistCount={waitlistCount} />
    </>
  );
}
