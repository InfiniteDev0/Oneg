import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CheckBadgeIcon } from "@/components/icons/check-badge";
import { HeartPulseGradientIcon } from "@/components/icons/heart-pulse-gradient";

// ─── Hero images ────────────────────────────────────────────────────────────
// Paste an image URL between the quotes to fill a slot. Empty slots show a grey box.
// The images appear on laptop-width screens and up (1024px+), smaller below 1280px, so they never cover the text.
const HERO_IMAGES = {
  leftTop: "/hero.jpg", // from web/frontend/public/hero1.jpg
  leftBottom: "/hero2.jpg",
  rightTop: "/hero3.jpg",
  rightBottom: "/hero1.jpg",
};

export default function Hero({ lang, dict }) {
  const t = dict.hero;
  const to = (path) => `/${lang}${path}`;

  return (
    // Spacing and headline size follow the screen height (vh), so the whole hero
    // fits on the first screen without scrolling.
    <section className="relative overflow-hidden px-4 pt-[clamp(1.5rem,6vh,3.5rem)] pb-12 sm:px-6">
      {/* Side images (decorative). Slots are anchored to the physical left/right edges. */}
      {/* smaller on laptops (lg), full size on wide screens (xl) */}
      <HeroImage src={HERO_IMAGES.leftTop} className="top-0 left-8 h-56 w-40 xl:left-14 xl:h-80 xl:w-58" />
      <HeroImage src={HERO_IMAGES.leftBottom} className="top-40 left-0 h-56 w-26 xl:top-58 xl:h-80 xl:w-38" />
      <HeroImage src={HERO_IMAGES.rightTop} className="top-6 right-0 h-44 w-46 xl:top-9 xl:h-64 xl:w-66" />
      <HeroImage src={HERO_IMAGES.rightBottom} className="top-50 right-0 h-46 w-30 xl:top-73 xl:h-66 xl:w-42" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <TryPill href={to("/symptom-check")} label={t.tryPill} />

        <h1 className="mt-[clamp(1rem,4vh,2rem)] text-[clamp(2.6rem,min(6.2vw,10vh),5.6rem)] leading-[1.02] font-normal tracking-[-0.035em] text-balance rtl:leading-tight rtl:tracking-normal">
          <span className="block text-[#8b959e]">{t.titleTop}</span>
          <span className="block text-foreground">{t.titleMain}</span>
        </h1>

        <p className="mt-[clamp(0.75rem,3vh,1.5rem)] max-w-xl text-[1.05rem] leading-relaxed text-foreground/80 text-pretty">
          {t.body}
        </p>

        <div className="mt-[clamp(1rem,4vh,2rem)] flex flex-wrap items-center justify-center gap-3">
          <Link
            href={to("/auth?mode=signup")}
            className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-[1rem] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.primaryCta}
          </Link>
          <Link
            href={to("/doctors")}
            className="inline-flex h-10 items-center rounded-md bg-field-focus px-5 text-[1rem] text-foreground transition-colors hover:bg-[#d8dde1] dark:hover:bg-[#3a3734]"
          >
            {t.secondaryCta}
          </Link>
        </div>

        <p className="mt-[clamp(0.75rem,3vh,1.5rem)] inline-flex items-center gap-2 text-[1rem] text-foreground/65">
          <CheckBadgeIcon className="size-5 shrink-0 text-foreground" />
          {t.note}
        </p>
      </div>
    </section>
  );
}

// One image slot: the photo if a URL is set, otherwise a grey placeholder box.
function HeroImage({ src, className }) {
  return (
    <div aria-hidden="true" className={`absolute hidden overflow-hidden bg-oneg-mist lg:block ${className}`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      )}
    </div>
  );
}

// Small pill whose border is a spinning gradient (styles: .oneg-gradient-pill in globals.css)
function TryPill({ href, label }) {
  return (
    <Link href={href} className="oneg-gradient-pill group">
      <span className="inline-flex items-center gap-1.5 py-1.5 ps-4 pe-2.5 text-[0.95rem] font-semibold text-foreground">
        {label}
        <HeartPulseGradientIcon className="size-4" />
        <ChevronRight className="size-4 text-foreground/60 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
      </span>
    </Link>
  );
}
