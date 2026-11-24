"use client";

// The side panel, copied from the Lenzro project's HomeSidebar (C:\dev\Lenzro,
// features/workspace/components/sidebars): a 280px card with p-4, the "Add" header
// (the page name and a split + ▾ button that opens Create), then collapsible
// sections of rows, and Settings / Pharmacy / Trash at the bottom.
// Rows as Lenzro's SidebarRow: a 16px coloured icon in a 20px box that turns into
// › on hover, 13px medium text, and "…" and + on the right on hover.
// Oneg changes: health pages instead of Lenzro's, words in four languages,
// Lenzro's zinc colours swapped for Oneg's tokens so light mode works too, and
// the menus are beUI's morphing popovers.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Bell,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  EyeOff,
  FileText,
  FlaskConical,
  HeartHandshake,
  LayoutDashboard,
  Link2,
  MoreHorizontal,
  NotebookPen,
  Pill,
  Plus,
  Settings,
  Settings2,
  ShoppingBag,
  Star,
  Stethoscope,
  Trash2,
  Wallet,
} from "lucide-react";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

const POP_ROW =
  "flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-1.5 text-start text-[13px] font-medium outline-none transition-colors hover:bg-muted focus-visible:bg-muted [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground";

/* ── Lenzro's Add: the header with the split create button ── */
function Add({ s, go }) {
  const [open, setOpen] = useState(false);
  const c = s.create;
  const pick = (path) => {
    setOpen(false);
    go(path);
  };
  const Item = ({ icon: Icon, label, sub, path, color }) => (
    <button type="button" onClick={() => pick(path)} className="group flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-start transition-colors hover:bg-muted">
      <span className="flex items-center gap-3">
        <Icon className={cn("size-4 text-muted-foreground group-hover:text-foreground", color)} />
        <span className="text-sm font-medium">{label}</span>
      </span>
      {sub && <span className="mt-0.5 ps-7 text-[11px] text-muted-foreground">{sub}</span>}
    </button>
  );

  return (
    <div className="sticky top-0 z-20">
      <div className="flex items-center justify-between px-2 pb-2">
        <h1 className="text-sm text-foreground">{s.title}</h1>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <div className="mx-0.5 h-4 w-px bg-border" />
          <MorphPopover open={open} onOpenChange={setOpen}>
            <MorphPopoverTrigger>
              <button
                type="button"
                aria-label={s.add}
                className="flex h-6 cursor-pointer items-center overflow-hidden rounded-sm border border-border bg-background transition-colors hover:text-foreground"
              >
                <span className="flex h-full items-center px-1">
                  <Plus className="size-3.5" />
                </span>
                <span className="flex h-full items-center px-1">
                  <ChevronDown className="size-3" />
                </span>
              </button>
            </MorphPopoverTrigger>
            <MorphPopoverContent side="bottom" align="end" sideOffset={8} radius={12} className="w-72 p-1.5">
              <p className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">{c.heading}</p>
              <Item icon={CalendarCheck} label={c.appointment} path="/consultations" />
              <Item icon={Bell} label={c.reminder} path="/reminders" />
              <div className="my-1.5 h-px bg-border" />
              <Item icon={NotebookPen} label={c.note} sub={c.noteSub} path="/notepad" />
              <Item icon={FileText} label={c.record} sub={c.recordSub} path="/records" />
              <Item icon={HeartHandshake} label={c.family} sub={c.familySub} path="/family" />
              <div className="my-1.5 h-px bg-border" />
              <Item icon={Settings2} label={c.customize} path="/settings" />
            </MorphPopoverContent>
          </MorphPopover>
        </div>
      </div>
      <div className="h-px bg-border" />
    </div>
  );
}

