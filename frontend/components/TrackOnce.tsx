"use client";

import { useEffect, useRef } from "react";
import { trackFunnel, type FunnelEventName } from "@/lib/analytics";

/** Spara un evento funnel una sola volta al mount (rispetta consenso Analytics). */
export default function TrackOnce({ event }: { event: FunnelEventName }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackFunnel(event);
  }, [event]);

  return null;
}
