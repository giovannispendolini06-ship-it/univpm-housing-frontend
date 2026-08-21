"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toggleWaitlistContattato, updateWaitlistNotes } from "./actions";
import WhatsAppButton from "@/components/admin/whatsapp/WhatsAppButton";
import { splitFullName } from "@/lib/whatsapp-templates";
import { SITE_URL } from "@/lib/site";

export interface WaitlistSignup {
  id: string;
  created_at: string;
  nome: string;
  email: string | null;
  phone: string | null;
  facolta: string | null;
  polo: string | null;
  budget: number | null;
  source: string;
  contattato: boolean;
  note: string | null;
  study_habit: string | null;
  sociability_level: number | null;
  guests_frequency: string | null;
  cleanliness_level: number | null;
  user_id: string | null;
  confirmed_at: string | null;
  confirmation_expires_at: string | null;
}

type ConfirmFilter = "" | "confirmed" | "pending" | "expired";

function confirmStatus(row: WaitlistSignup): "confirmed" | "pending" | "expired" {
  if (row.confirmed_at) return "confirmed";
  if (
    row.confirmation_expires_at &&
    new Date(row.confirmation_expires_at).getTime() < Date.now()
  ) {
    return "expired";
  }
  return "pending";
}

const POLO_LABELS: Record<string, string> = {
  monte_dago: "Monte Dago / Tavernelle",
  torrette: "Torrette",
  centro_economia_giurisprudenza: "Centro / Villarey",
  altro: "Altro",
};

