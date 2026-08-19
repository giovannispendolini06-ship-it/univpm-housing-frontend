import { redirect, notFound } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { updateProperty } from "../../actions";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
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
  const { data: property } = await db.from("properties").select("*").eq("id", id).single();

  if (!property) notFound();

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <a
          href={`/admin/properties/${id}`}
          className="mb-4 inline-block text-sm text-ink-muted underline underline-offset-2"
        >
          ← Torna all&apos;immobile
        </a>

        <h1 className="mb-6 font-display text-2xl font-bold text-ink">
          Modifica immobile
        </h1>

        <form action={updateProperty} className="space-y-6">
          <input type="hidden" name="property_id" value={property.id} />

          <section className="rounded-xl2 bg-surface p-5 shadow-card">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Indirizzo *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  defaultValue={property.address}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Città
                </label>
                <input
                  type="text"
                  name="city"
                  defaultValue={property.city}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Zona
                </label>
                <input
                  type="text"
                  name="zone"
                  defaultValue={property.zone ?? ""}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Distanza Monte Dago (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="distance_monte_dago_km"
                  defaultValue={property.distance_monte_dago_km ?? ""}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Distanza Torrette (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="distance_torrette_km"
                  defaultValue={property.distance_torrette_km ?? ""}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Distanza Centro/Economia (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="distance_centro_km"
                  defaultValue={property.distance_centro_km ?? ""}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Tipo contratto
                </label>
                <select
                  name="contract_type"
                  defaultValue={property.contract_type}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                >
                  <option value="stanza_singola">Stanza singola</option>
                  <option value="stanza_doppia">Stanza doppia</option>
                  <option value="intero_appartamento">Intero appartamento</option>
                  <option value="transitorio">Transitorio</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Canone al proprietario (€/mese) *
                </label>
                <input
                  type="number"
                  name="monthly_rent_to_owner"
                  required
                  min={0}
                  defaultValue={property.monthly_rent_to_owner}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Stato garanzia
                </label>
                <select
                  name="guarantee_status"
                  defaultValue={property.guarantee_status}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                >
                  <option value="nessuna">Nessuna</option>
                  <option value="deposito_cauzionale">Deposito cauzionale</option>
                  <option value="fideiussione">Fideiussione</option>
                  <option value="garante_terzo">Garante terzo</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
                <input
                  type="checkbox"
                  name="guaranteed_rent"
                  defaultChecked={property.guaranteed_rent === true}
                  className="rounded border-sea-200"
                />
                <span>
                  <span className="font-semibold">Canone garantito Coabito</span>
                  <span className="block text-xs text-ink-muted">
                    Seed supply sul marketplace (badge pubblico). Distinto dallo stato
                    cauzione sopra.
                  </span>
                </span>
              </label>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Deposito (€)
                </label>
                <input
                  type="number"
                  name="deposit_amount"
                  min={0}
                  defaultValue={property.deposit_amount ?? ""}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Stanze totali nell&apos;immobile
                </label>
                <input
                  type="number"
                  name="total_rooms"
                  min={1}
                  defaultValue={property.total_rooms}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Bagni
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  min={1}
                  defaultValue={property.bathrooms}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Mq totali
                </label>
                <input
                  type="number"
                  name="size_sqm"
                  min={0}
                  defaultValue={property.size_sqm ?? ""}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Piano
                </label>
                <input
                  type="text"
                  name="floor"
                  defaultValue={property.floor ?? ""}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Stato annuncio
                </label>
                <select
                  name="status"
                  defaultValue={property.status}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                >
                  <option value="attivo">Attivo (visibile agli studenti)</option>
                  <option value="bozza">Bozza (non ancora visibile)</option>
                  <option value="affittato">Affittato</option>
                  <option value="sospeso">Sospeso</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  name="has_elevator"
                  id="has_elevator"
                  defaultChecked={property.has_elevator}
                  className="h-4 w-4"
                />
                <label htmlFor="has_elevator" className="text-sm text-ink">
                  Ascensore
                </label>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  name="is_furnished"
                  id="is_furnished"
                  defaultChecked={property.is_furnished}
                  className="h-4 w-4"
                />
                <label htmlFor="is_furnished" className="text-sm text-ink">
                  Arredato
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-xl2 bg-surface p-5 shadow-card">
            <h2 className="mb-1 font-display text-base font-bold text-ink">
              Contatto del proprietario
            </h2>
            <p className="mb-4 text-xs text-ink-muted">
              Solo per uso interno, finché non ha un account collegato.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                name="owner_contact_name"
                defaultValue={property.owner_contact_name ?? ""}
                placeholder="Nome e cognome"
                className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
              />
              <input
                type="tel"
                name="owner_contact_phone"
                defaultValue={property.owner_contact_phone ?? ""}
                placeholder="Telefono"
                className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
              />
              <input
                type="email"
                name="owner_contact_email"
                defaultValue={property.owner_contact_email ?? ""}
                placeholder="Email"
                className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
              />
            </div>
          </section>

          <SubmitButton className="w-full rounded-full bg-sea-600 py-3 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50 sm:w-auto sm:px-8">
            Salva modifiche
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
