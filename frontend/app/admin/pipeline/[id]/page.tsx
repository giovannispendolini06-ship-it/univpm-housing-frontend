import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import {
  LANDLORD_SOURCE_OPTIONS,
  LANDLORD_STATUS_OPTIONS,
  LANDLORD_ZONE_OPTIONS,
  type LandlordLead,
} from "@/lib/landlord-leads";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { deleteLandlordLead, updateLandlordLead } from "../actions";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function LandlordLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const db = createServiceSupabaseClient();
  const { data: lead } = await db
    .from("landlord_leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!lead) notFound();

  const row = lead as LandlordLead;
  const wa = buildWhatsAppLink(
    row.telefono,
    `Ciao ${row.nome}, sono Giovanni di Coabito. Ti contatto riguardo all'immobile${row.indirizzo_immobile ? ` in ${row.indirizzo_immobile}` : ""} — hai un momento per parlarne?`,
  );

  const fieldClass =
    "w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none";

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/pipeline"
            className="text-sm text-ink-muted underline underline-offset-2"
          >
            ← Pipeline
          </Link>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
            >
              Apri WhatsApp
            </a>
          )}
        </div>

        <header>
          <h1 className="font-display text-2xl font-bold text-ink">{row.nome}</h1>
          <p className="mt-1 text-sm text-ink-muted">{row.telefono}</p>
        </header>

        <form action={updateLandlordLead} className="space-y-4 rounded-xl2 bg-surface p-5 shadow-card">
          <input type="hidden" name="id" value={row.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">Nome *</label>
              <input name="nome" required defaultValue={row.nome} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">Telefono *</label>
              <input name="telefono" required defaultValue={row.telefono} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">Email</label>
              <input name="email" type="email" defaultValue={row.email ?? ""} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">Stato</label>
              <select name="stato" defaultValue={row.stato} className={fieldClass}>
                {LANDLORD_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Indirizzo immobile
              </label>
              <input
                name="indirizzo_immobile"
                defaultValue={row.indirizzo_immobile ?? ""}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">Zona</label>
              <select name="zona" defaultValue={row.zona ?? ""} className={fieldClass}>
                <option value="">—</option>
                {LANDLORD_ZONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">Fonte</label>
              <select name="fonte" defaultValue={row.fonte ?? ""} className={fieldClass}>
                <option value="">—</option>
                {LANDLORD_SOURCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Prezzo richiesto (€)
              </label>
              <input
                name="prezzo_richiesto"
                type="number"
                defaultValue={row.prezzo_richiesto ?? ""}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">Arredato</label>
              <select
                name="arredato"
                defaultValue={
                  row.arredato === true ? "true" : row.arredato === false ? "false" : ""
                }
                className={fieldClass}
              >
                <option value="">Non specificato</option>
                <option value="true">Sì</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Link annuncio
              </label>
              <input
                name="link_annuncio"
                type="url"
                defaultValue={row.link_annuncio ?? ""}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Ultimo contatto
              </label>
              <input
                name="data_ultimo_contatto"
                type="date"
                defaultValue={row.data_ultimo_contatto ?? ""}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Prossimo follow-up
              </label>
              <input
                name="data_prossimo_followup"
                type="date"
                defaultValue={row.data_prossimo_followup ?? ""}
                className={fieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-muted">Note</label>
              <textarea
                name="note"
                rows={6}
                defaultValue={row.note ?? ""}
                placeholder="Appunti dopo ogni chiamata…"
                className={fieldClass}
              />
            </div>
          </div>

          <SubmitButton className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50">
            Salva modifiche
          </SubmitButton>
        </form>

        <form action={deleteLandlordLead}>
          <input type="hidden" name="id" value={row.id} />
          <button
            type="submit"
            className="text-xs text-ink-muted underline underline-offset-2 transition hover:text-sunset-600"
          >
            Elimina lead
          </button>
        </form>
      </div>
    </main>
  );
}