function formatContact(row: WaitlistSignup): string {
  const parts: string[] = [];
  if (row.email) parts.push(row.email);
  if (row.phone) parts.push(row.phone);
  return parts.join(" · ") || "—";
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function WaitlistTable({ signups }: { signups: WaitlistSignup[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sourceFilter = searchParams.get("source") ?? "";
  const poloFilter = searchParams.get("polo") ?? "";
  const contattatoFilter = searchParams.get("contattato") ?? "";
  const confirmFilter = (searchParams.get("confirm") ?? "") as ConfirmFilter;

  const sources = useMemo(
    () => Array.from(new Set(signups.map((s) => s.source))).sort(),
    [signups],
  );

  const filtered = useMemo(() => {
    return signups.filter((s) => {
      if (sourceFilter && s.source !== sourceFilter) return false;
      if (poloFilter && (s.polo ?? "") !== poloFilter) return false;
      if (contattatoFilter === "true" && !s.contattato) return false;
      if (contattatoFilter === "false" && s.contattato) return false;
      if (confirmFilter && confirmStatus(s) !== confirmFilter) return false;
      return true;
    });
  }, [signups, sourceFilter, poloFilter, contattatoFilter, confirmFilter]);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/waitlist?${params.toString()}`);
  }

  function handleToggleContattato(id: string, current: boolean) {
    startTransition(async () => {
      try {
        await toggleWaitlistContattato(id, !current);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Errore.");
      }
    });
  }

  function handleSaveNotes(id: string, notes: string) {
    startTransition(async () => {
      try {
        await updateWaitlistNotes(id, notes);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Errore.");
      }
    });
  }

  function exportCsv() {
    const header = [
      "nome",
      "email",
      "phone",
      "facolta",
      "polo",
      "budget",
      "source",
      "confermato",
      "confirmed_at",
      "contattato",
      "created_at",
      "note",
    ];
    const rows = filtered.map((s) =>
      [
        s.nome,
        s.email ?? "",
        s.phone ?? "",
        s.facolta ?? "",
        s.polo ?? "",
        s.budget?.toString() ?? "",
        s.source,
        confirmStatus(s),
        s.confirmed_at ?? "",
        s.contattato ? "sì" : "no",
        s.created_at,
        s.note ?? "",
      ]
        .map(escapeCsv)
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Fonte</label>
          <select
            value={sourceFilter}
            onChange={(e) => setFilter("source", e.target.value)}
            className="rounded-lg border border-sea-100 px-2 py-1.5 text-sm"
          >
            <option value="">Tutte</option>
            {sources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Polo</label>
          <select
            value={poloFilter}
            onChange={(e) => setFilter("polo", e.target.value)}
            className="rounded-lg border border-sea-100 px-2 py-1.5 text-sm"
          >
            <option value="">Tutti</option>
            {Object.entries(POLO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Contattato</label>
          <select
            value={contattatoFilter}
            onChange={(e) => setFilter("contattato", e.target.value)}
            className="rounded-lg border border-sea-100 px-2 py-1.5 text-sm"
          >
            <option value="">Tutti</option>
            <option value="false">Da contattare</option>
            <option value="true">Già contattati</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Conferma email</label>
          <select
            value={confirmFilter}
            onChange={(e) => setFilter("confirm", e.target.value)}
            className="rounded-lg border border-sea-100 px-2 py-1.5 text-sm"
          >
            <option value="">Tutti</option>
            <option value="confirmed">Confermati</option>
            <option value="pending">In attesa</option>
            <option value="expired">Link scaduto</option>
          </select>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-full border border-sea-200 bg-white px-4 py-1.5 text-xs font-semibold text-sea-700 transition hover:bg-sea-50"
        >
          Esporta CSV
        </button>
      </div>

      <p className="text-xs text-ink-muted">
        {filtered.length} di {signups.length} iscrizioni
        {isPending && " · Salvataggio..."}
      </p>

      <div className="overflow-x-auto rounded-xl2 bg-surface shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-sea-100 text-xs text-ink-muted">
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">Contatto</th>
              <th className="px-3 py-2 font-medium">Facoltà</th>
              <th className="px-3 py-2 font-medium">Polo</th>
              <th className="px-3 py-2 font-medium">Budget</th>
              <th className="px-3 py-2 font-medium">Fonte</th>
              <th className="px-3 py-2 font-medium">Conferma</th>
              <th className="px-3 py-2 font-medium">Data</th>
              <th className="px-3 py-2 font-medium">Contattato</th>
              <th className="px-3 py-2 font-medium">WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const status = confirmStatus(row);
              const { firstName, lastName } = splitFullName(row.nome);
              return (
              <Fragment key={row.id}>
                <tr
                  className="border-b border-sea-50 hover:bg-sea-50/50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                >
                  <td className="px-3 py-2.5 font-medium text-ink">{row.nome}</td>
                  <td className="px-3 py-2.5 text-xs text-ink-muted">{formatContact(row)}</td>
                  <td className="px-3 py-2.5 text-xs">{row.facolta ?? "—"}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {row.polo ? (POLO_LABELS[row.polo] ?? row.polo) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {row.budget != null ? `${row.budget}€` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs">{row.source}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        status === "confirmed"
                          ? "bg-sea-600 text-white"
                          : status === "pending"
                            ? "bg-sand-400/30 text-ink"
                            : "bg-sunset-500/15 text-sunset-600"
                      }`}
                    >
                      {status === "confirmed"
                        ? "OK"
                        : status === "pending"
                          ? "In attesa"
                          : "Scaduto"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-ink-muted">
                    {new Date(row.created_at).toLocaleDateString("it-IT")}
                  </td>
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleToggleContattato(row.id, row.contattato)}
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.contattato
                          ? "bg-sea-600 text-white"
                          : "bg-sand-400/20 text-ink"
                      }`}
                    >
                      {row.contattato ? "Sì" : "No"}
                    </button>
                  </td>
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <WhatsAppButton
                      phone={row.phone}
                      displayName={row.nome}
                      contactData={{
                        contactType: "student",
                        fullName: row.nome,
                        firstName,
                        lastName,
                        phone: row.phone,
                        city: "Ancona",
                        coabitoLink: SITE_URL,
                      }}
                      entityKind="waitlist"
                      entityId={row.id}
                      source="admin_waitlist"
                      variant="compact"
                      showMenu
                    />
                  </td>
                </tr>
                {expandedId === row.id && (
                  <tr className="border-b border-sea-50 bg-bg">
                    <td colSpan={10} className="px-3 py-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="text-xs text-ink-muted">
                          <p className="font-semibold text-ink">Abitudini (da Vesta)</p>
                          <ul className="mt-1 space-y-0.5">
                            <li>Studio: {row.study_habit ?? "—"}</li>
                            <li>Socievolezza: {row.sociability_level ?? "—"}/5</li>
                            <li>Ospiti: {row.guests_frequency ?? "—"}</li>
                            <li>Pulizia: {row.cleanliness_level ?? "—"}/5</li>
                          </ul>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-ink">
                            Note interne
                          </label>
                          <textarea
                            key={`notes-${row.id}-${row.note ?? ""}`}
                            defaultValue={row.note ?? ""}
                            rows={3}
                            className="w-full rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
                            onBlur={(e) => {
                              if (e.target.value !== (row.note ?? "")) {
                                handleSaveNotes(row.id, e.target.value);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-muted">Nessuna iscrizione trovata.</p>
        )}
      </div>
    </div>
  );
}
