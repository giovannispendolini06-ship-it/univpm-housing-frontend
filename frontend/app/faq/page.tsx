import type { Metadata } from "next";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import FaqSection from "@/components/landing/FaqSection";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ | Coabito",
  description:
    "Domande frequenti su Coabito: matching, costi per gli studenti, contratto diretto e marketplace.",
  alternates: { canonical: `${SITE_URL}/faq` },
};

export default function FaqPage() {
  return (
    <main className="bg-bg">
      <LandingNavbar />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="mb-2 font-display text-3xl font-bold text-ink">FAQ</h1>
        <p className="mb-8 text-sm text-ink-muted">
          Risposte chiare sul marketplace Coabito. Per temi legali vedi anche Termini e Privacy.
        </p>
      </div>
      <FaqSection />
      <LandingFooter />
    </main>
  );
}
