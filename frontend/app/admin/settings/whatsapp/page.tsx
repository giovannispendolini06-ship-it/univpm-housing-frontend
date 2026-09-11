import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
} from "@/lib/supabase/server";
import { getWhatsAppTemplates } from "@/app/admin/whatsapp/actions";
import WhatsAppSettingsForm from "./WhatsAppSettingsForm";

export const dynamic = "force-dynamic";

export default async function WhatsAppSettingsPage() {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const templates = await getWhatsAppTemplates();

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <Link
          href="/admin"
          className="inline-block text-sm text-ink-muted underline underline-offset-2"
        >
          ← Dashboard
        </Link>

        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Impostazioni
          </p>
          <h1 className="font-display text-2xl font-bold text-ink">
            Messaggi WhatsApp
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Modifica i template usati dal contatto rapido su proprietari e
            studenti. Richiede la migration{" "}
            <code className="text-xs">migration_whatsapp_contact.sql</code> su
            Supabase per il salvataggio permanente.
          </p>
        </header>

        <div className="rounded-xl2 bg-surface p-5 shadow-card">
          <WhatsAppSettingsForm initialTemplates={templates} />
        </div>
      </div>
    </main>
  );
}
