/**
 * Normalize Supabase Auth errors for UI — never surface "{}" or empty strings.
 * AuthRetryableFetchError often has message === "{}" (e.g. SMTP/network 504).
 */

export type AuthErrorCopy = {
  rateLimitError: string;
  alreadyRegisteredError: string;
  networkSmtpError: string;
  genericError: string;
};

type AuthLike = {
  message?: unknown;
  code?: unknown;
  status?: unknown;
  name?: unknown;
};

function asRecord(err: unknown): AuthLike | null {
  if (err && typeof err === "object") return err as AuthLike;
  return null;
}

function rawMessage(err: unknown): string {
  const rec = asRecord(err);
  if (typeof rec?.message === "string") return rec.message.trim();
  if (err instanceof Error && typeof err.message === "string") {
    return err.message.trim();
  }
  return "";
}

function isUselessMessage(msg: string): boolean {
  if (!msg) return true;
  if (msg === "{}") return true;
  if (msg === "[object Object]") return true;
  // JSON empty object / sparse payloads sometimes stringified
  if (/^\{\s*\}$/.test(msg)) return true;
  return false;
}

export function mapAuthErrorMessage(
  err: unknown,
  copy: AuthErrorCopy,
): string {
  const rec = asRecord(err);
  const msg = rawMessage(err);
  const lower = msg.toLowerCase();
  const code = String(rec?.code ?? "").toLowerCase();
  const name = String(rec?.name ?? "").toLowerCase();
  const status = Number(rec?.status);

  // Rate limits (built-in email provider or Auth email caps)
  if (
    code === "over_email_send_rate_limit" ||
    lower.includes("rate limit") ||
    lower.includes("email rate limit") ||
    lower.includes("over_email_send_rate_limit")
  ) {
    return copy.rateLimitError;
  }

  // Already registered / duplicate identity
  if (
    code === "user_already_exists" ||
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("user already exists") ||
    lower.includes("email address is already")
  ) {
    return copy.alreadyRegisteredError;
  }

  // Network / SMTP timeouts — AuthRetryableFetchError often shows as "{}"
  if (
    name.includes("retryable") ||
    name.includes("authretryablefetcherror") ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    isUselessMessage(msg)
  ) {
    return copy.networkSmtpError;
  }

  if (!isUselessMessage(msg)) return msg;
  return copy.genericError;
}
