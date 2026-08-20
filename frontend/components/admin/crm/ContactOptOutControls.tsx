"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CrmContact } from "@/lib/crm/types";
import { setContactOptOut } from "@/app/admin/crm/actions";

export default function ContactOptOutControls({
  contact,
}: {
  contact: CrmContact;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle(
    patch: Parameters<typeof setContactOptOut>[0],
  ) {
    startTransition(async () => {
      await setContactOptOut(patch);
      router.refresh();
    });
  }

  return (
    <div className="space-y-1.5 text-xs">
      <p className="font-semibold text-ink-muted">Consensi / stop</p>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          disabled={pending}
          checked={contact.do_not_contact}
          onChange={(e) =>
            toggle({ contactId: contact.id, doNotContact: e.target.checked })
          }
        />
        Non contattare
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          disabled={pending}
          checked={contact.email_opt_out}
          onChange={(e) =>
            toggle({ contactId: contact.id, emailOptOut: e.target.checked })
          }
        />
        Email opt-out
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          disabled={pending}
          checked={contact.whatsapp_opt_out}
          onChange={(e) =>
            toggle({ contactId: contact.id, whatsappOptOut: e.target.checked })
          }
        />
        WhatsApp opt-out
      </label>
    </div>
  );
}
