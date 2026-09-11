"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { GeocodedAddress } from "@/lib/mapbox-geocoding";

type Props = {
  value: string;
  onSelect: (place: GeocodedAddress) => void;
  onChangeText: (text: string) => void;
  disabled?: boolean;
};

/**
 * Mapbox address autocomplete — no Ancona hardcoding; results follow the query city.
 */
export default function AddressAutocomplete({
  value,
  onSelect,
  onChangeText,
  disabled,
}: Props) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<GeocodedAddress[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/mapbox/geocode?q=${encodeURIComponent(value.trim())}`,
          { signal: ctrl.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions?: GeocodedAddress[] };
        setSuggestions(data.suggestions ?? []);
        setOpen(true);
      } catch {
        /* aborted or network */
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        onChange={(e) => onChangeText(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => {
          // Delay so click on suggestion registers
          setTimeout(() => setOpen(false), 150);
        }}
        className="w-full rounded-xl border border-sea-100 px-3 py-2.5 text-sm text-ink focus:border-sea-400 focus:outline-none"
        placeholder="Inizia a digitare l'indirizzo (qualsiasi città italiana)…"
      />
      {loading && (
        <p className="mt-1 text-[11px] text-ink-muted">Ricerca indirizzi…</p>
      )}
      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-sea-100 bg-white py-1 shadow-card"
        >
          {suggestions.map((s) => (
            <li key={s.id} role="option">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-sea-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(s);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{s.address}</span>
                <span className="mt-0.5 block text-[11px] text-ink-muted">
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
