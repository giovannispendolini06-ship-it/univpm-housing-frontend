"use client";

import { useMemo, useState, useTransition } from "react";
import {
  WHATSAPP_TEMPLATE_VARS,
  buildWhatsAppMessage,
  type WhatsAppTemplateType,
} from "@/lib/whatsapp-templates";
import {
  resetWhatsAppTemplate,
  saveWhatsAppTemplate,
  type TemplateKey,
} from "@/app/admin/whatsapp/actions";

const KEYS: TemplateKey[] = [
  "OWNER_FIRST_CONTACT",
  "OWNER_FOLLOW_UP",
  "AGENCY_FIRST_CONTACT",
  "AGENCY_FOLLOW_UP",
  "STUDENT_FIRST_CONTACT",
  "STUDENT_FOLLOW_UP",
];

const LABELS: Partial<Record<TemplateKey, string>> = {
  OWNER_FIRST_CONTACT: "Proprietario — primo",
  OWNER_FOLLOW_UP: "Proprietario — follow-up",
  AGENCY_FIRST_CONTACT: "Agenzia — primo",
  AGENCY_FOLLOW_UP: "Agenzia — follow-up",
  STUDENT_FIRST_CONTACT: "Studente — primo",
  STUDENT_FOLLOW_UP: "Studente — follow-up",
};

export default function WhatsAppSettingsForm({
  initialTemplates,
}: {
  initialTemplates: Record<TemplateKey, string>;
}) {
  const [active, setActive] = useState<TemplateKey>("OWNER_FIRST_CONTACT");
  const [drafts, setDrafts] = useState(initialTemplates);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const preview = useMemo(() => {
    const kind = active.includes("AGENCY")
      ? "agency"
      : active.includes("STUDENT")
        ? "student"
        : "owner";
    return buildWhatsAppMessage(
      active as WhatsAppTemplateType,
      {
        contactType: kind,
        firstName: "Marco",
        lastName: "Rossi",
        city: "Ancona",
        propertyName: "Via Podesti 12",
        propertyLink: "https://coabito.it/stanza/esempio",
        agencyName: "Agenzia Adriatica",
        agentName: "Giovanni",
      },
      null,
      drafts,
    );
  }, [active, drafts]);

  function save() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await saveWhatsAppTemplate(active, drafts[active]);
      if (!res.ok) setError(res.error ?? "Errore salvataggio");
      else setMessage("Template salvato.");
    });
  }

  function reset() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await resetWhatsAppTemplate(active);
      if (!res.ok) {
        setError(res.error ?? "Errore reset");
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setActive(key);
              setMessage(null);
              setError(null);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active === key
                ? "bg-sea-600 text-white"
                : "bg-sea-50 text-sea-700 hover:bg-sea-100"
            }`}
          >
            {LABELS[key] ?? key}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-sea-100 bg-sea-50/60 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Variabili disponibili
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {WHATSAPP_TEMPLATE_VARS.map((v) => (
            <code
              key={v}
              className="rounded-md bg-white px-2 py-0.5 text-[11px] text-sea-700"
            >
              {`{{${v}}}`}
            </code>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          {LABELS[active] ?? active}
        </label>
        <textarea
          value={drafts[active] ?? ""}
          onChange={(e) =>
            setDrafts((d) => ({ ...d, [active]: e.target.value }))
          }
          rows={14}
          className="w-full rounded-xl border border-sea-100 bg-white px-3 py-2.5 text-sm leading-relaxed focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-ink-muted">Anteprima</p>
        <pre className="whitespace-pre-wrap rounded-xl border border-sea-100 bg-white px-3 py-3 text-sm leading-relaxed text-ink">
          {preview}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-full bg-sea-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700 disabled:opacity-50"
        >
          {pending ? "Salvataggio…" : "Salva template"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={reset}
          className="rounded-full bg-sea-50 px-4 py-2.5 text-sm font-semibold text-sea-700 transition hover:bg-sea-100 disabled:opacity-50"
        >
          Ripristina default
        </button>
      </div>

      {message && <p className="text-sm text-sea-700">{message}</p>}
      {error && <p className="text-sm text-sunset-600">{error}</p>}
    </div>
  );
}
