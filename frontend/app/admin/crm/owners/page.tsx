import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import type { CrmContact } from "@/lib/crm/types";
import ContactCenterTable from "@/components/admin/crm/ContactCenterTable";
import CrmContactForm from "@/components/admin/crm/CrmContactForm";

export const dynamic = "force-dynamic";

export default async function CrmOwnersPage() {
  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await auth
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const db = createServiceSupabaseClient();
  const { data } = await db
    .from("crm_contacts")
    .select("*")
    .eq("contact_type", "OWNER")
    .order("updated_at", { ascending: false })
    .limit(500);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/admin/crm" className="text-sm text-ink-muted underline">
              ← Contact Center
            </Link>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink">
              Proprietari
            </h1>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ContactCenterTable contacts={(data ?? []) as CrmContact[]} />
          <CrmContactForm defaultType="OWNER" />
        </div>
      </div>
    </main>
  );
}
