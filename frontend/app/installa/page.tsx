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
import { useLocale } from "@/lib/i18n/LocaleContext";

type Platform = "ios" | "android";

const STEP_VISUALS_IOS = [
  <BrowserStep key="browser" />,
  <IosShareStep key="share" />,
  <IosShareSheetStep key="sheet" />,
  <HomeScreenStep key="home" />,
];

const STEP_VISUALS_ANDROID = [
  <BrowserStep key="browser" />,
  <AndroidMenuStep key="menu" />,
  <AndroidDropdownStep key="dropdown" />,
  <HomeScreenStep key="home" />,
];

export default function InstallaPage() {
  const { t } = useLocale();
  const [platform, setPlatform] = useState<Platform>("ios");
  const steps = platform === "ios" ? t.installa.iosSteps : t.installa.androidSteps;
  const visuals = platform === "ios" ? STEP_VISUALS_IOS : STEP_VISUALS_ANDROID;

  return (
    <main className="bg-bg">
      <LandingNavbar />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-ink-muted underline underline-offset-2"
        >
          {t.installa.backToHome}
        </Link>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          {t.installa.title}
        </h1>
        <p className="mb-8 max-w-xl text-base text-ink-muted">{t.installa.subtitle}</p>

        <div className="mb-10 inline-flex rounded-full bg-surface p-1 shadow-card">
          <button
            onClick={() => setPlatform("ios")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              platform === "ios" ? "bg-sea-600 text-white" : "text-ink-muted"
            }`}
          >
            {t.installa.iphoneTab}
          </button>
          <button
            onClick={() => setPlatform("android")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              platform === "android" ? "bg-sea-600 text-white" : "text-ink-muted"
            }`}
          >
            {t.installa.androidTab}
          </button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <PhoneFrame>{visuals[index]}</PhoneFrame>
              <div className="mt-4 flex h-6 w-6 items-center justify-center rounded-full bg-sea-600 font-display text-xs font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mt-2 font-display text-sm font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-xs text-ink-muted">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-xl2 bg-surface p-5 text-sm text-ink-muted shadow-card">
          {t.installa.note}
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}
