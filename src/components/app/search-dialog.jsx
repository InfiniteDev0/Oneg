"use client";

// Search, as ClickUp's: Ctrl+K (or the bar's Search) opens one wide panel just
// under the top bar. The field ("Search, run a command, or ask a question…") with
// "Ask Lara" on the right (ClickUp's "Ask AI"); where to look (All, Oneg, Doctors…);
// what to look for (chips, then Filter and Sort); the commands and results; and a
// footer with back/forward, a tip and search settings.
// For now it searches the commands; doctors, records and the library join it when
// they exist in Supabase. Asking a question sends it to Lara.

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  AppWindow,
  ArrowDownUp,
  BookOpen,
  Bug,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Command,
  FileText,
  ListFilter,
  MoreHorizontal,
  PanelLeft,
  Pill,
  Settings,
  Stethoscope,
  UserSearch,
  Video,
  Wallet,
  Bell,
} from "lucide-react";
import { OPEN_LARA } from "@/components/lara/lara-chat";
import { OnegMark } from "@/components/landing/logo";
import { cn } from "@/lib/utils";
import { WorkspaceBadge } from "./app-icons";

function LaraMini() {
  return (
    <span className="oneg-lara-face size-[1.1rem] rounded-[5px]" aria-hidden="true">
      <span className="flex gap-[2px]">
        <span className="h-[5px] w-[3px] rounded-full bg-white" />
        <span className="h-[5px] w-[3px] rounded-full bg-white" />
      </span>
    </span>
  );
}

