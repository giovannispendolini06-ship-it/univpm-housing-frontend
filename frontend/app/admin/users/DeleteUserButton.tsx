"use client";

import { useTransition } from "react";
import { deleteUser } from "./actions";

export default function DeleteUserButton({
  userId,
  fullName,
  role,
}: {
  userId: string;
  fullName: string;
  role: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const warning =
      role === "owner"
        ? `Eliminare ${fullName}? ATTENZIONE: è un proprietario — verranno eliminati anche TUTTI i suoi immobili collegati. L'azione non si può annullare.`
        : `Eliminare definitivamente l'account di ${fullName}? L'azione non si può annullare.`;

    if (!window.confirm(warning)) return;

    const formData = new FormData();
    formData.set("user_id", userId);
    startTransition(() => {
      deleteUser(formData);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-full border border-sunset-500/40 px-4 py-2 text-xs font-semibold text-sunset-600 transition hover:bg-sunset-500/10 disabled:opacity-50"
    >
      {isPending ? "Eliminazione..." : "Elimina account"}
    </button>
  );
}
