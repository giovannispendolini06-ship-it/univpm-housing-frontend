"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import SignOutButton from "@/components/SignOutButton";
import {
  IconCasa,
  IconChat,
  IconDocumento,
  IconMessaggi,
  IconProfilo,
} from "@/components/icons/CoabitoIcons";
import { useLocale } from "@/lib/i18n/LocaleContext";

const NAV = [
  { href: "/dashboard", labelKey: "vesta" as const, Icon: IconChat },
  { href: "/stanze", labelKey: "stanze" as const, Icon: IconCasa },
  { href: "/applications", labelKey: "candidature" as const, Icon: IconDocumento },
  { href: "/messages", labelKey: "messaggi" as const, Icon: IconMessaggi },
  { href: "/profilo", labelKey: "profilo" as const, Icon: IconProfilo },
];

const LABELS = {
  it: {
    vesta: "Vesta",
    stanze: "Stanze",
    candidature: "Candidature",
    messaggi: "Messaggi",
    profilo: "Profilo",
    brand: "Coabito",
    area: "La tua ricerca",
  },
  en: {
    vesta: "Vesta",
    stanze: "Rooms",
    candidature: "Applications",
    messaggi: "Messages",
    profilo: "Profile",
    brand: "Coabito",
    area: "Your search",
  },
} as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  }
  if (href === "/stanze") {
    return pathname === "/stanze" || pathname.startsWith("/stanza/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Persistent student chrome: top bar (desktop) + bottom nav (mobile).
 * Replaces the floating pill soup on /dashboard and ad-hoc link rows
 * on applications / messages / profilo.
 */
export default function StudentShell({
  children,
  fillHeight = false,
}: {
  children: ReactNode;
  /** Dashboard chat split needs full viewport height */
  fillHeight?: boolean;
}) {
  const pathname = usePathname() ?? "/dashboard";
  const { locale, t } = useLocale();
  const copy = LABELS[locale === "en" ? "en" : "it"];

  return (
    <div
      className={
        fillHeight
          ? "flex h-dvh flex-col bg-bg"
          : "flex min-h-dvh flex-col bg-bg"
      }
    >
      <header className="sticky top-0 z-40 shrink-0 border-b border-sea-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <div className="min-w-0">
            <Link
              href="/dashboard"
              className="font-display text-base font-bold tracking-tight text-ink sm:text-lg"
            >
              {copy.brand}
            </Link>
            <p className="hidden text-[11px] text-ink-muted sm:block">{copy.area}</p>
          </div>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label={copy.area}
          >
            {NAV.map(({ href, labelKey, Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "bg-sea-600 text-white"
                      : "text-ink-muted hover:bg-sea-50 hover:text-ink",
                  ].join(" ")}
                >
                  <Icon
                    size={16}
                    className={active ? "text-white" : "text-sea-600"}
                  />
                  {copy[labelKey]}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <SignOutButton
              className="hidden rounded-full bg-sea-50 px-3 py-1.5 text-xs font-semibold text-ink-muted sm:inline-flex"
              label={t.common.signOut}
            />
          </div>
        </div>
      </header>

      <div
        className={[
          "mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col",
          // Room for fixed bottom nav + safe area on mobile
          "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0",
          fillHeight ? "overflow-hidden" : "",
        ].join(" ")}
      >
        {children}
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-sea-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label={copy.area}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map(({ href, labelKey, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold transition",
                    active ? "text-sea-700" : "text-ink-muted",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full transition",
                      active ? "bg-sea-50 text-sea-700" : "text-sea-600",
                    ].join(" ")}
                  >
                    <Icon size={20} className="text-current" />
                  </span>
                  {copy[labelKey]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
