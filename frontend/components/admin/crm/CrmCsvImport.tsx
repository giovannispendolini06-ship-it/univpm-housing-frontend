"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertCrmContact } from "@/app/admin/crm/actions";
import type { CrmContactType } from "@/lib/crm/types";

type PreviewRow = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  agencyName?: string;
  website?: string;
  contactType: CrmContactType;
  error?: string;
};

function parseCsv(text: string): string[][] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  return lines.map((line) => {
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        cells.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  });
}

export default function CrmCsvImport({
  defaultType = "OWNER",
}: {
  defaultType?: CrmContactType;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function onFile(file: File) {
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const rows = parseCsv(text);
      if (rows.length < 2) {
        setPreview([]);
        setResult("CSV vuoto o senza header.");
        return;
      }
      const header = rows[0].map((h) => h.toLowerCase());
      const idx = (names: string[]) =>
        header.findIndex((h) => names.some((n) => h.includes(n)));

      const iFirst = idx(["firstname", "nome", "first_name"]);
      const iLast = idx(["lastname", "cognome", "last_name"]);
      const iFull = idx(["fullname", "full_name", "ragione"]);
      const iEmail = idx(["email", "mail"]);
      const iPhone = idx(["phone", "telefono", "whatsapp", "tel"]);
      const iCity = idx(["city", "città", "citta"]);
      const iAgency = idx(["agency", "agenzia"]);
      const iWeb = idx(["website", "sito", "url"]);
      const iType = idx(["type", "tipo"]);

      const mapped: PreviewRow[] = rows.slice(1).map((r) => {
        const typeRaw = (iType >= 0 ? r[iType] : "").toUpperCase();
        let contactType: CrmContactType = defaultType;
        if (typeRaw.includes("AGEN")) contactType = "AGENCY";
        else if (typeRaw.includes("STUD")) contactType = "STUDENT";
        else if (typeRaw.includes("OWN") || typeRaw.includes("PROP"))
          contactType = "OWNER";

        const row: PreviewRow = {
          firstName: iFirst >= 0 ? r[iFirst] : undefined,
          lastName: iLast >= 0 ? r[iLast] : undefined,
          fullName: iFull >= 0 ? r[iFull] : undefined,
          email: iEmail >= 0 ? r[iEmail] : undefined,
          phone: iPhone >= 0 ? r[iPhone] : undefined,
          city: iCity >= 0 ? r[iCity] : "Ancona",
          agencyName: iAgency >= 0 ? r[iAgency] : undefined,
          website: iWeb >= 0 ? r[iWeb] : undefined,
          contactType,
        };
        if (!row.email && !row.phone && !row.fullName && !row.agencyName) {
          row.error = "Riga senza identificativi";
        }
        return row;
      });
      setPreview(mapped);
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    startTransition(async () => {
      let ok = 0;
      let fail = 0;
      for (const row of preview) {
        if (row.error) {
          fail++;
          continue;
        }
        const res = await upsertCrmContact({
          firstName: row.firstName,
          lastName: row.lastName,
          fullName: row.fullName,
          email: row.email,
          phone: row.phone,
          whatsappPhone: row.phone,
          city: row.city,
          agencyName: row.agencyName,
          website: row.website,
          contactType: row.contactType,
          source: "IMPORT",
          status: "TO_CONTACT",
        });
        if (res.ok) ok++;
        else fail++;
      }
      setResult(`Import completato: ${ok} ok, ${fail} errori/skip.`);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl2 bg-surface p-5 shadow-card">
      <h2 className="font-display text-sm font-bold text-ink">Import CSV</h2>
      <p className="mt-1 text-xs text-ink-muted">
        Header supportati: nome/firstname, cognome, email, telefono, città,
        agenzia, website, tipo. Anteprima → conferma. Deduplica automatica.
      </p>
      <input
        type="file"
        accept=".csv,text/csv"
        className="mt-3 block w-full text-xs"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      {preview.length > 0 && (
        <>
          <p className="mt-3 text-xs text-ink-muted">
            Anteprima {preview.length} righe
          </p>
          <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-sea-100 text-[11px]">
            <table className="w-full">
              <tbody>
                {preview.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b border-sea-50">
                    <td className="px-2 py-1">
                      {r.agencyName || r.fullName || r.firstName || "—"}
                    </td>
                    <td className="px-2 py-1">{r.email || r.phone || "—"}</td>
                    <td className="px-2 py-1">{r.contactType}</td>
                    <td className="px-2 py-1 text-sunset-600">{r.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={confirmImport}
            className="mt-3 rounded-full bg-sea-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Import…" : "Conferma import"}
          </button>
        </>
      )}
      {result && <p className="mt-2 text-xs text-sea-700">{result}</p>}
    </div>
  );
}
