"use client";

import { useTransition } from "react";
import { deleteOwnAccount } from "@/lib/account";

export default function DeleteAccountButton({
  isOwner = false,
  className,
}: {
  isOwner?: boolean;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const warning = isOwner
      ? "Eliminare definitivamente il tuo account? Verranno eliminati anche TUTTI i tuoi immobili e i relativi dati. L'azione non si può annullare."
      : "Eliminare definitivamente il tuo account? Tutti i tuoi dati (chat con Vesta, profilo) verranno cancellati. L'azione non si può annullare.";

    if (!window.confirm(warning)) return;
    if (!window.confirm("Sei sicuro? Non potrai recuperare l'account dopo.")) return;

    startTransition(async () => {
      const result = await deleteOwnAccount();
      // Se non c'è errore, deleteOwnAccount ha già fatto redirect da sola.
      if (result?.error) alert(result.error);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={
        className ??
        "text-[11px] text-ink-muted underline underline-offset-2 transition hover:text-sunset-600"
      }
    >
      {isPending ? "Eliminazione..." : "Elimina il mio account"}
    </button>
  );
}
