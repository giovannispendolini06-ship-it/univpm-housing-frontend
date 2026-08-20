"use client";

import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import HomeIntro from "@/components/landing/HomeIntro";
import HowItWorksInteractive from "@/components/landing/HowItWorksInteractive";
import FounderNote from "@/components/landing/FounderNote";
import FaqSection from "@/components/landing/FaqSection";
import LandingFooter from "@/components/landing/LandingFooter";
import TrackOnce from "@/components/TrackOnce";

export default function HomePageClient({
  waitlistCount = 0,
}: {
  waitlistCount?: number;
}) {
  return (
    <main className="bg-bg">
      <TrackOnce event="homepage_view" />
      <HomeIntro />
      <LandingNavbar />
      <Hero waitlistCount={waitlistCount} />

      <HowItWorksInteractive />

      <FounderNote />

      <FaqSection />

      <LandingFooter />
    </main>
  );
}
