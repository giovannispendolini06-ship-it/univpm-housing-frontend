"use client";

export default function WhatsAppMessagePreview({
  value,
  onChange,
  id = "wa-message",
}: {
  value: string;
  onChange: (next: string) => void;
  id?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-ink-muted"
      >
        Messaggio
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="min-h-[200px] w-full resize-y rounded-xl border border-sea-100 bg-white px-3 py-2.5 text-sm leading-relaxed text-ink focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-400/30"
      />
      <p className="mt-1 text-[11px] text-ink-muted">
        Puoi modificare il testo prima di aprire WhatsApp. L&apos;invio resta
        manuale.
      </p>
    </div>
  );
}
