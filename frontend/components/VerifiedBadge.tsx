import {
  verificationLabel,
  type VerificationStatus,
} from "@/lib/verification";

export default function VerifiedBadge({
  status,
  role,
  className = "",
}: {
  status: VerificationStatus | string | null | undefined;
  role: "student" | "owner" | string;
  className?: string;
}) {
  if (status !== "verified") return null;
  const label = verificationLabel("verified", role);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-semibold text-sea-700 ring-1 ring-sea-100 ${className}`}
      title={label}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      {label}
    </span>
  );
}
