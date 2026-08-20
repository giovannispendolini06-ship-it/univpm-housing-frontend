"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CRM_PIPELINE_COLUMNS,
  CRM_PIPELINE_LABELS,
  CRM_STATUS_STYLES,
  displayContactName,
  type CrmContact,
  type CrmContactStatus,
} from "@/lib/crm/types";
import { updateCrmContactStatus } from "@/app/admin/crm/actions";
import Link from "next/link";

export default function CrmPipelineBoard({
  contacts,
}: {
  contacts: CrmContact[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function move(id: string, status: CrmContactStatus) {
    startTransition(async () => {
      await updateCrmContactStatus(id, status);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {pending && (
        <p className="text-xs text-ink-muted">Aggiornamento pipeline…</p>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {CRM_PIPELINE_COLUMNS.map((col) => {
          const items = contacts.filter((c) => c.status === col);
          return (
            <div
              key={col}
              className="w-64 shrink-0 rounded-xl2 bg-surface p-3 shadow-card"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/contact-id");
                if (id) move(id, col);
              }}
            >
              <h3 className="mb-2 text-xs font-bold text-ink">
                {CRM_PIPELINE_LABELS[col]}{" "}
                <span className="font-normal text-ink-muted">({items.length})</span>
              </h3>
              <div className="space-y-2">
                {items.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/contact-id", c.id)
                    }
                    className="cursor-grab rounded-xl border border-sea-100 bg-bg p-3 active:cursor-grabbing"
                  >
                    <Link
                      href={`/admin/crm/contacts/${c.id}`}
                      className="font-semibold text-sm text-ink underline-offset-2 hover:underline"
                    >
                      {displayContactName(c)}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      {c.city || "—"} · {c.property_count} imm.
                    </p>
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${CRM_STATUS_STYLES[c.status]}`}
                    >
                      {c.contact_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
