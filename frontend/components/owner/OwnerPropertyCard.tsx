"use client";

import Link from "next/link";
import ApplicationStatusButtons from "@/components/applications/ApplicationStatusButtons";
import MatchScoreRing from "@/components/MatchScoreRing";
import { useLocale } from "@/lib/i18n/LocaleContext";

export type OwnerCandidate = {
  applicationId: string;
  roomLabel: string;
  status: string;
  message: string | null;
  studentName: string;
  studentVerified: boolean;
  studentEmail: string | null;
  matchScore: number | null;
};

export type OwnerPropertyCardProps = {
  property: {
    id: string;
    address: string;
    zone: string | null;
    status: string;
    statusLabel: string;
    monthlyRentToOwner: number;
    guaranteedRent: boolean;
  };
  rooms: { id: string; room_label: string; is_available: boolean }[];
  occupied: boolean;
  candidates: OwnerCandidate[];
};

export default function OwnerPropertyCard({
  property,
  rooms,
  occupied,
  candidates,
}: OwnerPropertyCardProps) {
  const { t } = useLocale();
  const L = t.ownerDashboard;

  if (property.guaranteedRent) {
    return (
      <article className="rounded-xl2 border border-sea-100 bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-sea-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M3.5 8.2l3 3 6-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {L.guaranteedBadge}
            </span>
            <h3 className="mt-2 font-display text-sm font-bold text-ink">
              {property.zone ?? property.address}
            </h3>
            <p className="text-xs text-ink-muted">{property.address}</p>
          </div>
          <span className="shrink-0 font-display text-sm font-bold tabular-nums text-sea-700">
            {property.monthlyRentToOwner}€/mese
          </span>
        </div>

        <p className="mt-4 rounded-xl bg-sea-50 px-3 py-2.5 text-sm text-ink">
          {L.coabitoHandles}
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          {occupied ? L.occupied : L.searchingTenant}
          {" · "}
          {property.statusLabel}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <a
            href="mailto:info@coabito.it?subject=Domanda%20canone%20garantito"
            className="font-semibold text-sea-700 underline"
          >
            {L.contactCoabito}
          </a>
          <Link
            href={`/owner/properties/${property.id}`}
            className="font-semibold text-ink-muted underline"
          >
            {L.manage}
          </Link>
        </div>
      </article>
    );
  }

  const openCandidates = candidates.filter(
    (c) => !["accepted", "rejected", "withdrawn"].includes(c.status),
  );
  const shown = candidates.slice(0, 8);

  return (
    <article className="rounded-xl2 border border-sea-100 bg-white p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-sunset-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-sunset-600">
            {L.marketplaceBadge}
          </span>
          <h3 className="mt-2 font-display text-sm font-bold text-ink">
            {property.zone ?? property.address}
          </h3>
          <p className="text-xs text-ink-muted">{property.address}</p>
        </div>
        <span className="shrink-0 text-[11px] font-medium text-ink-muted">
          {property.statusLabel}
        </span>
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-bg pt-3">
        {rooms.map((room) => (
          <li
            key={room.id}
            className="flex items-center justify-between rounded-xl border border-sea-100 px-3 py-2 text-sm"
          >
            <span className="text-ink">{room.room_label}</span>
            <span className="text-[11px] text-ink-muted">
              {room.is_available ? L.roomAvailable : L.roomOccupied}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          {L.candidatesHeading}
        </h4>
        {shown.length === 0 ? (
          <p className="rounded-xl bg-bg px-3 py-3 text-sm text-ink-muted">
            {L.emptyCandidates}
          </p>
        ) : (
          <ul className="space-y-3">
            {shown.map((c) => (
              <li
                key={c.applicationId}
                className="rounded-xl border border-sea-100 px-3 py-2.5 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-bold text-ink">{c.studentName}</p>
                    <p className="text-[11px] text-ink-muted">{c.roomLabel}</p>
                    {c.studentVerified && (
                      <span className="mt-1 inline-block rounded-full bg-sea-50 px-2 py-0.5 text-[10px] font-semibold text-sea-700">
                        {L.verifiedStudent}
                      </span>
                    )}
                  </div>
                  {c.matchScore != null && (
                    <div className="text-center">
                      <MatchScoreRing score={c.matchScore} size={44} />
                      <p className="mt-0.5 text-[9px] text-ink-muted">
                        {L.compatibility}
                      </p>
                    </div>
                  )}
                </div>
                {c.message ? (
                  <p className="mt-2 text-xs text-ink-muted">{c.message}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {openCandidates.some((o) => o.applicationId === c.applicationId) && (
                    <ApplicationStatusButtons applicationId={c.applicationId} />
                  )}
                  {c.studentEmail && (
                    <a
                      href={`mailto:${c.studentEmail}`}
                      className="text-[11px] font-semibold text-sea-700 underline"
                    >
                      {L.message}
                    </a>
                  )}
                  <Link
                    href="/messages"
                    className="text-[11px] font-semibold text-ink-muted underline"
                  >
                    {L.messagesLink}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href={`/owner/properties/${property.id}`}
        className="mt-3 inline-block text-xs font-semibold text-sea-700 underline"
      >
        {L.manage}
      </Link>
    </article>
  );
}
