"use client";

import { track as vercelTrack } from "@vercel/analytics";
import * as CookieConsent from "vanilla-cookieconsent";

/**
 * Eventi funnel aggregati (niente PII).
 * Inviati solo se l'utente ha accettato la categoria "analytics"
 * del banner cookie (stesso gate di Vercel Analytics).
 */
export type FunnelEventName =
  | "homepage_view"
  | "vesta_chat_started"
  | "vesta_chat_completed"
  | "vesta_chat_abandoned"
  | "waitlist_form_started"
  | "waitlist_signup_completed"
  | "waitlist_email_confirmed"
  | "whatsapp_button_clicked"
  | "whatsapp_modal_opened"
  | "whatsapp_contact_clicked"
  | "whatsapp_contact_started";

type FunnelProps = Record<string, string | number | boolean | null>;

function analyticsAllowed(): boolean {
  try {
    return CookieConsent.acceptedCategory("analytics");
  } catch {
    return false;
  }
}

export function trackFunnel(name: FunnelEventName, props?: FunnelProps): void {
  if (typeof window === "undefined") return;
  if (!analyticsAllowed()) return;

  try {
    if (props) vercelTrack(name, props);
    else vercelTrack(name);
  } catch {
    /* Analytics non disponibile / bloccato */
  }
}

/**
 * Central analytics abstraction.
 * Today: console in development + optional window event for future providers.
 * Never send secrets or unnecessary PII.
 *
 * TODO: wire to a real provider (PostHog / Plausible / custom) behind consent.
 */

export type AnalyticsEventName =
  | "landing_cta_clicked"
  | "onboarding_started"
  | "onboarding_completed"
  | "search_performed"
  | "listing_viewed"
  | "listing_saved"
  | "match_viewed"
  | "application_started"
  | "application_submitted"
  | "message_started"
  | "host_listing_created"
  | "host_listing_published"
  | "verification_started"
  | "verification_completed"
  | "whatsapp_contact_clicked"
  | "whatsapp_modal_opened"
  | "whatsapp_template_changed"
  | "whatsapp_contact_started";

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

export function track(event: AnalyticsEventName, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;

  const payload = { event, props: props ?? {}, ts: Date.now() };

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.info("[analytics]", payload);
  }

  try {
    window.dispatchEvent(new CustomEvent("coabito:analytics", { detail: payload }));
  } catch {
    // ignore
  }

  // TODO: if (consent.analytics) posthog.capture(event, props)
}

export function trackCta(
  cta: string,
  location: string,
  href?: string,
): void {
  track("landing_cta_clicked", { cta, location, href: href ?? null });
}
