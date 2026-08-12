import JsonLd from "@/components/JsonLd";
import { faqPageJsonLd } from "@/lib/seo/structured-data";
import { getConfirmedWaitlistCount } from "@/lib/waitlist-stats";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const waitlistCount = await getConfirmedWaitlistCount();
  return (
    <>
      <JsonLd data={faqPageJsonLd()} />
      <HomePageClient waitlistCount={waitlistCount} />
    </>
  );
}
