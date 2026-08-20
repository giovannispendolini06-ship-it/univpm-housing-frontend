/**
 * Rate limiting configurabile per outreach automatico (email).
 * WhatsApp wa.me non viene mai inviato in massa.
 */

export type RateLimitConfig = {
  maxEmailPerHour: number;
  maxEmailPerDay: number;
  maxActiveSequences: number;
};

export function getCrmRateLimits(): RateLimitConfig {
  return {
    maxEmailPerHour: Number(process.env.CRM_EMAIL_MAX_PER_HOUR || 30),
    maxEmailPerDay: Number(process.env.CRM_EMAIL_MAX_PER_DAY || 200),
    maxActiveSequences: Number(process.env.CRM_MAX_ACTIVE_SEQUENCES || 500),
  };
}

/** Conta grezza in-memory per processo (best-effort; cron userà DB). */
const hourBucket = { start: 0, count: 0 };
const dayBucket = { start: 0, count: 0 };

export function canSendCrmEmailNow(): { ok: boolean; reason?: string } {
  const limits = getCrmRateLimits();
  const now = Date.now();
  if (now - hourBucket.start > 3600_000) {
    hourBucket.start = now;
    hourBucket.count = 0;
  }
  if (now - dayBucket.start > 86400_000) {
    dayBucket.start = now;
    dayBucket.count = 0;
  }
  if (hourBucket.count >= limits.maxEmailPerHour) {
    return { ok: false, reason: "Limite orario email raggiunto. Riprova più tardi." };
  }
  if (dayBucket.count >= limits.maxEmailPerDay) {
    return { ok: false, reason: "Limite giornaliero email raggiunto." };
  }
  return { ok: true };
}

export function recordCrmEmailSend(): void {
  hourBucket.count += 1;
  dayBucket.count += 1;
}
