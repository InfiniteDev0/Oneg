"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { Flag } from "@/components/flag";
import { getDirection, LOCALE_FLAG, localeNames, locales } from "@/i18n/config";
import { useSwitchLocale } from "./use-switch-locale";

// Full-width menu for phones and tablets (hidden from the "lg" breakpoint up).
export default function MobileMenu({ nav, actions, lang, labels }) {
  const [open, setOpen] = useState(false);
  const switchTo = useSwitchLocale();
  const close = () => setOpen(false);

  // Escape closes the menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.closeMenu : labels.openMenu}
        className="rounded-md p-2 transition-colors hover:bg-foreground/[0.07]"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-border bg-navbar text-navbar-foreground px-4 pb-8 pt-4 shadow-lg sm:px-6"
        >
          <nav className="flex flex-col gap-2">
            {nav.map((group) =>
              group.columns ? (
                <details key={group.key} className="group/menu">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-2.5 text-[1.0625rem] hover:bg-field [&::-webkit-details-marker]:hidden">
                    {group.label}
                    <ChevronDown className="size-4 opacity-60 transition-transform group-open/menu:rotate-180" />
                  </summary>
                  <div className="flex flex-col gap-5 px-2 pt-2 pb-4">
                    {group.columns.map((col) => (
                      <div key={col.title}>
                        <p className="mb-1 font-mono text-[0.75rem] tracking-[0.14em] text-muted-foreground uppercase rtl:font-sans rtl:text-sm rtl:tracking-normal">
                          {col.title}
                        </p>
                        <ul>
                          {[...col.links, ...(col.seeAll ? [col.seeAll] : [])].map((item) => (
                            <li key={item.href + item.label}>
                              <Link
                                href={item.href}
                                onClick={close}
                                className={`block rounded-md py-2 text-base hover:underline ${item === col.seeAll ? "text-primary" : ""}`}
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  key={group.key}
                  href={group.href}
                  onClick={close}
                  className="rounded-md px-2 py-2.5 text-[1.0625rem] hover:bg-field"
                >
                  {group.label}
                </Link>
              )
            )}

            <div className="mt-4">
              <p className="mb-2 px-2 text-[0.8125rem] font-medium uppercase tracking-wide text-foreground/60">
                {labels.language}
              </p>
              <div className="flex flex-wrap gap-2 px-2">
                {locales.map((code) => (
                  <button
                    key={code}
                    type="button"
                    lang={code}
                    dir={getDirection(code)}
                    onClick={() => switchTo(code)}
                    aria-current={code === lang ? "true" : undefined}
                    className="inline-flex items-center gap-2 rounded-full border border-foreground/25 px-4 py-1.5 text-[0.9375rem] transition-colors hover:bg-foreground/[0.07] aria-[current=true]:border-foreground aria-[current=true]:bg-foreground aria-[current=true]:text-background"
                  >
                    <Flag code={LOCALE_FLAG[code]} />
                    {localeNames[code]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-6">
              <Link href={actions.login.href} onClick={close} className="px-2 py-1 text-[1.0625rem]">
                {actions.login.label}
              </Link>
              <Link
                href={actions.getStarted.href}
                onClick={close}
                className="mt-2 rounded-md bg-primary px-4 py-3 text-center text-base font-medium text-primary-foreground hover:bg-primary/90"
              >
                {actions.getStarted.label}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
