/**
 * Safe internal redirect after login/signup.
 * Only same-origin relative paths; blocks protocol-relative and external URLs.
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;
  const value = raw.trim();
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  if (/[\s\\]/.test(value)) return fallback;
  return value;
}
