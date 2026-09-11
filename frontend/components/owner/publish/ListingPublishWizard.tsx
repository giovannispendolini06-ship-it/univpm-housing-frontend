"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/components/owner/publish/AddressAutocomplete";
import {
  EMPTY_WIZARD_DRAFT,
  LOCAL_DRAFT_KEY,
  WIZARD_STEPS,
  type ListingWizardDraft,
  type TargetAudience,
} from "@/components/owner/publish/wizard-types";
import type { GeocodedAddress, NearbyPoi } from "@/lib/mapbox-geocoding";
import { formatPoiDistance } from "@/lib/mapbox-geocoding";
import {
  isWholeUnitProperty,
  type PropertyType,
} from "@/lib/property-listing";
import {
  estimateListingDemand,
  generateListingDescription,
  publishListingFromWizard,
  saveListingWizardDraft,
  uploadWizardPhoto,
} from "@/app/owner/properties/wizard-actions";

const SETTLE = "cubic-bezier(0.34, 1.4, 0.64, 1)";
const SERVICES = [
  "Wifi",
  "Lavatrice",
  "Riscaldamento",
  "Ascensore",
  "Lavastoviglie",
];

type Props = {
  initialDraft?: ListingWizardDraft | null;
  csvImportSlot?: React.ReactNode;
};

