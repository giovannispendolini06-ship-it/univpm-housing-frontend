"use client";

import { useState, useTransition } from "react";
import { createPartnerLink } from "@/app/admin/crm/actions";

export default function PartnerLinkButton({ contactId }: { contactId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await createPartnerLink(contactId);
            if (!res.ok || !res.url) setError(res.error ?? "Errore");
            else {
              setUrl(res.url);
              try {
                await navigator.clipboard.writeText(res.url);
              } catch {
                /* ignore */
              }
            }
          });
        }}
        className="w-full rounded-full bg-sea-50 px-3 py-2 text-xs font-semibold text-sea-700"
      >
        {pending ? "…" : "Copia link partner"}
      </button>
      {url && (
        <p className="mt-1 break-all text-[11px] text-ink-muted">{url}</p>
      )}
      {error && <p className="mt-1 text-[11px] text-sunset-600">{error}</p>}
    </div>
  );
}
