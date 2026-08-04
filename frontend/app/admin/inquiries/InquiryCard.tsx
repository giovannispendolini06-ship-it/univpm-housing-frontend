"use client";

import { useState, useTransition } from "react";
import { updateInquiry, deleteInquiry, updateInquiryStatus } from "./actions";
import SubmitButton from "@/components/SubmitButton";
import { Phone, Mail, MapPin, Pencil, Trash2 } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  nuovo: "Nuovo",
  contattato: "Contattato",
  convertito: "Convertito",
  scartato: "Scartato",
};

const STATUS_STYLES: Record<string, string> = {
  nuovo: "bg-sea-50 text-sea-700",
  contattato: "bg-sand-400/15 text-ink",
  convertito: "bg-sea-600 text-white",
  scartato: "bg-ink-muted/10 text-ink-muted",
};

interface Inquiry {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  property_address: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export default function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Eliminare la richiesta di ${inquiry.full_name}? Non si può annullare.`))
      return;

    const formData = new FormData();
    formData.set("inquiry_id", inquiry.id);
    startTransition(async () => {
      try {
        await deleteInquiry(formData);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Errore nell'eliminazione.");
      }
    });
  }

  if (isEditing) {
    return (
      <article className="rounded-xl2 bg-surface p-4 shadow-card sm:p-5">
        <form
          action={async (formData) => {
            try {
              await updateInquiry(formData);
              setIsEditing(false);
            } catch (err) {
              alert(err instanceof Error ? err.message : "Errore nel salvataggio.");
            }
          }}
          className="space-y-2.5"
        >
          <input type="hidden" name="inquiry_id" value={inquiry.id} />
          <input
            type="text"
            name="full_name"
            defaultValue={inquiry.full_name}
            required
            placeholder="Nome e cognome"
            className="w-full rounded-lg border border-sea-100 px-2.5 py-1.5 text-sm focus:border-sea-400 focus:outline-none"
          />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <input
              type="tel"
              name="phone"
              defaultValue={inquiry.phone}
              required
              placeholder="Telefono"
              className="rounded-lg border border-sea-100 px-2.5 py-1.5 text-sm focus:border-sea-400 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              defaultValue={inquiry.email ?? ""}
              placeholder="Email"
              className="rounded-lg border border-sea-100 px-2.5 py-1.5 text-sm focus:border-sea-400 focus:outline-none"
            />
          </div>
          <input
            type="text"
            name="property_address"
            defaultValue={inquiry.property_address ?? ""}
            placeholder="Indirizzo immobile"
            className="w-full rounded-lg border border-sea-100 px-2.5 py-1.5 text-sm focus:border-sea-400 focus:outline-none"
          />
          <textarea
            name="message"
            defaultValue={inquiry.message ?? ""}
            rows={2}
            placeholder="Messaggio"
            className="w-full rounded-lg border border-sea-100 px-2.5 py-1.5 text-sm focus:border-sea-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <SubmitButton className="rounded-full bg-sea-600 px-3.5 py-1.5 text-xs font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50">
              Salva
            </SubmitButton>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-full border border-sea-100 px-3.5 py-1.5 text-xs text-ink-muted"
            >
              Annulla
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="animate-fade-in-up rounded-xl2 bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[inquiry.status] ?? ""}`}
          >
            {STATUS_LABELS[inquiry.status] ?? inquiry.status}
          </span>
          <h3 className="mt-1.5 font-display text-sm font-bold text-ink">{inquiry.full_name}</h3>
          <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-ink-muted">
            <Phone size={13} className="shrink-0 text-sea-500" />
            <a href={`tel:${inquiry.phone}`} className="underline">
              {inquiry.phone}
            </a>
            {inquiry.email ? (
              <>
                <span>·</span>
                <Mail size={13} className="shrink-0 text-sea-500" />
                <a href={`mailto:${inquiry.email}`} className="underline">
                  {inquiry.email}
                </a>
              </>
            ) : (
              ""
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            aria-label="Modifica"
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition hover:bg-sea-50 hover:text-sea-700"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Elimina"
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition hover:bg-sunset-500/10 hover:text-sunset-600 disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
          <span className="ml-1 shrink-0 text-[11px] text-ink-muted">
            {new Date(inquiry.created_at).toLocaleDateString("it-IT")}
          </span>
        </div>
      </div>

      {inquiry.property_address && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink">
          <MapPin size={15} className="shrink-0 text-sea-600" />
          {inquiry.property_address}
        </p>
      )}

      {inquiry.message && (
        <p className="mt-2 rounded-lg bg-bg p-3 text-sm text-ink-muted">{inquiry.message}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-bg pt-3">
        <a
          href={`/admin/properties/new?address=${encodeURIComponent(inquiry.property_address ?? "")}&owner_name=${encodeURIComponent(inquiry.full_name)}&owner_phone=${encodeURIComponent(inquiry.phone)}&owner_email=${encodeURIComponent(inquiry.email ?? "")}`}
          className="rounded-full bg-sea-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-sea-700"
        >
          Trasforma in immobile →
        </a>

        <form action={updateInquiryStatus} className="flex items-center gap-2">
          <input type="hidden" name="inquiry_id" value={inquiry.id} />
          <select
            name="status"
            defaultValue={inquiry.status}
            className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <SubmitButton className="rounded-full border border-sea-200 px-3 py-1.5 text-xs font-semibold text-ink transition enabled:hover:border-sea-400 disabled:opacity-50">
            Aggiorna stato
          </SubmitButton>
        </form>
      </div>
    </article>
  );
}
