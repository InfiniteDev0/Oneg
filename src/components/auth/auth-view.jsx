"use client";

// The sign-in / sign-up screen.
//  - Left: the photo panel from the Barista project (AdminLogin.tsx): a rounded
//    full-height photo with a dark fade at the bottom and big light lettering on it.
//  - Right: the form card from the Lenzro project (C:\dev\Lenzro, app/auth/page.tsx).
//  - Sign-up works like Lenzro: no photo, the form alone in the middle.
//  - Phones and tablets get the form only (the photo needs a wide screen).
// Light mode, like the rest of Oneg: light grey page, white form card
// (.oneg-auth-card in globals.css), Oneg's blue button.

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/landing/logo";
import LanguageSwitcher from "@/components/landing/language-switcher";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export default function AuthView({ t, lang, languageLabel }) {
  const isSignup = useSearchParams().get("mode") === "signup";

  return (
    <div
      className={cn(
        "grid min-h-svh bg-background text-foreground",
        isSignup ? "grid-cols-1" : "lg:h-svh lg:grid-cols-2 lg:gap-2 lg:p-2"
      )}
    >
      {/* ── Photo (Barista) — login only, wide screens only ─────────────── */}
      {!isSignup && (
        <section aria-label={t.image.title} className="relative hidden overflow-hidden rounded-lg bg-black lg:block">
          <Image src="/auth.jpg" alt="" fill priority sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-x-8 bottom-8 z-10 text-white">
            <p className="text-8xl font-light">{t.image.title}</p>
            <p className="max-w-lg text-base text-white/80">{t.image.tagline}</p>
          </div>
        </section>
      )}

      {/* ── Form (Lenzro) ─────────────────────────────────────────────────── */}
      <div className="relative flex min-h-svh flex-col items-center justify-center overflow-y-auto p-6 md:p-10 lg:min-h-0">
        {/* Logo, back to the website */}
        <Link
          href={`/${lang}`}
          aria-label={t.home}
          className="absolute start-6 top-6 text-foreground md:top-5"
        >
          <Logo />
        </Link>

        {/* Language picker, top end of the form side, as on Amanat's auth screen.
            White fill: this page's background is the picker's usual grey. */}
        <LanguageSwitcher
          lang={lang}
          label={languageLabel}
          className="absolute end-6 top-6 z-30 md:top-5"
          triggerClassName="bg-white hover:bg-white focus-visible:bg-white"
        />

        {/* Form card, with Lenzro's quick swap between login and signup */}
        <div className="oneg-auth-card my-12 w-full max-w-105 rounded-3xl p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isSignup ? "signup" : "login"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {isSignup ? <SignupForm t={t} lang={lang} /> : <LoginForm t={t} lang={lang} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
