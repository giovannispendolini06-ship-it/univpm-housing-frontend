import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
} from "@/lib/supabase/server";
import { createProperty } from "../actions";
import SubmitButton from "@/components/SubmitButton";

const SERVICE_OPTIONS = [
  "Wifi",
  "Lavatrice",
  "Riscaldamento centralizzato",
  "Posto auto",
  "Aria condizionata",
  "Terrazzo condiviso",
];

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // --- Verifica accesso: solo admin -----------------------------------------
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

  // --- Pre-riempimento da un lead esterno o da una richiesta proprietario ---
  const params = await searchParams;
  const prefill = {
    leadId: params.lead_id ?? "",
    address: params.address ?? "",
    zone: params.zone ?? "",
    price: params.price ?? "",
    title: params.title ?? "",
    ownerName: params.owner_name ?? "",
    ownerPhone: params.owner_phone ?? "",
    ownerEmail: params.owner_email ?? "",
  };

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">
            Nuovo immobile
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Crea l&apos;immobile e la sua prima stanza. Potrai aggiungerne
            altre in un secondo momento.
          </p>
          {prefill.leadId && (
            <p className="mt-2 rounded-lg bg-sea-50 px-3 py-2 text-xs text-sea-700">
              Stai creando questo immobile a partire da un annuncio esterno
              tracciato — verrà collegato automaticamente al salvataggio.
            </p>
          )}
        </header>

        <form action={createProperty} className="space-y-6">
          <input type="hidden" name="lead_id" value={prefill.leadId} />

          {/* --- Sezione immobile --- */}
          <section className="rounded-xl2 bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-display text-base font-bold text-ink">
              Immobile
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Indirizzo *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  defaultValue={prefill.address}
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
                  defaultValue="Ancona"
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
                  defaultValue={prefill.zone}
                  placeholder="Es. Torrette"
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
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Tipo contratto
                </label>
                <select
                  name="contract_type"
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
                  defaultValue={prefill.price}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Stato garanzia
                </label>
                <select
                  name="guarantee_status"
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                >
                  <option value="nessuna">Nessuna</option>
                  <option value="deposito_cauzionale">Deposito cauzionale</option>
                  <option value="fideiussione">Fideiussione</option>
                  <option value="garante_terzo">Garante terzo</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Deposito (€)
                </label>
                <input
                  type="number"
                  name="deposit_amount"
                  min={0}
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
                  defaultValue={1}
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
                  defaultValue={1}
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
                  placeholder="Es. 2° piano"
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Stato annuncio
                </label>
                <select
                  name="status"
                  defaultValue="attivo"
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                >
                  <option value="attivo">Attivo (visibile agli studenti)</option>
                  <option value="bozza">Bozza (non ancora visibile)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" name="has_elevator" id="has_elevator" className="h-4 w-4" />
                <label htmlFor="has_elevator" className="text-sm text-ink">
                  Ascensore
                </label>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  name="is_furnished"
                  id="is_furnished"
                  defaultChecked
                  className="h-4 w-4"
                />
                <label htmlFor="is_furnished" className="text-sm text-ink">
                  Arredato
                </label>
              </div>
            </div>
          </section>

          {/* --- Sezione contatto proprietario --- */}
          <section className="rounded-xl2 bg-surface p-5 shadow-card">
            <h2 className="mb-1 font-display text-base font-bold text-ink">
              Contatto del proprietario
            </h2>
            <p className="mb-4 text-xs text-ink-muted">
              Utile finché non ha un suo account sul sito — resta visibile
              solo a te.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                name="owner_contact_name"
                defaultValue={prefill.ownerName}
                placeholder="Nome e cognome"
                className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
              />
              <input
                type="tel"
                name="owner_contact_phone"
                defaultValue={prefill.ownerPhone}
                placeholder="Telefono"
                className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
              />
              <input
                type="email"
                name="owner_contact_email"
                defaultValue={prefill.ownerEmail}
                placeholder="Email"
                className="rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
              />
            </div>
          </section>

          {/* --- Sezione prima stanza --- */}
          <section className="rounded-xl2 bg-surface p-5 shadow-card">
            <h2 className="mb-1 font-display text-base font-bold text-ink">
              Prima stanza
            </h2>
            <p className="mb-4 text-xs text-ink-muted">
              Ogni immobile ha almeno una stanza: è quello che vedono gli
              studenti nella dashboard.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Nome stanza *
                </label>
                <input
                  type="text"
                  name="room_label"
                  required
                  defaultValue={prefill.title}
                  placeholder="Es. Singola luminosa con balcone"
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Prezzo mensile (€) *
                </label>
                <input
                  type="number"
                  name="price_monthly"
                  required
                  min={0}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Spese stimate (€/mese)
                </label>
                <input
                  type="number"
                  name="estimated_utilities"
                  min={0}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Mq stanza
                </label>
                <input
                  type="number"
                  name="room_size_sqm"
                  min={0}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Massimo occupanti
                </label>
                <input
                  type="number"
                  name="max_occupants"
                  min={1}
                  defaultValue={1}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Disponibile dal
                </label>
                <input
                  type="date"
                  name="available_from"
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  name="has_private_bathroom"
                  id="has_private_bathroom"
                  className="h-4 w-4"
                />
                <label htmlFor="has_private_bathroom" className="text-sm text-ink">
                  Bagno privato
                </label>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" name="has_balcony" id="has_balcony" className="h-4 w-4" />
                <label htmlFor="has_balcony" className="text-sm text-ink">
                  Balcone
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-ink-muted">
                  Servizi inclusi
                </label>
                <div className="flex flex-wrap gap-3">
                  {SERVICE_OPTIONS.map((service) => (
                    <label
                      key={service}
                      className="flex items-center gap-1.5 rounded-full border border-sea-100 px-3 py-1.5 text-xs text-ink"
                    >
                      <input
                        type="checkbox"
                        name="services_included"
                        value={service}
                        className="h-3.5 w-3.5"
                      />
                      {service}
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  name="extra_service"
                  placeholder="Altro servizio (facoltativo)"
                  className="mt-2 w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
                />
              </div>
            </div>
          </section>

          <SubmitButton className="w-full rounded-full bg-sea-600 py-3 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50 sm:w-auto sm:px-8">
            Crea immobile
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
