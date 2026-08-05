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

  const [{ count: newInquiriesCount }, { count: newLeadsCount }] = await Promise.all([
    db
      .from("owner_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "nuovo"),
    db
      .from("leads_external")
      .select("*", { count: "exact", head: true })
      .eq("status", "nuovo"),
  ]);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 border-b border-sea-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="font-display text-sm font-bold text-ink">
              Pannello admin
            </span>
            <AdminNav
              newInquiriesCount={newInquiriesCount ?? 0}
              newLeadsCount={newLeadsCount ?? 0}
            />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-ink-muted underline underline-offset-2"
            >
              ← Torna al sito
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
