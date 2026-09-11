import { partnerBadgeLabel, type PartnerTier } from "@/lib/partner-tier";

/** Public badge for Partner / Fondatrice agencies on listing cards and detail. */
export default function PartnerBadge({
  tier,
  className = "",
}: {
  tier: PartnerTier | null | undefined;
  className?: string;
}) {
  const label = partnerBadgeLabel(tier);
  if (!label) return null;

  const isFondatrice = tier === "fondatrice";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        isFondatrice
          ? "bg-sunset-500/15 text-sunset-600"
          : "bg-sea-600 text-white"
      } ${className}`}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M8 1.5l1.8 3.7 4.1.6-3 2.9.7 4.1L8 11.2l-3.6 1.9.7-4.1-3-2.9 4.1-.6L8 1.5z"
          fill="currentColor"
        />
      </svg>
      {label}
    </span>
  );
}
