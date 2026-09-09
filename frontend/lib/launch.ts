/**
 * Data target lancio / prime stanze (anno accademico).
 * Configurabile via NEXT_PUBLIC_LAUNCH_DATE (YYYY-MM-DD), default 2026-09-01.
 */
export function getLaunchTargetDate(): Date {
  const raw = (process.env.NEXT_PUBLIC_LAUNCH_DATE || "2026-09-01").trim();
  // Interpreta come mezzanotte UTC della data indicata (stabile cross-TZ).
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) {
    return new Date(Date.UTC(2026, 8, 1));
  }
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Giorni interi rimanenti fino alla data target (0 = oggi o passato). */
export function daysUntilLaunch(now: Date = new Date()): number {
  const target = getLaunchTargetDate();
  const startOfTodayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const targetUtc = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
  );
  const diffMs = targetUtc - startOfTodayUtc;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

const MONTH_IT = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
] as const;

const MONTH_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Nome mese della data di lancio (da NEXT_PUBLIC_LAUNCH_DATE). */
export function getLaunchMonthLabel(locale: "it" | "en" = "it"): string {
  const monthIndex = getLaunchTargetDate().getUTCMonth();
  return locale === "en" ? MONTH_EN[monthIndex] : MONTH_IT[monthIndex];
}
