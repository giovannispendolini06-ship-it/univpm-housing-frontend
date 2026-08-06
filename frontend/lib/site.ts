/** Canonical production origin. Prefer NEXT_PUBLIC_SITE_URL in env; never fall back to the old Vercel hostname. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://coabito.it"
).replace(/\/$/, "");
