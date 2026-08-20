"use client";

import {
  WHATSAPP_TEMPLATE_LABELS,
  type WhatsAppTemplateType,
} from "@/lib/whatsapp-templates";

const OPTIONS: Exclude<WhatsAppTemplateType, "CUSTOM">[] = [
  "OWNER_FIRST_CONTACT",
  "OWNER_FOLLOW_UP",
  "AGENCY_FIRST_CONTACT",
  "AGENCY_FOLLOW_UP",
  "STUDENT_FIRST_CONTACT",
  "STUDENT_FOLLOW_UP",
];

export default function ContactTemplateSelector({
  value,
  onChange,
  allowCustom = true,
  id = "wa-template",
}: {
  value: WhatsAppTemplateType;
  onChange: (next: WhatsAppTemplateType) => void;
  allowCustom?: boolean;
  id?: string;
}) {
  const normalized =
    value === "OWNER"
      ? "OWNER_FIRST_CONTACT"
      : value === "STUDENT"
        ? "STUDENT_FIRST_CONTACT"
        : value === "FOLLOW_UP_OWNER"
          ? "OWNER_FOLLOW_UP"
          : value === "FOLLOW_UP_STUDENT"
            ? "STUDENT_FOLLOW_UP"
            : value;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-ink-muted"
      >
        Template
      </label>
      <select
        id={id}
        value={normalized}
        onChange={(e) => onChange(e.target.value as WhatsAppTemplateType)}
        className="w-full rounded-xl border border-sea-100 bg-white px-3 py-2.5 text-sm focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-400/30"
      >
        {OPTIONS.map((key) => (
          <option key={key} value={key}>
            {WHATSAPP_TEMPLATE_LABELS[key]}
          </option>
        ))}
        {allowCustom && <option value="CUSTOM">Personalizzato</option>}
      </select>
    </div>
  );
}
