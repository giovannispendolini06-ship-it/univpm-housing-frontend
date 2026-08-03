"use client";

import { useState } from "react";
import { updateRoom } from "./actions";
import SubmitButton from "@/components/SubmitButton";

interface Room {
  id: string;
  room_label: string;
  price_monthly: number;
  estimated_utilities: number;
  size_sqm: number | null;
  has_private_bathroom: boolean;
  has_balcony: boolean;
  max_occupants: number;
  services_included: string[];
  is_available: boolean;
  available_from: string | null;
}

const SERVICE_OPTIONS = [
  "Wifi",
  "Lavatrice",
  "Riscaldamento centralizzato",
  "Posto auto",
  "Aria condizionata",
  "Terrazzo condiviso",
];

export default function EditRoomRow({
  room,
  propertyId,
}: {
  room: Room;
  propertyId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-sea-100 px-3 py-2">
        <div>
          <p className="text-sm text-ink">{room.room_label}</p>
          <p className="text-[11px] text-ink-muted">
            {room.price_monthly}€/mese · {room.is_available ? "libera" : "occupata"}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs font-medium text-sea-700 underline underline-offset-2"
        >
          Modifica
        </button>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        try {
          await updateRoom(formData);
          setIsEditing(false);
        } catch (err) {
          alert(err instanceof Error ? err.message : "Errore nel salvataggio.");
        }
      }}
      className="space-y-2 rounded-xl border border-sea-200 bg-bg p-3"
    >
      <input type="hidden" name="room_id" value={room.id} />
      <input type="hidden" name="property_id" value={propertyId} />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="text"
          name="room_label"
          defaultValue={room.room_label}
          required
          placeholder="Nome stanza"
          className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
        />
        <input
          type="number"
          name="price_monthly"
          defaultValue={room.price_monthly}
          required
          placeholder="Prezzo €"
          className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
        />
        <input
          type="number"
          name="estimated_utilities"
          defaultValue={room.estimated_utilities}
          placeholder="Spese €"
          className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
        />
        <input
          type="number"
          name="room_size_sqm"
          defaultValue={room.size_sqm ?? ""}
          placeholder="Mq"
          className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
        />
        <input
          type="number"
          name="max_occupants"
          defaultValue={room.max_occupants}
          placeholder="Max occupanti"
          className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
        />
        <input
          type="date"
          name="available_from"
          defaultValue={room.available_from ?? ""}
          className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-ink">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" name="is_available" defaultChecked={room.is_available} />
          Libera
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" name="has_private_bathroom" defaultChecked={room.has_private_bathroom} />
          Bagno privato
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" name="has_balcony" defaultChecked={room.has_balcony} />
          Balcone
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SERVICE_OPTIONS.map((service) => (
          <label
            key={service}
            className="flex items-center gap-1 rounded-full border border-sea-100 px-2 py-1 text-[11px] text-ink"
          >
            <input
              type="checkbox"
              name="services_included"
              value={service}
              defaultChecked={room.services_included?.includes(service)}
              className="h-3 w-3"
            />
            {service}
          </label>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <SubmitButton className="rounded-full bg-sea-600 px-3.5 py-1.5 text-xs font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50">
          Salva
        </SubmitButton>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="rounded-full border border-sea-100 px-3.5 py-1.5 text-xs text-ink-muted"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}
