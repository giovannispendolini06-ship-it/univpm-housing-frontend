import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { studentFaqPageJsonLd } from "@/lib/seo/structured-data";
import { SITE_URL } from "@/lib/site";
import FaqStudentiContent from "./FaqStudentiContent";

const PATH = "/faq";

export const metadata: Metadata = {
  title: "FAQ | Coabito",
  description:
    "Quanto costa Coabito, come funziona il matching con Vesta, cosa succede dopo la lista d'attesa e come scegliamo stanze e coinquilini.",
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: "FAQ | Coabito",
    description:
      "Risposte chiare su costi, Vesta, lista d'attesa e matching per chi cerca casa per chi si trasferisce per studio o lavoro.",
    url: `${SITE_URL}${PATH}`,
    type: "website",
  },
};

export default function FaqStudentiPage() {
  return (
    <>
      <JsonLd data={studentFaqPageJsonLd()} />
      <FaqStudentiContent />
    </>
  );
}
