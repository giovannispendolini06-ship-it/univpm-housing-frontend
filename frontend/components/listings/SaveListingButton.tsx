"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { addFavorite, toggleFavorite } from "@/app/favorites/actions";
import { track } from "@/lib/analytics";
import { useLocale } from "@/lib/i18n/LocaleContext";

type Props = {
  roomId: string;
  initialSaved?: boolean;
  /** When false, click goes straight to login (no server round-trip). */
  isAuthenticated?: boolean;
  /** compact = icon-only for cards; detail = labeled button */
  variant?: "compact" | "detail";
  className?: string;
};

function loginHref(roomId: string, returnPath: string): string {
  const next = returnPath.startsWith("/") ? returnPath : `/stanza/${roomId}`;
  const params = new URLSearchParams({
    next,
    action: "favorite",
    listing_id: roomId,
  });
  return `/login?${params.toString()}`;
}

function returnPathFor(pathname: string | null, roomId: string): string {
  const search =
    typeof window !== "undefined" ? window.location.search : "";
  if (pathname?.startsWith("/stanza/") || pathname === "/stanze") {
    return `${pathname}${search}`;
  }
  return `/stanza/${roomId}`;
}

export default function SaveListingButton({
  roomId,
  initialSaved = false,
  isAuthenticated = false,
  variant = "compact",
  className = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved, roomId]);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const returnPath = returnPathFor(pathname, roomId);

    // Anonymous: gate immediately (works even if Supabase/server actions are down).
    if (!isAuthenticated) {
      router.push(loginHref(roomId, returnPath));
      return;
    }

    startTransition(async () => {
      try {
        const result = await toggleFavorite(roomId);
        if (!result.ok) {
          if (result.code === "unauthenticated") {
            router.push(loginHref(roomId, returnPath));
            return;
          }
          setError(result.error);
          return;
        }
        setSaved(result.saved);
        if (result.saved) track("listing_saved", { roomId });
        router.refresh();
      } catch {
        router.push(loginHref(roomId, returnPath));
      }
    });
  }

  const label = saved
    ? t.listingsCard.savedFavorite
    : t.listingsCard.saveFavorite;
  const base =
    variant === "detail"
      ? "inline-flex w-full items-center justify-center gap-2 rounded-full border border-sea-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-sea-400 hover:bg-sea-50 disabled:opacity-60"
      : "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sea-100 bg-white text-ink shadow-sm transition hover:border-sea-400 hover:text-sea-700 disabled:opacity-60";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={saved}
        aria-label={label}
        title={label}
        className={base}
      >
        <HeartIcon filled={saved} />
        {variant === "detail" && (
          <span>{pending ? t.listingsCard.savingFavorite : label}</span>
        )}
      </button>
      {error && (
        <p className="mt-1 text-[11px] text-sunset-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Call once on /login success (or destination) to complete pending favorite. */
export async function resumePendingFavorite(
  listingId: string,
): Promise<boolean> {
  const result = await addFavorite(listingId);
  return result.ok && result.saved;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={filled ? "text-sunset-500" : "text-ink-muted"}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
