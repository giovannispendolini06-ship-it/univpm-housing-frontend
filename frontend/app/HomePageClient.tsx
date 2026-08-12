"use client";

import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import HomeIntro from "@/components/landing/HomeIntro";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FounderNote from "@/components/landing/FounderNote";
import FaqSection from "@/components/landing/FaqSection";
import LandingFooter from "@/components/landing/LandingFooter";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function HomePageClient({
  waitlistCount = 0,
}: {
  waitlistCount?: number;
}) {
  const { t } = useLocale();

  return (
    <main className="bg-bg">
      <HomeIntro />
      <LandingNavbar />
      <Hero waitlistCount={waitlistCount} />

      <HowItWorksSection
        id="studenti"
        eyebrow={t.howItWorksStudents.eyebrow}
        title={t.howItWorksStudents.title}
        variant="muted"
        ctaLabel={t.howItWorksStudents.ctaLabel}
        ctaHref="/login"
        steps={t.howItWorksStudents.steps}
      />

      <FounderNote />

      <HowItWorksSection
        id="proprietari"
        eyebrow={t.howItWorksOwners.eyebrow}
        title={t.howItWorksOwners.title}
        variant="default"
        ctaLabel={t.howItWorksOwners.ctaLabel}
        ctaHref="/proprietari"
        steps={t.howItWorksOwners.steps}
      />

      <FaqSection />

      <LandingFooter />
    </main>
  );
}
