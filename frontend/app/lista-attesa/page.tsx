import { Suspense } from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import WaitlistForm from "./WaitlistForm";

export const metadata = {
  title: "Lista d'attesa | Coabito",
  description:
    "Iscriviti alla lista d'attesa Coabito: ti avvisiamo appena arriva una stanza compatibile vicino al tuo ateneo.",
};

export default function ListaAttesaPage() {
  return (
    <main className="bg-bg">
      <LandingNavbar />
      <Suspense
        fallback={
          <div className="min-h-[420px] animate-pulse bg-[#0A2624]" aria-hidden />
        }
      >
        <WaitlistForm />
      </Suspense>
      <LandingFooter />
    </main>
  );
}
