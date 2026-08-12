"use client";

import { track } from "@vercel/analytics";
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
  | "whatsapp_button_clicked";

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
    if (props) track(name, props);
    else track(name);
  } catch {
    /* Analytics non disponibile / bloccato */
  }
}