export function SearchDialog({ open, onOpenChange, t, lang, go, onToggleSidebar }) {
  const s = t.search;
  const c = s.commands;
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const askLara = (ask) => {
    onOpenChange(false);
    window.dispatchEvent(new CustomEvent(OPEN_LARA, { detail: { ask } }));
  };

  const COMMANDS = useMemo(
    () => [
      { id: "switch", icon: () => <WorkspaceBadge letter="H" className="size-5 rounded-[5px] bg-[#3f7be0] text-[0.7rem]" />, label: c.switchFamily, run: () => go("/family") },
      { id: "apps", icon: AppWindow, label: c.apps, run: () => go("/apps") },
      { id: "book", icon: CalendarCheck, label: c.book, run: () => go("/consultations") },
      { id: "doctor", icon: UserSearch, label: c.findDoctor, run: () => go("/doctors") },
      { id: "records", icon: ClipboardList, label: c.records, run: () => go("/records") },
      { id: "prescriptions", icon: Pill, label: c.prescriptions, run: () => go("/prescriptions") },
      { id: "wallet", icon: Wallet, label: c.wallet, run: () => go("/wallet") },
      { id: "reminder", icon: Bell, label: c.reminder, run: () => go("/reminders") },
      { id: "video", icon: Video, label: c.recordVideo, run: () => go("/record") },
      { id: "bug", icon: Bug, label: c.reportBug, run: () => go("/help/bug") },
      { id: "sidebar", icon: PanelLeft, label: c.toggleSidebar, run: () => onToggleSidebar() },
      { id: "lara", icon: LaraMini, label: c.askLara, run: () => askLara() },
      { id: "settings", icon: Settings, label: c.settings, run: () => go("/settings") },
      { id: "shortcuts", icon: Command, label: c.shortcuts, run: () => go("/shortcuts") },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c, go, onToggleSidebar]
  );

  const q = query.trim().toLowerCase();
  const results = q ? COMMANDS.filter((cmd) => cmd.label.toLowerCase().includes(q)) : COMMANDS;
  // Nothing matched: offer to ask Lara instead
  const rows = q && results.length === 0 ? [{ id: "ask", icon: LaraMini, label: s.askAbout.replace("{query}", query.trim()), run: () => askLara(query.trim()) }] : results;

  useEffect(() => setIndex(0), [query, tab]);
  useEffect(() => {
    if (!open) {
      setQuery("");
      setTab("all");
    }
  }, [open]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const run = (row) => {
    if (row.id !== "lara" && row.id !== "ask") onOpenChange(false);
    row.run();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(rows.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (rows[index]) run(rows[index]);
    }
  };

  const TABS = [
    { id: "all", label: s.tabs.all },
    { id: "oneg", label: s.tabs.oneg, icon: <OnegMark className="h-3 w-auto" /> },
    { id: "doctors", label: s.tabs.doctors, icon: <Stethoscope className="size-4 text-emerald-500" /> },
    { id: "hospitals", label: s.tabs.hospitals, icon: <Building2 className="size-4 text-orange-500" /> },
    { id: "pharmacies", label: s.tabs.pharmacies, icon: <Pill className="size-4 text-red-500" /> },
    { id: "library", label: s.tabs.library, icon: <BookOpen className="size-4 text-sky-500" /> },
  ];
  const CHIPS = [
    { icon: CalendarDays, label: s.chips.appointments },
    { icon: ClipboardList, label: s.chips.records },
    { icon: Pill, label: s.chips.prescriptions },
    { icon: FileText, label: s.chips.articles },
  ];
  const CHIP =
    "flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border px-2.5 text-[0.8125rem] text-foreground/85 transition-colors hover:bg-muted [&_svg]:size-3.5 [&_svg]:text-muted-foreground";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* ClickUp doesn't dim the page; the backdrop is only there to catch a click outside */}
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50" />
        <DialogPrimitive.Popup
          initialFocus={inputRef}
          className="fixed start-1/2 top-[2.75rem] z-50 flex max-h-[calc(100svh-4rem)] w-[min(46rem,calc(100vw-1.5rem))] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_24px_60px_rgba(0,0,0,0.35)] outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98] data-closed:animate-out data-closed:fade-out-0 rtl:translate-x-1/2"
        >
          <DialogPrimitive.Title className="sr-only">{s.label}</DialogPrimitive.Title>

          {/* The field, and Ask Lara */}
          <div className="flex items-center gap-3 ps-4 pe-2.5 pt-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={s.placeholder}
              aria-label={s.label}
              className="h-11 min-w-0 flex-1 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="button"
              onClick={() => askLara(query.trim() || undefined)}
              className="flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              {s.askLara}
              <LaraMini />
            </button>
          </div>

          {/* Where to look */}
          <div role="tablist" className="flex items-center gap-4 overflow-x-auto border-b border-border px-4 pt-1 [scrollbar-width:none]">
            {TABS.map((item, i) => (
              <span key={item.id} className="flex items-center gap-4">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "relative flex h-9 shrink-0 cursor-pointer items-center gap-1.5 text-sm transition-colors",
                    tab === item.id ? "font-semibold text-foreground" : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  {item.icon}
                  {item.label}
                  {tab === item.id && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />}
                </button>
                {i === 1 && <span aria-hidden className="h-5 w-px bg-border" />}
              </span>
            ))}
            <button type="button" className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <AppWindow className="size-4" />
              {s.tabs.apps}
            </button>
          </div>

          {/* What to look for */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 [scrollbar-width:none]">
            {CHIPS.map(({ icon: Icon, label }) => (
              <button key={label} type="button" className={CHIP}>
                <Icon />
                {label}
              </button>
            ))}
            <button type="button" aria-label={s.chips.more} className={cn(CHIP, "w-7 justify-center px-0")}>
              <MoreHorizontal />
            </button>
            <span aria-hidden className="mx-1.5 h-5 w-px shrink-0 bg-border" />
            <button type="button" className={CHIP}>
              <ListFilter />
              {s.filter}
            </button>
            <button type="button" className={CHIP}>
              <ArrowDownUp />
              {s.sort}
            </button>
          </div>

          {/* Commands and results */}
          <div ref={listRef} role="listbox" className="min-h-0 flex-1 overflow-y-auto px-2 pb-2" style={{ maxHeight: "min(24rem, calc(100svh - 14rem))" }}>
            {q && results.length === 0 && <p className="px-4 pt-3 pb-1 text-sm text-muted-foreground">{s.empty.replace("{query}", query.trim())}</p>}
            {rows.map((row, i) => {
              const Icon = row.icon;
              return (
                <button
                  key={row.id}
                  type="button"
                  role="option"
                  aria-selected={i === index}
                  data-index={i}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => run(row)}
                  className={cn(
                    "flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-start text-[0.9375rem] transition-colors",
                    i === index ? "bg-muted" : "hover:bg-muted/60"
                  )}
                >
                  <span className="grid size-4.5 shrink-0 place-items-center text-muted-foreground [&>svg]:size-4.5">
                    <Icon />
                  </span>
                  <span className="truncate">{row.label}</span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex h-10 shrink-0 items-center gap-3 border-t border-border ps-4 pe-2 text-xs text-muted-foreground">
            <button type="button" aria-label={s.back} className="cursor-pointer rounded p-0.5 hover:text-foreground">
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </button>
            <button type="button" aria-label={s.forward} className="cursor-pointer rounded p-0.5 hover:text-foreground">
              <ChevronRight className="size-4 rtl:rotate-180" />
            </button>
            <span className="flex items-center gap-1.5">
              {s.tip} —
              <kbd className="rounded-md border border-border px-1.5 py-0.5 font-sans text-xs text-foreground/80">Ctrl+/</kbd>
              {s.tipText}
            </span>
            <button type="button" aria-label={s.settings} onClick={() => run({ id: "settings", run: () => go("/settings") })} className="ms-auto grid size-8 cursor-pointer place-items-center rounded-md hover:bg-muted hover:text-foreground">
              <Settings className="size-4" />
            </button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
