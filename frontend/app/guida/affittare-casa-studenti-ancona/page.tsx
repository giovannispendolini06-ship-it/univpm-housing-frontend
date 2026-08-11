import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { guideArticleJsonLd } from "@/lib/seo/structured-data";
import { SITE_URL } from "@/lib/site";
import GuideContent from "./GuideContent";

const PATH = "/guida/affittare-casa-studenti-ancona";

export const metadata: Metadata = {
  title: "Come affittare casa per studenti ad Ancona",
  description:
    "Guida pratica per fuori sede UNIVPM: quando cercare, zone vicino ai poli, budget e come Coabito ti aiuta a trovare una stanza compatibile.",
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: "Come affittare casa per studenti ad Ancona | Coabito",
    description:
      "Tempi, zone, budget e consigli concreti per affittare una stanza da studente ad Ancona.",
    url: `${SITE_URL}${PATH}`,
    type: "article",
  },
};

export default function GuidaAffittoAnconaPage() {
  return (
    <>
      <JsonLd data={guideArticleJsonLd()} />
      <GuideContent />
    </>
  );
}
