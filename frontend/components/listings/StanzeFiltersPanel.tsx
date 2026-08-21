"use client";

import type { StanzeFilterState } from "@/lib/listings-filters";
import { MIN_PRICE_SLIDER, MAX_PRICE_SLIDER } from "@/lib/listings-filters";
import { useLocale } from "@/lib/i18n/LocaleContext";
import styles from "./StanzeFilters.module.css";

type Props = {
  filters: StanzeFilterState;
  onChange: (next: StanzeFilterState) => void;
  onReset: () => void;
  onCollapse?: () => void;
  zones: string[];
  resultCount: number;
  /** Desktop sticky sidebar vs mobile overlay sheet */
  variant: "sidebar" | "sheet";
  className?: string;
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition ${
        active
          ? "border-sea-600 bg-sea-600 text-white"
          : "border-sea-100 bg-white text-ink-muted hover:border-sea-600"
      }`}
    >
      {children}
    </button>
  );
}

function ChipGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 border-b border-sea-50 pb-3.5 last:mb-0 last:border-0 last:pb-0">
      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 flex cursor-pointer items-center gap-2 text-[11.5px] text-ink last:mb-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 shrink-0 rounded border-sea-200 accent-sea-600"
      />
      {children}
    </label>
  );
}

function zoneLabel(
  slug: string,
  F: ReturnType<typeof useLocale>["t"]["listingsFilters"],
): string {
  switch (slug) {
    case "torrette":
      return F.zoneTorrette;
    case "centro":
      return F.zoneCentro;
    case "palombina":
      return F.zonePalombina;
    case "tavernelle":
      return F.zoneTavernelle;
    default:
      return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export default function StanzeFiltersPanel({
  filters,
  onChange,
  onReset,
  onCollapse,
  zones,
  resultCount,
  variant,
  className = "",
}: Props) {
  const { t } = useLocale();
  const F = t.listingsFilters;

  function setChip(
    key: keyof Omit<StanzeFilterState, "maxPrice" | "features">,
    value: string,
  ) {
    onChange({ ...filters, [key]: value });
  }

  function toggleFeature(id: string, on: boolean) {
    const next = on
      ? Array.from(new Set([...filters.features, id]))
      : filters.features.filter((f) => f !== id);
    onChange({ ...filters, features: next });
  }

  const featureOn = (id: string) => filters.features.includes(id);

  return (
    <div
      className={`${styles.panelSettle} ${className} rounded-xl2 border border-sea-100 bg-white p-4 shadow-card ${
        variant === "sidebar" ? "sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto" : ""
      }`}
    >
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-bold text-ink">{F.title}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="text-[10.5px] font-bold text-sunset-500 hover:text-sunset-600"
          >
            {F.reset}
          </button>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              aria-label={F.collapseAria}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg text-ink-muted hover:text-ink"
            >
              <span aria-hidden className="text-sm leading-none">
                ‹
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-3.5 border-b border-sea-50 pb-3.5">
        <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
          {F.budget}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-ink-muted">
          <span>€{MIN_PRICE_SLIDER}</span>
          <input
            type="range"
            min={MIN_PRICE_SLIDER}
            max={MAX_PRICE_SLIDER}
            step={10}
            value={filters.maxPrice}
            onChange={(e) =>
              onChange({ ...filters, maxPrice: Number(e.target.value) })
            }
            className="w-full accent-sea-600"
            aria-label={F.budget}
          />
          <span className="min-w-[2.75rem] text-right text-[12.5px] font-bold text-ink">
            €{filters.maxPrice}
          </span>
        </div>
      </div>

      <ChipGroup label={F.zone}>
        <Chip active={filters.zona === "all"} onClick={() => setChip("zona", "all")}>
          {F.all}
        </Chip>
        {zones.map((z) => (
          <Chip
            key={z}
            active={filters.zona === z}
            onClick={() => setChip("zona", z)}
          >
            {zoneLabel(z, F)}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label={F.roomType}>
        {(
          [
            ["all", F.all],
            ["singola", F.typeSingola],
            ["doppia", F.typeDoppia],
            ["dus", F.typeDus],
          ] as const
        ).map(([v, label]) => (
          <Chip key={v} active={filters.tipo === v} onClick={() => setChip("tipo", v)}>
            {label}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label={F.size}>
        {(
          [
            ["all", F.any],
            ["s", F.sizeS],
            ["m", F.sizeM],
            ["l", F.sizeL],
          ] as const
        ).map(([v, label]) => (
          <Chip key={v} active={filters.mq === v} onClick={() => setChip("mq", v)}>
            {label}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label={F.availability}>
        {(
          [
            ["all", F.any],
            ["subito", F.availNow],
            ["settembre", F.availSept],
          ] as const
        ).map(([v, label]) => (
          <Chip key={v} active={filters.data === v} onClick={() => setChip("data", v)}>
            {label}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label={F.contract}>
        {(
          [
            ["all", F.any],
            ["6", F.months6],
            ["12", F.months12],
          ] as const
        ).map(([v, label]) => (
          <Chip
            key={v}
            active={filters.durata === v}
            onClick={() => setChip("durata", v)}
          >
            {label}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label={F.flatmates}>
        {(
          [
            ["all", F.any],
            ["1", "1"],
            ["2", "2"],
            ["3", F.flatmates3plus],
          ] as const
        ).map(([v, label]) => (
          <Chip
            key={v}
            active={filters.coinq === v}
            onClick={() => setChip("coinq", v)}
          >
            {label}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label={F.heating}>
        {(
          [
            ["all", F.any],
            ["autonomo", F.heatAutonomous],
            ["centralizzato", F.heatCentral],
          ] as const
        ).map(([v, label]) => (
          <Chip key={v} active={filters.risc === v} onClick={() => setChip("risc", v)}>
            {label}
          </Chip>
        ))}
      </ChipGroup>

      <div className="mb-3.5 border-b border-sea-50 pb-3.5">
        <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
          {F.features}
        </p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          {(
            [
              ["bagno", F.featBathroom],
              ["arredata", F.featFurnished],
              ["lavatrice", F.featWasher],
              ["wifi", F.featWifi],
              ["balcone", F.featBalcony],
              ["ascensore", F.featElevator],
              ["aria", F.featAc],
              ["spese", F.featBills],
            ] as const
          ).map(([id, label]) => (
            <CheckRow
              key={id}
              checked={featureOn(id)}
              onChange={(on) => toggleFeature(id, on)}
            >
              {label}
            </CheckRow>
          ))}
        </div>
      </div>

      <div className="mb-3.5 border-b border-sea-50 pb-3.5">
        <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
          {F.rules}
        </p>
        <CheckRow
          checked={featureOn("animali")}
          onChange={(on) => toggleFeature("animali", on)}
        >
          {F.rulePets}
        </CheckRow>
        <CheckRow
          checked={featureOn("fumatori")}
          onChange={(on) => toggleFeature("fumatori", on)}
        >
          {F.ruleSmoking}
        </CheckRow>
      </div>

      <div className="mb-3">
        <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
          {F.trust}
        </p>
        <CheckRow
          checked={featureOn("garantito")}
          onChange={(on) => toggleFeature("garantito", on)}
        >
          {F.trustGuaranteed}
        </CheckRow>
        <CheckRow
          checked={featureOn("verificato")}
          onChange={(on) => toggleFeature("verificato", on)}
        >
          {F.trustVerified}
        </CheckRow>
      </div>

      <p className="text-[11px] text-ink-muted">
        {resultCount === 1
          ? F.resultCountOne
          : F.resultCount.replace("{n}", String(resultCount))}
      </p>
    </div>
  );
}
