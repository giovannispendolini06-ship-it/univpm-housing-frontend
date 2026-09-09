"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addFavorite } from "@/app/favorites/actions";

/**
 * When middleware redirects an already-authenticated user from /login
 * with ?action=favorite&listing_id=, complete the save and clean the URL.
 */
export default function ResumePendingFavorite() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (searchParams.get("action") !== "favorite") return;
    const listingId = searchParams.get("listing_id")?.trim();
    if (!listingId) return;
    ran.current = true;

    void (async () => {
      try {
        await addFavorite(listingId);
      } catch {
        /* best-effort */
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      url.searchParams.delete("listing_id");
      router.replace(url.pathname + url.search + url.hash);
      router.refresh();
    })();
  }, [searchParams, router]);

  return null;
}
