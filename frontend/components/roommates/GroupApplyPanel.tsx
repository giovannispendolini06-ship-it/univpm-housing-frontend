"use client";

import { useState, useTransition } from "react";
import { submitGroupRoomApplication } from "@/app/coinquilini/actions";

type MatchOption = { userId: string; displayName: string };

/**
 * Optional group apply: only mutual matches. Each student still gets their
 * own room_applications row with a shared group_id.
 */
export default function GroupApplyPanel({
  roomId,
  matches,
}: {
  roomId: string;
  matches: MatchOption[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (matches.length === 0) return null;

  return (
    <div className="rounded-xl2 border border-sea-100 bg-sea-50/60 p-4">
      <p className="font-display text-sm font-bold text-ink">
        Candidati insieme ai tuoi match
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        Percorso aggiuntivo: candidatura di gruppo dopo match reciproco. Ogni
        persona ha la propria candidatura collegata.
      </p>
      <ul className="mt-3 space-y-1.5">
        {matches.map((m) => {
          const checked = selected.includes(m.userId);
          return (
            <li key={m.userId}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setSelected((prev) =>
                      checked
                        ? prev.filter((id) => id !== m.userId)
                        : [...prev, m.userId],
                    );
                  }}
                />
                {m.displayName}
              </label>
            </li>
          );
        })}
      </ul>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="Messaggio al proprietario (opzionale)"
        className="mt-3 w-full rounded-xl border border-sea-100 bg-white px-3 py-2 text-sm text-ink focus:border-sea-400 focus:outline-none"
      />
      <button
        type="button"
        disabled={pending || selected.length === 0}
        onClick={() => {
          setStatus(null);
          startTransition(async () => {
            const res = await submitGroupRoomApplication({
              roomId,
              message,
              coApplicantIds: selected,
            });
            if (!res.ok) {
              setStatus(res.error);
              return;
            }
            setStatus(
              `Candidatura di gruppo inviata (${res.applicationIds.length} persone).`,
            );
          });
        }}
        className="mt-3 rounded-full bg-sea-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Invio…" : "Candidati come gruppo"}
      </button>
      {status && (
        <p className="mt-2 text-xs text-ink-muted" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
