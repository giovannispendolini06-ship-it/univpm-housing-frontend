"use client";

import { useTransition } from "react";
import { createTenancy, endTenancy } from "./actions";

interface ActiveTenancy {
  id: string;
  started_at: string;
  tenantName: string;
}

export default function RoomTenancyControl({
  roomId,
  propertyId,
  tenancy,
}: {
  roomId: string;
  propertyId: string;
  tenancy: ActiveTenancy | null;
}) {
  const [isPending, startTransition] = useTransition();

  // --- Stanza già affittata: mostra chi e da quando, con tasto per terminare
  if (tenancy) {
    function handleEnd() {
      const confirmed = window.confirm(
        `Segnare come terminato l'affitto di ${tenancy!.tenantName}? La stanza tornerà disponibile.`,
      );
      if (!confirmed) return;

      const formData = new FormData();
      formData.set("tenancy_id", tenancy!.id);
      formData.set("room_id", roomId);
      formData.set("property_id", propertyId);

      startTransition(async () => {
        try {
          await endTenancy(formData);
        } catch (err) {
          alert(err instanceof Error ? err.message : "Errore nel terminare l'affitto.");
        }
      });
    }

    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-sea-50 px-3 py-2 text-xs">
        <span className="text-sea-700">
          🏠 Affittata a <strong>{tenancy.tenantName}</strong> dal{" "}
          {new Date(tenancy.started_at).toLocaleDateString("it-IT")}
        </span>
        <button
          onClick={handleEnd}
          disabled={isPending}
          className="rounded-full border border-sunset-500/40 px-2.5 py-1 text-[11px] font-semibold text-sunset-600 transition hover:bg-sunset-500/10 disabled:opacity-50"
        >
          {isPending ? "..." : "Termina affitto"}
        </button>
      </div>
    );
  }

  // --- Stanza libera: form per registrare chi la prende in affitto
  function handleRegister(formData: FormData) {
    startTransition(async () => {
      try {
        await createTenancy(formData);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Errore nella registrazione dell'affitto.");
      }
    });
  }

  return (
    <form action={handleRegister} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="room_id" value={roomId} />
      <input type="hidden" name="property_id" value={propertyId} />
      <input
        type="email"
        name="student_email"
        required
        placeholder="Email dello studente che l'ha presa"
        className="min-w-[200px] flex-1 rounded-lg border border-sea-100 px-2.5 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-sea-600 px-3 py-1.5 text-[11px] font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
      >
        {isPending ? "..." : "Registra affitto"}
      </button>
    </form>
  );
}
