"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  interestInRoommateAction,
  passRoommateAction,
} from "@/app/coinquilini/actions";
import type { RoommateCard } from "@/lib/data/roommates";

export default function RoommateSuggestionCards({
  initial,
}: {
  initial: RoommateCard[];
}) {
  const [cards, setCards] = useState(initial);
  const [flash, setFlash] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (cards.length === 0) {
    return (
      <div className="rounded-xl2 border border-sea-100 bg-white px-4 py-8 text-center shadow-card">
        <p className="font-display font-bold text-ink">Nessun profilo al momento</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Quando altri studenti attiveranno il matching e avranno preferenze
          simili alle tue, li vedrai qui. Intanto puoi continuare la ricerca
          classica per annuncio.
        </p>
        <Link
          href="/stanze"
          className="mt-4 inline-flex rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Cerca stanze
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flash && (
        <p
          className="rounded-xl2 border border-sea-100 bg-sea-50 px-3 py-2 text-sm text-sea-800"
          role="status"
        >
          {flash}
        </p>
      )}
      <ul className="space-y-3">
        {cards.map((card) => (
          <li
            key={card.userId}
            className="rounded-xl2 border border-sea-100 bg-white p-4 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-base font-bold text-ink">
                  {card.displayName}
                </p>
                {card.universityLabel && (
                  <p className="text-xs text-ink-muted">{card.universityLabel}</p>
                )}
              </div>
              <p className="rounded-full bg-sea-50 px-2.5 py-1 text-xs font-semibold text-sea-700">
                {card.compatibilityScore}% compatibile
              </p>
            </div>

            {card.bio && <p className="mt-2 text-sm text-ink">{card.bio}</p>}

            {card.reasons.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {card.reasons.slice(0, 2).map((r) => (
                  <li key={r.label} className="text-[11px] text-ink-muted">
                    <span className="font-semibold text-ink">{r.label}:</span>{" "}
                    {r.detail}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-2 text-[11px] text-ink-muted">
              Contatti nascosti finché non vi accettate a vicenda.
            </p>

            {card.matched ? (
              <Link
                href={
                  card.conversationId
                    ? `/messages?c=${card.conversationId}`
                    : "/messages"
                }
                className="mt-3 inline-flex rounded-full bg-sea-600 px-3.5 py-1.5 text-xs font-semibold text-white"
              >
                Apri chat
              </Link>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending || card.alreadyInterested}
                  onClick={() => {
                    setPendingId(card.userId);
                    setFlash(null);
                    startTransition(async () => {
                      const res = await interestInRoommateAction(card.userId);
                      setPendingId(null);
                      if (!res.ok) {
                        setFlash(res.error);
                        return;
                      }
                      if (res.matched) {
                        setFlash(
                          `Match reciproco con ${card.displayName}! Chat sbloccata.`,
                        );
                        setCards((prev) =>
                          prev.map((c) =>
                            c.userId === card.userId
                              ? {
                                  ...c,
                                  matched: true,
                                  alreadyInterested: true,
                                  conversationId: res.conversationId,
                                }
                              : c,
                          ),
                        );
                      } else {
                        setFlash(
                          "Interesse inviato. La chat si apre solo se anche l'altra persona accetta.",
                        );
                        setCards((prev) =>
                          prev.map((c) =>
                            c.userId === card.userId
                              ? { ...c, alreadyInterested: true }
                              : c,
                          ),
                        );
                      }
                    });
                  }}
                  className="rounded-full bg-sea-600 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {pending && pendingId === card.userId
                    ? "…"
                    : card.alreadyInterested
                      ? "Interesse inviato"
                      : "Mi interessa"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setPendingId(card.userId);
                    startTransition(async () => {
                      const res = await passRoommateAction(card.userId);
                      setPendingId(null);
                      if (!res.ok) {
                        setFlash(res.error);
                        return;
                      }
                      setCards((prev) => prev.filter((c) => c.userId !== card.userId));
                    });
                  }}
                  className="rounded-full border border-sea-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-muted"
                >
                  Passa
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
