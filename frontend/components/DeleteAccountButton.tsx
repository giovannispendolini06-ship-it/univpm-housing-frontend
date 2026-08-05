"use client";

import { useTransition } from "react";
import { deleteOwnAccount } from "@/lib/account";

interface DeleteAccountLabels {
  buttonLabel: string;
  deletingLabel: string;
  warningStudent: string;
  warningOwner: string;
  confirmAgain: string;
}

const DEFAULT_LABELS_IT: DeleteAccountLabels = {
  buttonLabel: "Elimina il mio account",
  deletingLabel: "Eliminazione...",
  warningStudent:
    "Eliminare definitivamente il tuo account? Tutti i tuoi dati (chat con Vesta, profilo) verranno cancellati. L'azione non si può annullare.",
  warningOwner:
    "Eliminare definitivamente il tuo account? Verranno eliminati anche TUTTI i tuoi immobili e i relativi dati. L'azione non si può annullare.",
  confirmAgain: "Sei sicuro? Non potrai recuperare l'account dopo.",
};

export default function DeleteAccountButton({
  isOwner = false,
  className,
  labels,
}: {
  isOwner?: boolean;
  className?: string;
  labels?: DeleteAccountLabels;
}) {
  const [isPending, startTransition] = useTransition();
  const l = labels ?? DEFAULT_LABELS_IT;

  function handleClick() {
    const warning = isOwner ? l.warningOwner : l.warningStudent;

    if (!window.confirm(warning)) return;
    if (!window.confirm(l.confirmAgain)) return;

    startTransition(async () => {
      const result = await deleteOwnAccount();
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
      {isPending ? l.deletingLabel : l.buttonLabel}
    </button>
  );
}
