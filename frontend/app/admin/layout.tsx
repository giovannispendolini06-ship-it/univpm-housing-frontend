import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import AdminNav from "./AdminNav";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Conteggi per il pannello a scomparsa: quante cose aspettano attenzione,
  // visibili da qualsiasi pagina del pannello admin senza doverci navigare.
  const db = createServiceSupabaseClient();

  const [{ count: newInquiriesCount }, { count: newLeadsCount }, { count: latePaymentsCount }] =
    await Promise.all([
      db
        .from("owner_inquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "nuovo"),
      db
        .from("leads_external")
        .select("*", { count: "exact", head: true })
        .eq("status", "nuovo"),
      db
        .from("rent_payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_ritardo"),
    ]);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 border-b border-sea-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden font-display text-sm font-bold text-ink sm:inline">
              Pannello admin
            </span>
            <AdminNav
              newInquiriesCount={newInquiriesCount ?? 0}
              newLeadsCount={newLeadsCount ?? 0}
              latePaymentsCount={latePaymentsCount ?? 0}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-ink-muted underline underline-offset-2"
            >
              ← Sito
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
