/**
 * Config + storage helpers for the waitlist announce bar.
 *
 * Mese nel copy: NEXT_PUBLIC_ANNOUNCE_LAUNCH_MONTH (es. "settembre" / "September")
 * oppure derivato da NEXT_PUBLIC_LAUNCH_DATE (YYYY-MM-DD, default 2026-09-01).
 */

export const ANNOUNCE_DISMISS_KEY = "coabito_announce_dismissed_at";
export const WAITLIST_JOINED_KEY = "coabito_waitlist_joined";
export const ANNOUNCE_DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Offset sticky navbar quando la barra è visibile (sync CSS var). */
export const ANNOUNCE_OFFSET_CSS_VAR = "--announce-bar-offset";

export function getAnnounceLaunchMonth(locale: "it" | "en"): string {
  const override = process.env.NEXT_PUBLIC_ANNOUNCE_LAUNCH_MONTH?.trim();
  if (override) return override;

  const raw = (process.env.NEXT_PUBLIC_LAUNCH_DATE || "2026-09-01").trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  const monthIndex = match ? Number(match[2]) - 1 : 8; // default settembre
  const date = new Date(Date.UTC(2026, monthIndex, 1));
  return date.toLocaleString(locale === "en" ? "en-US" : "it-IT", {
    month: "long",
    timeZone: "UTC",
  });
}

export function isAnnounceDismissed(now = Date.now()): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(ANNOUNCE_DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return now - ts < ANNOUNCE_DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export function dismissAnnounce(now = Date.now()): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANNOUNCE_DISMISS_KEY, String(now));
  } catch {
    /* private mode / quota */
  }
}

export function hasJoinedWaitlist(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage.getItem(WAITLIST_JOINED_KEY));
  } catch {
    return false;
  }
}

/** Chiamare dopo iscrizione/conferma waitlist (client-side). */
export function markWaitlistJoined(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WAITLIST_JOINED_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function setAnnounceOffset(px: number): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    ANNOUNCE_OFFSET_CSS_VAR,
    px > 0 ? `${px}px` : "0px",
  );
}
