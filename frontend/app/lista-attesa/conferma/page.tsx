import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { confirmWaitlistByToken } from "@/lib/waitlist";
import ConfirmResult from "./ConfirmResult";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Conferma lista d'attesa | Coabito",
  description: "Conferma la tua iscrizione alla lista d'attesa Coabito.",
  robots: { index: false, follow: false },
};

export default async function WaitlistConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  const db = createServiceSupabaseClient();
  const result = token
    ? await confirmWaitlistByToken(db, token)
    : { status: "invalid" as const };

  return (
    <main className="bg-bg">
      <LandingNavbar />

      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
        <ConfirmResult
          status={result.status}
          position={"position" in result ? result.position : null}
          referralCode={"referralCode" in result ? result.referralCode : null}
        />
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="font-medium text-sea-700 underline-offset-2 hover:underline">
            ← Coabito
          </Link>
        </p>
      </div>

      <LandingFooter />
    </main>
  );
}
