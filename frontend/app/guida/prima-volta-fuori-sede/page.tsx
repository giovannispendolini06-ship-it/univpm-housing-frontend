import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { guidePrimaVoltaJsonLd } from "@/lib/seo/structured-data";
import { SITE_URL } from "@/lib/site";
import GuideContent from "./GuideContent";

const PATH = "/guida/prima-volta-fuori-sede";

export const metadata: Metadata = {
  title: "Prima volta fuori sede: la guida pratica",
  description:
    "Documenti, contratto, budget, trasloco e convivenza: cosa sapere prima di lasciare casa per l'università. Guida pratica Coabito per fuori sede.",
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: "Prima volta fuori sede: la guida pratica | Coabito",
    description:
      "Cosa preparare, cosa controllare sul contratto, come gestire budget e coinquilini — senza linguaggio da opuscolo.",
    url: `${SITE_URL}${PATH}`,
    type: "article",
  },
};

export default function GuidaPrimaVoltaPage() {
  return (
    <>
      <JsonLd data={guidePrimaVoltaJsonLd()} />
      <GuideContent />
    </>
  );
}
