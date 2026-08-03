"use client";

import { useTransition } from "react";
import { deleteProperty } from "./actions";

export default function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      "Eliminare definitivamente questo immobile e tutte le sue stanze/foto? L'azione non si può annullare.",
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("property_id", propertyId);
    startTransition(() => {
      deleteProperty(formData);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-full border border-sunset-500/40 px-3.5 py-1.5 text-xs font-semibold text-sunset-600 transition hover:bg-sunset-500/10 disabled:opacity-50"
    >
      {isPending ? "Eliminazione..." : "Elimina immobile"}
    </button>
  );
}
