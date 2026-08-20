"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollInDefaultSequence } from "@/app/admin/crm/actions";

export default function EnrollSequenceButton({
  contactId,
}: {
  contactId: string;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await enrollInDefaultSequence(contactId);
            setMsg(res.ok ? "Sequenza attivata" : res.error ?? "Errore");
            if (res.ok) router.refresh();
          });
        }}
        className="w-full rounded-full bg-sea-50 px-3 py-2 text-xs font-semibold text-sea-700"
      >
        {pending ? "…" : "Avvia sequenza outreach"}
      </button>
      {msg && <p className="mt-1 text-[11px] text-ink-muted">{msg}</p>}
    </div>
  );
}