/* ── Lenzro's SidebarSection: a title that folds its rows away ── */
function Section({ title, s, onAdd, children }) {
  const [open, setOpen] = useState(true);
  const [menu, setMenu] = useState(false);
  return (
    <div className="group/section mt-2">
      <div className="flex cursor-default items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-foreground/5">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex cursor-pointer items-center gap-2">
          <ChevronDown className={cn("size-3.5 text-muted-foreground/70 transition-transform duration-200 hover:text-foreground", !open && "-rotate-90 rtl:rotate-90")} />
          <h3 className="text-[11px] font-semibold tracking-widest text-muted-foreground">{title}</h3>
        </button>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/section:opacity-100 has-aria-expanded:opacity-100">
          <MorphPopover open={menu} onOpenChange={setMenu}>
            <MorphPopoverTrigger>
              <button type="button" aria-label={s.sectionMenu} className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <MoreHorizontal className="size-3.5" />
              </button>
            </MorphPopoverTrigger>
            <MorphPopoverContent side="right" align="start" sideOffset={10} radius={10} className="w-56 p-1.5">
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  setOpen(false);
                }}
                className={POP_ROW}
              >
                <EyeOff />
                {s.hide}
              </button>
            </MorphPopoverContent>
          </MorphPopover>
          <Tooltip>
            <TooltipTrigger
              render={<button type="button" onClick={onAdd} aria-label={s.addPage} className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" />}
            >
              <Plus className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={6}>
              {s.addPage}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="mt-0.5 space-y-0.5 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Lenzro's SidebarRow ── */
function Row({ icon: Icon, label, href, color, active, s }) {
  const [menu, setMenu] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(`${window.location.origin}${href}`).catch(() => {});
    setMenu(false);
  };
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/row flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-all",
        active ? cn(color, "bg-accent") : "text-muted-foreground hover:bg-accent"
      )}
    >
      <span className="flex items-center gap-3 overflow-hidden">
        <span className="relative flex size-5 shrink-0 items-center justify-center">
          <span className="flex items-center justify-center group-hover/row:hidden">
            <Icon className={cn("size-4", active ? color : "text-muted-foreground group-hover/row:text-foreground")} />
          </span>
          <span className="hidden items-center justify-center duration-200 group-hover/row:flex animate-in fade-in zoom-in-75">
            <ChevronRight className="size-3.5 text-muted-foreground rtl:rotate-180" />
          </span>
        </span>
        <span className={cn("truncate text-[13px] font-medium", !active && "group-hover/row:text-foreground")}>{label}</span>
      </span>

      <span
        className="flex items-center opacity-0 transition-opacity group-hover/row:opacity-100 has-aria-expanded:opacity-100"
        onClick={(e) => e.preventDefault()}
      >
        <MorphPopover open={menu} onOpenChange={setMenu}>
          <MorphPopoverTrigger>
            <button type="button" aria-label={s.rowMenu.more} className="cursor-pointer rounded p-1 transition-colors hover:bg-accent">
              <MoreHorizontal className="size-3.5" />
            </button>
          </MorphPopoverTrigger>
          <MorphPopoverContent side="right" align="start" sideOffset={10} radius={10} className="w-60 p-1">
            <p className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{s.rowMenu.page}</p>
            <button type="button" onClick={() => setMenu(false)} className={POP_ROW}>
              <Star />
              {s.rowMenu.favorite}
            </button>
            <div className="mx-1 my-1 h-px bg-border" />
            <button type="button" onClick={copy} className={POP_ROW}>
              <Link2 />
              {s.rowMenu.copyLink}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenu(false);
                window.open(href, "_blank", "noopener");
              }}
              className={POP_ROW}
            >
              <ArrowUpRight />
              <span className="flex-1">{s.rowMenu.newTab}</span>
              <span className="text-[11px] text-muted-foreground">Ctrl+Shift+Enter</span>
            </button>
          </MorphPopoverContent>
        </MorphPopover>
        <Tooltip>
          <TooltipTrigger render={<button type="button" aria-label={s.addInside} className="cursor-pointer rounded p-1 transition-colors hover:bg-accent" />}>
            <Plus className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={6}>
            {s.addInside}
          </TooltipContent>
        </Tooltip>
      </span>
    </Link>
  );
}

export function SidePanel({ t, lang, go }) {
  const s = t.side;
  const pathname = usePathname();
  const base = `/${lang}/app`;
  const isActive = (path) => (path === "" ? pathname === base : pathname.startsWith(`${base}${path}`));

  const PAGES = [
    { icon: LayoutDashboard, label: s.items.dashboard, path: "", color: "text-cyan-500" },
    { icon: CalendarDays, label: s.items.appointments, path: "/appointments", color: "text-purple-500" },
    { icon: Stethoscope, label: s.items.consultations, path: "/consultations", color: "text-emerald-500" },
    { icon: ClipboardList, label: s.items.records, path: "/records", color: "text-orange-500" },
    { icon: Pill, label: s.items.prescriptions, path: "/prescriptions", color: "text-red-500" },
    { icon: Wallet, label: s.items.wallet, path: "/wallet", color: "text-pink-500" },
  ];
  const FAVORITES = [
    { icon: FlaskConical, label: s.favs.labs, path: "/records/blood-tests" },
    { icon: Star, label: s.favs.plan, path: "/care-plan" },
  ];
  const BOTTOM = [
    { icon: Settings, label: s.settings, path: "/settings" },
    { icon: ShoppingBag, label: s.marketplace, path: "/pharmacy" },
    { icon: Trash2, label: s.trash, path: "/trash" },
  ];

  return (
    <div className="h-full w-[280px] p-4">
      <aside className="relative flex h-full w-full flex-col overflow-hidden">
        <Add s={s} go={go} />
        <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto">
          <Section title={s.pages} s={s} onAdd={() => go("/notepad")}>
            {PAGES.map((p) => (
              <Row key={p.path} icon={p.icon} label={p.label} href={`${base}${p.path}`} color={p.color} active={isActive(p.path)} s={s} />
            ))}
          </Section>
          <div className="mt-2 h-px bg-border" />
          <Section title={s.favorites} s={s} onAdd={() => go("/records")}>
            {FAVORITES.map((p) => (
              <Row key={p.path} icon={p.icon} label={p.label} href={`${base}${p.path}`} color="text-yellow-500" active={isActive(p.path)} s={s} />
            ))}
          </Section>
          <div className="mt-2 h-px bg-border" />
          <nav className="mt-2 flex flex-col gap-1">
            {BOTTOM.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                href={`${base}${path}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-1.5 text-[13px] font-medium text-foreground/90 transition-all",
                  isActive(path) ? "bg-accent" : "hover:bg-foreground/5"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
