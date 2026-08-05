"use client";

import { useState } from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import PhoneFrame from "@/components/onboarding-install/PhoneFrame";
import {
  BrowserStep,
  IosShareStep,
  IosShareSheetStep,
  AndroidMenuStep,
  AndroidDropdownStep,
  HomeScreenStep,
} from "@/components/onboarding-install/InstallSteps";

type Platform = "ios" | "android";

const IOS_STEPS = [
  { title: "Apri Coabito su Safari", body: "Vai su coabito.it come faresti normalmente.", visual: <BrowserStep /> },
  { title: "Tocca l'icona di condivisione", body: "In basso, l'icona con il quadrato e la freccia verso l'alto.", visual: <IosShareStep /> },
  { title: "Tocca \u201cAggiungi alla schermata Home\u201d", body: "La trovi scorrendo la lista che compare.", visual: <IosShareSheetStep /> },
  { title: "Fatto! L'icona è sulla tua Home", body: "Da ora puoi aprire Coabito come una vera app.", visual: <HomeScreenStep /> },
];

const ANDROID_STEPS = [
  { title: "Apri Coabito su Chrome", body: "Vai su coabito.it come faresti normalmente.", visual: <BrowserStep /> },
  { title: "Tocca i tre puntini in alto", body: "In alto a destra, il menu con i tre puntini verticali.", visual: <AndroidMenuStep /> },
  { title: "Tocca \u201cInstalla app\u201d", body: "Se non la vedi, cerca \u201cAggiungi a schermata Home\u201d.", visual: <AndroidDropdownStep /> },
  { title: "Fatto! L'icona è sulla tua Home", body: "Da ora puoi aprire Coabito come una vera app.", visual: <HomeScreenStep /> },
];

export default function InstallaPage() {
  const [platform, setPlatform] = useState<Platform>("ios");
  const steps = platform === "ios" ? IOS_STEPS : ANDROID_STEPS;

  return (
    <main className="bg-bg">
      <LandingNavbar />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Link href="/" className="mb-6 inline-block text-sm text-ink-muted underline underline-offset-2">
          ← Torna alla home
        </Link>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          Installa Coabito sul tuo telefono
        </h1>
        <p className="mb-8 max-w-xl text-base text-ink-muted">
          Niente App Store: bastano quattro tocchi per avere un&apos;icona vera sulla
          schermata Home, che si apre a schermo intero come un&apos;app.
        </p>

        {/* Selettore piattaforma */}
        <div className="mb-10 inline-flex rounded-full bg-surface p-1 shadow-card">
          <button
            onClick={() => setPlatform("ios")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              platform === "ios" ? "bg-sea-600 text-white" : "text-ink-muted"
            }`}
          >
            iPhone
          </button>
          <button
            onClick={() => setPlatform("android")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              platform === "android" ? "bg-sea-600 text-white" : "text-ink-muted"
            }`}
          >
            Android
          </button>
        </div>

        {/* I quattro passaggi */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <PhoneFrame>{step.visual}</PhoneFrame>
              <div className="mt-4 flex h-6 w-6 items-center justify-center rounded-full bg-sea-600 font-display text-xs font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mt-2 font-display text-sm font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-xs text-ink-muted">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-xl2 bg-surface p-5 text-sm text-ink-muted shadow-card">
          <strong className="text-ink">Da sapere:</strong> il sito resta identico a
          prima anche senza installarlo — questo passaggio aggiunge solo un&apos;icona
          comoda, non cambia nulla di come funziona Coabito.
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}
