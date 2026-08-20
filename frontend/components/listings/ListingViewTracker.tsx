"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function ListingViewTracker({
  roomId,
  title,
}: {
  roomId: string;
  title: string;
}) {
  useEffect(() => {
    track("listing_viewed", { roomId, title });
  }, [roomId, title]);

  return null;
}
