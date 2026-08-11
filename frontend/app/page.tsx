import HomePageClient from "./HomePageClient";
import { getConfirmedWaitlistCount } from "@/lib/waitlist-stats";

export default async function HomePage() {
  const waitlistCount = await getConfirmedWaitlistCount();
  return <HomePageClient waitlistCount={waitlistCount} />;
}
