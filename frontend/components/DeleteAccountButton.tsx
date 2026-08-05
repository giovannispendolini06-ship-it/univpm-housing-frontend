"use client";

import { useTransition } from "react";
import { deleteOwnAccount } from "@/lib/account";

export interface DeleteAccountLabels {
  deleteAccount: string;
  deletingAccount: string;
  deleteAccountWarningStudent: string;
  deleteAccountWarningOwner: string;
  deleteAccountConfirm: string;
}

const DEFAULT_LABELS_IT: DeleteAccountLabels = {
  deleteAccount: "Elimina il mio account",
  deletingAccount: "Eliminazione...",
  deleteAccountWarningStudent:
    "Eliminare definitivamente il tuo account? Tutti i tuoi dati (chat con Vesta, profilo) verranno cancellati. L'azione non si può annullare.",
  deleteAccountWarningOwner:
    "Eliminare definitivamente il tuo account? Verranno eliminati anche TUTTI i tuoi immobili e i relativi dati. L'azione non si può annullare.",
  deleteAccountConfirm: "Sei sicuro? Non potrai recuperare l'account dopo.",
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
    const warning = isOwner ? l.deleteAccountWarningOwner : l.deleteAccountWarningStudent;

    if (!window.confirm(warning)) return;
    if (!window.confirm(l.deleteAccountConfirm)) return;

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
      {isPending ? l.deletingAccount : l.deleteAccount}
    </button>
  );
}
