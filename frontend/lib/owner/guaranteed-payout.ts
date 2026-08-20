/**
 * Ops convention for Coabito guaranteed-rent owner payouts.
 * Until a dedicated payouts table exists, the next payment date is the
 * 1st of the next calendar month (Europe/Rome calendar days).
 */

export function nextGuaranteedPayoutDate(from: Date = new Date()): Date {
  const y = from.getFullYear();
  const m = from.getMonth();
  // 1st of next month, local
  return new Date(y, m + 1, 1);
}

export function formatPayoutDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatPayoutDateEN(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type GuaranteedPropertySummary = {
  id: string;
  zoneLabel: string;
  monthlyAmount: number;
  occupied: boolean;
};

export function aggregateGuaranteedPayout(
  properties: GuaranteedPropertySummary[],
): { totalMonthly: number; occupiedCount: number; vacantCount: number } {
  const totalMonthly = properties.reduce((s, p) => s + p.monthlyAmount, 0);
  const occupiedCount = properties.filter((p) => p.occupied).length;
  const vacantCount = properties.length - occupiedCount;
  return { totalMonthly, occupiedCount, vacantCount };
}
