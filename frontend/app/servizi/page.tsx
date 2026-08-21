import type { Metadata } from "next";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { SITE_URL } from "@/lib/site";
import ServiziJourney from "./ServiziJourney";

const PATH = "/servizi";

export const metadata: Metadata = {
  title: "Servizi | Coabito",
  description:
    "Ti accompagniamo in ogni fase: verifica e costi chiari prima di candidarti, escrow e checklist al trasloco, mediazione e supporto dopo il trasferimento.",
  alternates: { canonical: `${SITE_URL}${PATH}` },
};

export default function ServiziPage() {
  return (
    <main className="bg-bg">
      <LandingNavbar />
      <div className="mx-auto max-w-[880px] px-4 py-12 sm:px-6 sm:py-14">
        <ServiziJourney />
      </div>
      <LandingFooter />
    </main>
  );
}
