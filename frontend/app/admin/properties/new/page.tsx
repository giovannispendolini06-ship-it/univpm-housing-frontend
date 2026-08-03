import Link from "next/link";
import { createProperty } from "../actions";

const SERVICE_OPTIONS = [
  "Wifi",
  "Lavatrice",
  "Asciugatrice",
  "Riscaldamento centralizzato",
  "Riscaldamento autonomo",
  "Spese condominiali",
  "Pulizie incluse",
  "Posto auto",
];

const inputClass =
  "w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none";

export default function NewPropertyPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const params = searchParams;
  const leadId = params.lead_id ?? "";
  const prefilledAddress = params.address ?? "";
  const prefilledZone = params.zone ?? "";
  const prefilledPrice = params.price ?? "";
  const prefilledTitle = params.title ?? "";

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <Link
            href="/admin/properties"
            className="text-xs font-medium text-sea-700 underline underline-offset-2"
          >
            ← Torna agli immobili
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">
            Nuovo immobile
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Inserisci i dati dell&apos;immobile e della prima stanza. Se arrivi
            da un annuncio esterno, i campi sono già precompilati dove possibile.
          </p>
        </header>

        <form action={createProperty} className="space-y-8">
          {leadId && <input type="hidden" name="lead_id" value={leadId} />}

          {/* Immobile */}
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
                  defaultValue={prefilledAddress}
                  placeholder="Via, numero civico"
                  className={inputClass}
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
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Zona
                </label>
                <input
                  type="text"
                  name="zone"
                  defaultValue={prefilledZone}
                  placeholder="Es. Torrette"
                  className={inputClass}
                />
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
                  step={1}
                  defaultValue={prefilledPrice}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Tipo contratto
                </label>
                <select name="contract_type" className={inputClass}>
                  <option value="stanza_singola">Stanza singola</option>
                  <option value="stanza_doppia">Stanza doppia</option>
                  <option value="intero_appartamento">Intero appartamento</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Garanzia
                </label>
                <select name="guarantee_status" className={inputClass}>
                  <option value="nessuna">Nessuna</option>
                  <option value="deposito_cauzionale">Deposito cauzionale</option>
                  <option value="fideiussione_bancaria">Fideiussione bancaria</option>
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
                  step={1}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Stato immobile
                </label>
                <select name="status" defaultValue="attivo" className={inputClass}>
                  <option value="attivo">Attivo</option>
                  <option value="in_revisione">In revisione</option>
                  <option value="inattivo">Inattivo</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Stanze totali
                </label>
                <input
                  type="number"
                  name="total_rooms"
                  min={1}
                  defaultValue={1}
                  className={inputClass}
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
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Superficie (m²)
                </label>
                <input
                  type="number"
                  name="size_sqm"
                  min={0}
                  step={0.1}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Piano
                </label>
                <input type="text" name="floor" className={inputClass} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Distanza Monte Dago (km)
                </label>
                <input
                  type="number"
                  name="distance_monte_dago_km"
                  min={0}
                  step={0.1}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Distanza Torrette (km)
                </label>
                <input
                  type="number"
                  name="distance_torrette_km"
                  min={0}
                  step={0.1}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Distanza Centro (km)
                </label>
                <input
                  type="number"
                  name="distance_centro_km"
                  min={0}
                  step={0.1}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-wrap gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" name="has_elevator" className="rounded" />
                  Ascensore
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" name="is_furnished" className="rounded" />
                  Arredato
                </label>
              </div>
            </div>
          </section>

          {/* Contatto proprietario */}
          <section className="rounded-xl2 bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-display text-base font-bold text-ink">
              Contatto proprietario
            </h2>
            <p className="mb-4 text-xs text-ink-muted">
              Il proprietario potrebbe non avere ancora un account: salva qui i
              suoi contatti per non perderli.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Nome
                </label>
                <input type="text" name="owner_contact_name" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Telefono
                </label>
                <input type="tel" name="owner_contact_phone" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Email
                </label>
                <input
                  type="email"
                  name="owner_contact_email"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Prima stanza */}
          <section className="rounded-xl2 bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-display text-base font-bold text-ink">
              Prima stanza
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Nome stanza *
                </label>
                <input
                  type="text"
                  name="room_label"
                  required
                  defaultValue={prefilledTitle}
                  placeholder="Es. Singola luminosa con balcone"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Prezzo studente (€/mese) *
                </label>
                <input
                  type="number"
                  name="price_monthly"
                  required
                  min={0}
                  step={1}
                  defaultValue={prefilledPrice}
                  className={inputClass}
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
                  step={1}
                  defaultValue={0}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Superficie stanza (m²)
                </label>
                <input
                  type="number"
                  name="room_size_sqm"
                  min={0}
                  step={0.1}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Max occupanti
                </label>
                <input
                  type="number"
                  name="max_occupants"
                  min={1}
                  defaultValue={1}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Disponibile dal
                </label>
                <input type="date" name="available_from" className={inputClass} />
              </div>

              <div className="flex flex-wrap gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    name="has_private_bathroom"
                    className="rounded"
                  />
                  Bagno privato
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" name="has_balcony" className="rounded" />
                  Balcone
                </label>
              </div>

              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-medium text-ink-muted">
                  Servizi inclusi
                </p>
                <div className="flex flex-wrap gap-3">
                  {SERVICE_OPTIONS.map((service) => (
                    <label
                      key={service}
                      className="flex items-center gap-1.5 text-xs text-ink"
                    >
                      <input
                        type="checkbox"
                        name="services_included"
                        value={service}
                        className="rounded"
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Altro servizio (opzionale)
                </label>
                <input
                  type="text"
                  name="extra_service"
                  placeholder="Es. Cantina"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-sea-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700"
            >
              Crea immobile
            </button>
            <Link
              href="/admin/properties"
              className="rounded-full border border-sea-200 px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-sea-400"
            >
              Annulla
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
