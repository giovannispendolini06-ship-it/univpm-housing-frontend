import Link from "next/link";
import type { Listing } from "@/lib/domain/types";

export default function PublicRoomCard({ listing }: { listing: Listing }) {
  const total = listing.monthlyRent + listing.utilitiesEstimate;
  const photo = listing.photoUrls[0];

  return (
    <article className="overflow-hidden rounded-xl2 border border-sea-100 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/stanza/${listing.id}`} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          className="h-44 w-full object-cover"
        />
        <div className="space-y-2 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="font-display text-base font-bold text-ink">{listing.title}</h2>
            {listing.landlordVerified && (
              <span className="rounded-full bg-sea-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sea-700">
                Proprietario verificato
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted">
            {listing.neighbourhood ?? "Zona da confermare"} · {listing.cityLabel}
          </p>
          <p className="font-display text-sm font-bold text-ink">
            {listing.monthlyRent}€
            <span className="ml-1 font-body text-xs font-normal text-ink-muted">
              /mese
              {listing.utilitiesEstimate > 0
                ? ` + ~${listing.utilitiesEstimate}€ utenze`
                : ""}
            </span>
          </p>
          <p className="text-[11px] text-ink-muted">Totale stimato {total}€/mese</p>
          {listing.amenities.length > 0 && (
            <p className="line-clamp-1 text-[11px] text-ink-muted">
              {listing.amenities.slice(0, 4).join(" · ")}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
