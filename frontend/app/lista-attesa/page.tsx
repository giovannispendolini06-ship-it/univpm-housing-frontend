import { Suspense } from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import WaitlistForm from "./WaitlistForm";
import WaitlistPageHeader from "./WaitlistPageHeader";

export const metadata = {
  title: "Lista d'attesa | Coabito",
  description:
    "Iscriviti alla lista d'attesa Coabito: ti avvisiamo appena arriva una stanza compatibile ad Ancona.",
};

export default function ListaAttesaPage() {
  return (
    <main className="bg-bg">
      <LandingNavbar />

      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
        <Suspense fallback={null}>
          <WaitlistPageHeader />
        </Suspense>

        <Reveal delay={100}>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl2 bg-surface" />}>
          <WaitlistForm />
        </Suspense>
      </Reveal>
      </div>

      <LandingFooter />
    </main>
  );
}
