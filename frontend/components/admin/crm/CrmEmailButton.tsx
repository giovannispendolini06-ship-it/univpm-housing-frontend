"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CrmContact } from "@/lib/crm/types";
import { displayContactName } from "@/lib/crm/types";
import {
  CRM_EMAIL_TEMPLATE_KEYS,
  DEFAULT_CRM_EMAIL_TEMPLATES,
  buildCrmEmail,
  type CrmEmailTemplateKey,
} from "@/lib/crm/email-templates";
import { sendCrmEmail } from "@/app/admin/crm/actions";
import { SITE_URL } from "@/lib/site";
import { X } from "lucide-react";

export default function CrmEmailButton({
  contact,
  compact = false,
}: {
  contact: CrmContact;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<CrmEmailTemplateKey>(() => {
    if (contact.contact_type === "AGENCY") return "AGENCY_FIRST_EMAIL";
    if (contact.contact_type === "STUDENT") return "STUDENT_EMAIL";
    return "OWNER_FIRST_EMAIL";
  });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const disabled = !contact.email?.trim() || contact.email_opt_out || contact.do_not_contact;
  const disabledTitle = contact.do_not_contact
    ? "Il contatto ha richiesto di non essere contattato."
    : contact.email_opt_out
      ? "Opt-out email attivo."
      : "Email non disponibile";

  function openModal() {
    const built = buildCrmEmail(template, {
      firstName: contact.first_name,
      lastName: contact.last_name,
      city: contact.city,
      agencyName: contact.agency_name,
      coabitoLink: SITE_URL,
    });
    setSubject(built.subject);
    setBody(built.body);
    setError(null);
    setOpen(true);
  }

  function onTemplateChange(next: CrmEmailTemplateKey) {
    setTemplate(next);
    const built = buildCrmEmail(next, {
      firstName: contact.first_name,
      lastName: contact.last_name,
      city: contact.city,
      agencyName: contact.agency_name,
      coabitoLink: SITE_URL,
    });
    setSubject(built.subject);
    setBody(built.body);
  }

  function send() {
    startTransition(async () => {
      const res = await sendCrmEmail({
        contactId: contact.id,
        templateKey: template,
        subject,
        body,
      });
      if (!res.ok) {
        setError(res.error ?? "Invio non riuscito.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        title={disabled ? disabledTitle : "Invia email"}
        onClick={openModal}
        className={
          compact
            ? "rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-semibold text-sea-700 disabled:cursor-not-allowed disabled:opacity-45"
            : "inline-flex min-h-10 items-center rounded-full bg-sea-600 px-3.5 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
        }
      >
        Email
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="dialog"
          aria-modal
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-sea-100 px-4 py-3">
              <div>
                <h2 className="font-display text-base font-bold text-ink">
                  Invia email
                </h2>
                <p className="text-sm text-ink-muted">
                  {displayContactName(contact)} · {contact.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-sea-50"
                aria-label="Chiudi"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto px-4 py-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Template
                </label>
                <select
                  value={template}
                  onChange={(e) =>
                    onTemplateChange(e.target.value as CrmEmailTemplateKey)
                  }
                  className="w-full rounded-xl border border-sea-100 px-3 py-2.5 text-sm"
                >
                  {CRM_EMAIL_TEMPLATE_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {DEFAULT_CRM_EMAIL_TEMPLATES[k].subject.slice(0, 48)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Oggetto
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Messaggio
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="w-full rounded-xl border border-sea-100 px-3 py-2.5 text-sm leading-relaxed"
                />
              </div>
              {error && <p className="text-sm text-sunset-600">{error}</p>}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-sea-100 px-4 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold text-ink-muted hover:bg-sea-50"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={pending || !subject.trim() || !body.trim()}
                onClick={send}
                className="min-h-11 rounded-full bg-sea-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sea-700 disabled:opacity-50"
              >
                {pending ? "Invio…" : "Invia email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
