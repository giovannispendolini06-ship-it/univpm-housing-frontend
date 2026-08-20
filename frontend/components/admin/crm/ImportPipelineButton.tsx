"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { importContactsFromLandlordLeads } from "@/app/admin/crm/actions";

export default function ImportPipelineButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await importContactsFromLandlordLeads();
            if (!res.ok) setMsg(res.error ?? "Import fallito");
            else {
              setMsg(`Importati ${res.imported ?? 0} contatti`);
              router.refresh();
            }
          });
        }}
        className="rounded-full bg-sunset-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sunset-600 disabled:opacity-50"
      >
        {pending ? "Import…" : "Importa da Pipeline"}
      </button>
      {msg && <p className="text-[11px] text-ink-muted">{msg}</p>}
    </div>
  );
}
