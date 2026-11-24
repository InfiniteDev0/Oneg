"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  HeartPulse,
  LayoutDashboard,
  Network,
} from "lucide-react";
import { WalletIcon } from "@/components/icons/wallet";
import { EyeTracker } from "@/components/lara/eye-tracker";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { navLinkClass } from "./nav-links";

// Icon tiles for the "Featured" column (icons can't be passed from the server, so they're named)
const FEATURED_ICONS = {
  ai: {}, // Lara: drawn with her face, see FeaturedColumn
  wallet: { Icon: WalletIcon, tile: "bg-gradient-to-br from-oneg-green to-[#1f9d6b]" },
  doctorDashboard: { Icon: LayoutDashboard, tile: "bg-gradient-to-br from-[#5b8def] to-oneg-blue" },
  verified: { Icon: BadgeCheck, tile: "bg-gradient-to-br from-oneg-cyan to-[#1f9d6b]" },
  hospitalDashboard: { Icon: Building2, tile: "bg-gradient-to-br from-[#7c6cf0] to-oneg-blue" },
  network: { Icon: Network, tile: "bg-gradient-to-br from-[#ff7aa8] to-[#e5484d]" },
};


// Desktop menu bar (lg and up). Menus with columns open a full-width panel under
// the navbar on hover or click; it closes on mouse-out, outside click, Escape or a link click.
export default function DesktopNav({ items }) {
  const [openKey, setOpenKey] = useState(null);
  const closeTimer = useRef(null);
  const rootRef = useRef(null);
  const reduce = useReducedMotion() ?? false;

  const cancelClose = () => clearTimeout(closeTimer.current);
  const openMenu = (key) => {
    cancelClose();
    setOpenKey(key);
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenKey(null), 160);
  };
  const close = () => {
    cancelClose();
    setOpenKey(null);
  };

  useEffect(() => {
    if (!openKey) return;
    const onKey = (e) => e.key === "Escape" && setOpenKey(null);
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenKey(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [openKey]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const active = items.find((item) => item.key === openKey && item.columns);

  return (
    <div ref={rootRef} onMouseLeave={closeSoon} className="ms-4 hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const isOpen = item.key === openKey;
          return (
            <li key={item.key}>
              {item.columns ? (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`mega-${item.key}`}
                  onMouseEnter={() => openMenu(item.key)}
                  onClick={() => (isOpen ? close() : openMenu(item.key))}
                  className={cn(navLinkClass, isOpen && "bg-field text-foreground")}
                >
                  {item.label}
                  <ChevronDown
                    className={cn("size-3.5 opacity-60 transition-transform duration-200", isOpen && "rotate-180")}
                  />
                </button>
              ) : (
                <Link href={item.href} onMouseEnter={close} className={navLinkClass}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {active && (
          <motion.div
            id={`mega-${active.key}`}
            onMouseEnter={cancelClose}
            // The panel itself unfolds downward from the navbar (a clip that opens from
            // the top) and fades in. The text inside never animates on its own, and
            // moving between menus swaps the contents without replaying this.
            initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0 0 -40px 0)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduce ? 0.1 : 0.28, ease: EASE_OUT }}
            className="absolute inset-x-0 top-full z-50 border-t border-border bg-navbar text-navbar-foreground shadow-[0_28px_40px_-24px_rgb(16_35_43/0.28)]"
          >
            <div className="mx-auto grid max-w-400 grid-cols-[1fr_1fr_1fr_1.5fr] gap-x-10 px-4 pt-8 pb-10 sm:px-6 xl:px-8">
              {active.columns.map((col) => (
                <MenuColumn key={col.title} column={col} onNavigate={close} />
              ))}
              {active.featured && <FeaturedColumn featured={active.featured} onNavigate={close} />}
              {active.spotlight && <SpotlightCard spotlight={active.spotlight} onNavigate={close} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColumnTitle({ children }) {
  return (
    <p
      className="mb-4 font-mono text-[0.8rem] tracking-[0.14em] text-muted-foreground uppercase rtl:font-sans rtl:text-[0.9rem] rtl:tracking-normal"
    >
      {children}
    </p>
  );
}

function MenuColumn({ column, onNavigate }) {
  return (
    <div>
      <ColumnTitle>{column.title}</ColumnTitle>
      <ul className="flex flex-col gap-1">
        {column.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className="-mx-2 block rounded-md px-2 py-1.5 text-[1rem] text-foreground transition-colors hover:bg-field"
            >
              {link.label}
            </Link>
          </li>
        ))}
        {column.seeAll && (
          <li className="mt-2">
            <Link
              href={column.seeAll.href}
              onClick={onNavigate}
              className="group inline-flex items-center gap-1 text-[1rem] text-primary hover:underline"
            >
              {column.seeAll.label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

function FeaturedColumn({ featured, onNavigate }) {
  return (
    <div className="col-start-4">
      <ColumnTitle>{featured.title}</ColumnTitle>
      <ul className="flex flex-col gap-3">
        {featured.items.map((item) => {
          const { Icon, tile } = FEATURED_ICONS[item.icon];
          return (
            <li key={item.href + item.title}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="-mx-2 flex items-center gap-4 rounded-xl px-2 py-2 transition-colors hover:bg-field"
              >
                {item.icon === "ai" ? (
                  // Lara's own face (black chip, white eyes that follow the pointer), not an icon
                  <span className="oneg-lara-face size-12 rounded-xl shadow-sm">
                    <EyeTracker size={48} follow={25} eyeScale={1.5} within="body" decorative label="Lara" />
                  </span>
                ) : (
                  <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-sm", tile)}>
                    <Icon className="size-6" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[1.05rem] text-foreground">
                    {item.title}
                    {item.badge && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[0.7rem] tracking-wider text-primary rtl:font-sans rtl:tracking-normal">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-[0.95rem] text-muted-foreground">{item.desc}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SpotlightCard({ spotlight, onNavigate }) {
  return (
    <div className="col-start-4">
      <ColumnTitle>{spotlight.title}</ColumnTitle>
      <div>
        <Link
          href={spotlight.href}
          onClick={onNavigate}
          className="group block rounded-2xl bg-field p-7 transition-colors hover:bg-field-focus"
        >
          <span className="grid size-12 place-items-center rounded-xl bg-red-50 text-red-600">
            <HeartPulse className="size-6" />
          </span>
          <span className="mt-5 block text-[1.35rem] leading-snug text-foreground">{spotlight.heading}</span>
          <span className="mt-5 inline-flex items-center gap-1 font-semibold text-foreground">
            {spotlight.cta}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