export default function ListingPublishWizard({
  initialDraft,
  csvImportSlot,
}: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<ListingWizardDraft>(
    initialDraft ?? EMPTY_WIZARD_DRAFT,
  );
  const [error, setError] = useState<string | null>(null);
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [poisLoading, setPoisLoading] = useState(false);
  const [demand, setDemand] = useState<{
    count: number;
    message: string;
    low: boolean;
  } | null>(null);

  const wholeUnit = useMemo(
    () => isWholeUnitProperty(draft.propertyType),
    [draft.propertyType],
  );

  useEffect(() => {
    if (initialDraft) return;
    try {
      const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ListingWizardDraft;
      if (parsed?.address) setDraft({ ...EMPTY_WIZARD_DRAFT, ...parsed });
    } catch {
      /* ignore corrupt local draft */
    }
  }, [initialDraft]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore quota */
    }
  }, [draft]);

  const patch = useCallback((partial: Partial<ListingWizardDraft>) => {
    setDraft((d) => ({ ...d, ...partial }));
  }, []);

  async function persistDraft(next?: ListingWizardDraft) {
    const payload = next ?? draft;
    const res = await saveListingWizardDraft(payload);
    if ("error" in res) {
      setError(res.error ?? "Operazione non riuscita.");
      return null;
    }
    setError(null);
    setSaveHint("Bozza salvata");
    window.setTimeout(() => setSaveHint(null), 2000);
    const merged: ListingWizardDraft = {
      ...payload,
      propertyId: res.propertyId,
      roomId: res.roomId,
    };
    setDraft(merged);
    return merged;
  }

  async function loadPois(
    lat: number,
    lng: number,
    city: string,
    audience: TargetAudience,
  ) {
    setPoisLoading(true);
    try {
      const res = await fetch(
        `/api/mapbox/geocode?lat=${lat}&lng=${lng}&city=${encodeURIComponent(city)}&audience=${audience}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { pois?: NearbyPoi[] };
      patch({ nearbyPois: data.pois ?? [] });
    } finally {
      setPoisLoading(false);
    }
  }

  function onAddressSelect(place: GeocodedAddress) {
    patch({
      address: place.address,
      zone: place.zone,
      city: place.city,
      latitude: place.latitude,
      longitude: place.longitude,
    });
    void loadPois(
      place.latitude,
      place.longitude,
      place.city,
      draft.targetAudience,
    );
  }

  useEffect(() => {
    if (draft.latitude == null || draft.longitude == null || !draft.city) return;
    void loadPois(
      draft.latitude,
      draft.longitude,
      draft.city,
      draft.targetAudience,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload POIs when audience changes
  }, [draft.targetAudience]);

  function goBack() {
    setError(null);
    patch({ step: Math.max(1, draft.step - 1) });
  }

  async function goNext() {
    setError(null);
    if (draft.step === 1) {
      if (!draft.address || draft.latitude == null) {
        setError("Seleziona un indirizzo dall'elenco Mapbox.");
        return;
      }
    }
    if (draft.step === 2 && !draft.roomLabel.trim()) {
      setError("Indica un titolo per l'annuncio.");
      return;
    }
    if (draft.step === 3) {
      if (!draft.priceMonthly || draft.priceMonthly < 50) {
        setError("Inserisci un canone mensile valido (≥ 50€).");
        return;
      }
    }

    startTransition(async () => {
      const saved = await persistDraft(draft);
      if (!saved) return;
      const nextStep = Math.min(5, draft.step + 1);
      patch({ step: nextStep });
      if (nextStep === 5) {
        const est = await estimateListingDemand({
          city: draft.city,
          priceMonthly: draft.priceMonthly ?? 0,
          targetAudience: draft.targetAudience,
        });
        setDemand(est);
      }
    });
  }

  async function onGenerateDescription() {
    setGenerating(true);
    setError(null);
    const res = await generateListingDescription({
      city: draft.city,
      zone: draft.zone,
      propertyType: draft.propertyType,
      contractDurationType: draft.contractDurationType,
      targetAudience: draft.targetAudience,
      sizeSqm: draft.sizeSqm,
      floorNumber: draft.floorNumber,
      isFurnished: draft.isFurnished,
      servicesIncluded: draft.servicesIncluded,
      highlights: draft.highlights,
      priceMonthly: draft.priceMonthly,
    });
    setGenerating(false);
    if ("error" in res) {
      setError(res.error ?? "Operazione non riuscita.");
      return;
    }
    patch({ description: res.description });
  }

  function onPhotoChange(file: File | null) {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      let propertyId = draft.propertyId;
      if (!propertyId) {
        const saved = await persistDraft(draft);
        if (!saved) return;
        propertyId = saved.propertyId;
      }
      const fd = new FormData();
      fd.set("photo", file);
      const res = await uploadWizardPhoto(propertyId, fd);
      if ("error" in res) {
        setError(res.error ?? "Operazione non riuscita.");
        return;
      }
      patch({ photoUrl: res.url, propertyId });
    });
  }

  function finish(publish: boolean) {
    setError(null);
    startTransition(async () => {
      const res = await publishListingFromWizard(draft, publish);
      if ("error" in res) {
        setError(res.error ?? "Operazione non riuscita.");
        return;
      }
      try {
        localStorage.removeItem(LOCAL_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.push(`/owner/properties/${res.propertyId}`);
    });
  }

  const progressPct = (draft.step / WIZARD_STEPS.length) * 100;

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-display text-sm font-semibold text-ink">
            Passo {draft.step} di {WIZARD_STEPS.length}:{" "}
            {WIZARD_STEPS[draft.step - 1]?.label}
          </p>
          {saveHint && (
            <span className="text-[11px] font-medium text-sea-600">
              {saveHint}
            </span>
          )}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-sea-50">
          <div
            className="h-full rounded-full bg-sunset-500"
            style={{
              width: `${progressPct}%`,
              transition: `width 0.45s ${SETTLE}`,
            }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {WIZARD_STEPS.map((s) => (
            <span
              key={s.id}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                s.id === draft.step
                  ? "bg-sunset-500 text-white"
                  : s.id < draft.step
                    ? "bg-sea-100 text-sea-700"
                    : "bg-bg text-ink-muted"
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl2 bg-white p-5 shadow-card">
        {draft.step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Dove si trova?
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Digita l&apos;indirizzo: geocodifichiamo la posizione in
                qualsiasi città italiana (niente riferimenti fissi ad Ancona).
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Indirizzo *
              </label>
              <AddressAutocomplete
                value={draft.address}
                onChangeText={(t) => patch({ address: t })}
                onSelect={onAddressSelect}
              />
              {draft.city && (
                <p className="mt-1.5 text-[11px] text-ink-muted">
                  {draft.zone ? `${draft.zone}, ` : ""}
                  {draft.city}
                  {draft.latitude != null &&
                    ` · ${draft.latitude.toFixed(4)}, ${draft.longitude?.toFixed(4)}`}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Tipo alloggio *
                </label>
                <select
                  value={draft.propertyType}
                  onChange={(e) =>
                    patch({ propertyType: e.target.value as PropertyType })
                  }
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                >
                  <option value="stanza_singola">Stanza singola</option>
                  <option value="stanza_doppia">Stanza doppia</option>
                  <option value="appartamento_intero">
                    Appartamento intero
                  </option>
                  <option value="monolocale">Monolocale</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Durata contratto *
                </label>
                <select
                  value={draft.contractDurationType}
                  onChange={(e) =>
                    patch({
                      contractDurationType: e.target
                        .value as ListingWizardDraft["contractDurationType"],
                    })
                  }
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                >
                  <option value="anno_accademico">Anno accademico</option>
                  <option value="annuale">Annuale</option>
                  <option value="breve_periodo">Breve periodo</option>
                  <option value="flessibile">Flessibile</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Per chi è pensato?
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["studenti", "Studenti"],
                    ["lavoratori", "Lavoratori"],
                    ["entrambi", "Entrambi"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => patch({ targetAudience: value })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      draft.targetAudience === value
                        ? "bg-sea-600 text-white"
                        : "border border-sea-100 bg-white text-ink-muted hover:border-sea-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {(poisLoading || draft.nearbyPois.length > 0) && (
              <div className="rounded-xl border border-sea-50 bg-bg p-3">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
                  Punti di interesse vicino ({draft.city || "…"})
                </p>
                {poisLoading ? (
                  <p className="mt-1 text-xs text-ink-muted">Calcolo POI…</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {draft.nearbyPois.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-2 text-xs text-ink"
                      >
                        <span>
                          <span className="font-medium">{p.name}</span>
                          <span className="ml-1.5 text-ink-muted">
                            · {p.category}
                          </span>
                        </span>
                        <span className="shrink-0 text-ink-muted">
                          {formatPoiDistance(p.distanceM)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {draft.step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-ink">
              Dettagli e media
            </h2>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Titolo annuncio *
              </label>
              <input
                value={draft.roomLabel}
                onChange={(e) => patch({ roomLabel: e.target.value })}
                className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                placeholder={
                  wholeUnit
                    ? "es. Bilocale luminoso vicino alla stazione"
                    : "es. Singola arredata con balcone"
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Superficie mq
                </label>
                <input
                  type="number"
                  min={5}
                  value={draft.sizeSqm ?? ""}
                  onChange={(e) =>
                    patch({
                      sizeSqm: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Piano
                </label>
                <input
                  type="number"
                  value={draft.floorNumber ?? ""}
                  onChange={(e) =>
                    patch({
                      floorNumber: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                />
              </div>
              {!wholeUnit && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-muted">
                    Stanze in casa
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={draft.totalRooms}
                    onChange={(e) =>
                      patch({ totalRooms: Number(e.target.value) || 1 })
                    }
                    className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.isFurnished}
                  onChange={(e) => patch({ isFurnished: e.target.checked })}
                />{" "}
                Arredato
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.hasPrivateBathroom}
                  onChange={(e) =>
                    patch({ hasPrivateBathroom: e.target.checked })
                  }
                />{" "}
                Bagno privato
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.hasBalcony}
                  onChange={(e) => patch({ hasBalcony: e.target.checked })}
                />{" "}
                Balcone
              </label>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-ink-muted">Servizi</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {SERVICES.map((s) => {
                  const on = draft.servicesIncluded.includes(s);
                  return (
                    <label key={s} className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...draft.servicesIncluded, s]
                            : draft.servicesIncluded.filter((x) => x !== s);
                          patch({ servicesIncluded: next });
                        }}
                      />{" "}
                      {s}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Cosa rende speciale questo immobile? (facoltativo)
              </label>
              <input
                value={draft.highlights}
                onChange={(e) => patch({ highlights: e.target.value })}
                className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                placeholder="es. terrazzo, silenzio, vista mare…"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Foto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
                className="text-xs text-ink-muted"
              />
              {draft.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.photoUrl}
                  alt="Anteprima"
                  className="mt-2 h-32 w-full rounded-xl object-cover"
                />
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Link tour virtuale (facoltativo)
              </label>
              <input
                type="url"
                value={draft.virtualTourUrl}
                onChange={(e) => patch({ virtualTourUrl: e.target.value })}
                className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                placeholder="https://…"
              />
            </div>
          </div>
        )}

        {draft.step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-ink">
              Prezzo e disponibilità
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Canone €/mese *
                </label>
                <input
                  type="number"
                  min={50}
                  value={draft.priceMonthly ?? ""}
                  onChange={(e) =>
                    patch({
                      priceMonthly: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Utenze stimate €
                </label>
                <input
                  type="number"
                  min={0}
                  value={draft.estimatedUtilities}
                  onChange={(e) =>
                    patch({ estimatedUtilities: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Cauzione €
                </label>
                <input
                  type="number"
                  min={0}
                  value={draft.depositAmount ?? ""}
                  onChange={(e) =>
                    patch({
                      depositAmount: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Disponibile da
                </label>
                <input
                  type="date"
                  value={draft.availableFrom}
                  onChange={(e) => patch({ availableFrom: e.target.value })}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Disponibile fino a
                </label>
                <input
                  type="date"
                  value={draft.availableUntil}
                  onChange={(e) => patch({ availableUntil: e.target.value })}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {draft.step === 4 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Descrizione
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Vesta può proporti una bozza: resta sempre modificabile.
                </p>
              </div>
              <button
                type="button"
                disabled={generating}
                onClick={() => void onGenerateDescription()}
                className="rounded-full bg-sea-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {generating ? "Vesta sta scrivendo…" : "Genera con Vesta"}
              </button>
            </div>
            <textarea
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
              rows={8}
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm leading-relaxed"
              placeholder="Scrivi tu oppure genera una bozza con Vesta…"
            />
          </div>
        )}

        {draft.step === 5 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-ink">
              Anteprima pubblica
            </h2>
            <article className="overflow-hidden rounded-xl2 border border-sea-100">
              {draft.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.photoUrl}
                  alt=""
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-sea-50 text-sm text-ink-muted">
                  Nessuna foto
                </div>
              )}
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">
                      {draft.roomLabel || "Senza titolo"}
                    </h3>
                    <p className="text-sm text-ink-muted">
                      {draft.zone || draft.city}
                      {draft.city ? `, ${draft.city}` : ""}
                    </p>
                  </div>
                  <p className="font-display text-xl font-bold text-sea-700">
                    {draft.priceMonthly ?? "—"}€
                    <span className="text-sm font-normal text-ink-muted">
                      /mese
                    </span>
                  </p>
                </div>
                {draft.virtualTourUrl && (
                  <a
                    href={draft.virtualTourUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-sunset-500 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Tour virtuale disponibile
                  </a>
                )}
                <p className="text-sm leading-relaxed text-ink">
                  {draft.description || "Nessuna descrizione ancora."}
                </p>
                {draft.nearbyPois.length > 0 && (
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
                      Vicino a
                    </p>
                    <ul className="mt-1 space-y-0.5 text-xs text-ink-muted">
                      {draft.nearbyPois.slice(0, 4).map((p) => (
                        <li key={p.id}>
                          {p.name} · {formatPoiDistance(p.distanceM)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>

            {demand && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  demand.low
                    ? "border-sea-100 bg-sea-50 text-sea-800"
                    : "border-sunset-500/30 bg-sunset-500/10 text-ink"
                }`}
              >
                <p className="font-semibold">Domanda potenziale</p>
                <p className="mt-1 text-ink-muted">{demand.message}</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-sunset-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          {draft.step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="text-sm font-semibold text-sea-700 underline"
            >
              ← Indietro
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-2">
            {draft.step < 5 ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => void goNext()}
                className="rounded-full bg-sunset-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sunset-600 disabled:opacity-50"
                style={{ transitionTimingFunction: SETTLE }}
              >
                {pending ? "Salvataggio…" : "Continua"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => finish(false)}
                  className="rounded-full border border-sea-200 px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
                >
                  Salva bozza
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => finish(true)}
                  className="rounded-full bg-sunset-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {pending ? "Pubblicazione…" : "Pubblica su /stanze"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {csvImportSlot}
    </div>
  );
}
