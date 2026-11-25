"use client";

// Search, as ClickUp's, as a page: Ctrl+K (or the bar's Search) covers the main
// panel, split by VS Code's drag line where Home has it (the same remembered
// spot), as Bolt's: the search on the left, with no bar over it — first the
// top bar's own search (the round bar with Ask Lara), then where to look, what
// to look for, and the results — and the map on the right (OpenStreetMap, with
// you as the pulsing dot, flying to the area you filter by) under its own top bar: where you are (found from
// your browser, once you allow it; a click looks again), your search history,
// and ✕. The drag line between them is the search page's own. The app's top bar asks what you
// want to find meanwhile, in the search bar's place. The field ("Search, run a command, or ask a question…") with
// "Ask Lara" on the right (ClickUp's "Ask AI"); where to look (All, Oneg, Doctors…);
// what to look for (chips, then Filter and Sort); the commands and results; and a
// footer with back/forward, a tip and search settings. In the half-width panel
// the tabs and the chips don't fit, so each row scrolls sideways (the wheel
// works on them too), its edges fading where more is hidden.
// Oneg (the first tab, and everything in the app: posts, appointments, records,
// commands) searches the commands for now. Doctors, Hospitals, Pharmacies,
// Clinics and Nursing care each have their own filters and hand the search to
// Lara until providers are on Oneg; Library is coming (search-providers.jsx).
// The tab you're on is kept in the address too (&in=doctors).
// It closes with Esc, its ✕, Ctrl+K again, a command run, or going to another
// page. The app hands it its spot over the panel as `target`.
// Ask Lara (or a question nothing matched) brings Lara into the right pane, as
// she always looks, at its size; put away, the search is back.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
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
  X,
  Search,
  HeartPulse,
  HandHeart,
  History,
  LocateFixed,
  MapPin,
  Trash2,
} from "lucide-react";
import { OPEN_LARA, UNDOCK_LARA } from "@/components/lara/lara-chat";
import { OnegMark } from "@/components/landing/logo";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { useLocation } from "@/lib/use-location";
import { cn } from "@/lib/utils";
import { WorkspaceBadge } from "./app-icons";
import { SplitPane } from "./split-pane";
import { areaLabel, describeFilters, emptyFilters, isProviderTab, ProviderEmpty, ProviderFilters } from "./search-providers";
import { HealthMap } from "./health-map";
import { areaView } from "@/lib/areas";

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

// A row that scrolls sideways: the wheel moves it, and its ends fade while
// there's more past them (either way round, for Arabic too).
function ScrollRow({ className, children, ...props }) {
  const ref = useRef(null);
  const [more, setMore] = useState({ start: false, end: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const gone = Math.abs(el.scrollLeft);
      const room = el.scrollWidth - el.clientWidth;
      setMore({ start: gone > 1, end: room - gone > 1 });
    };
    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const rtl = getComputedStyle(el).direction === "rtl";
      el.scrollLeft += rtl ? -e.deltaY : e.deltaY;
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      el.removeEventListener("wheel", onWheel);
      watch.disconnect();
    };
  }, []);
  const fade = (side) => (side ? "transparent, #000 1.5rem" : "#000, #000");
  const mask = `linear-gradient(to var(--fade-to, right), ${fade(more.start)}, ${more.end ? "#000 calc(100% - 1.5rem), transparent" : "#000, #000"})`;
  return (
    <div
      ref={ref}
      {...props}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      className={cn("overflow-x-auto overscroll-x-contain [scrollbar-width:none] rtl:[--fade-to:left] [&::-webkit-scrollbar]:hidden", className)}
    >
      {children}
    </div>
  );
}

// What you've looked for, newest first, kept in this browser
const HISTORY = "oneg.search.history";
function readHistory() {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function writeHistory(list) {
  try {
    localStorage.setItem(HISTORY, JSON.stringify(list));
  } catch {
    // not remembered
  }
}

export function SearchPage({ open, onOpenChange, t, lang, go, onToggleSidebar, target, resizeLabel }) {
  const s = t.search;
  const c = s.commands;
  // what you typed comes back from the address after a refresh (&q=)
  const [query, setQuery] = useState(() => (typeof window === "undefined" ? "" : (new URLSearchParams(window.location.search).get("q") ?? "")));
  const [tab, setTab] = useState(() => (typeof window === "undefined" ? "oneg" : (new URLSearchParams(window.location.search).get("in") ?? "oneg")));
  // the provider tabs' filters; a new tab starts fresh
  const [filters, setFilters] = useState(emptyFilters);
  useEffect(() => setFilters(emptyFilters()), [tab]);
  // the tab you are on is always in sight in its sideways row
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() =>
      document.querySelector("section[role=dialog] [role=tab][aria-selected=true]")?.scrollIntoView({ block: "nearest", inline: "nearest" })
    );
    return () => cancelAnimationFrame(id);
  }, [tab, open]);
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // where you are, looked for once the page opens
  const where = useLocation(lang, open);
  const l = s.location;
  const placeText =
    where.status === "finding" && !where.place ? l.finding : where.place?.label ?? (where.status === "denied" ? l.denied : l.set);

  // your searches: kept when a command runs (what you typed, or the command)
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => {
    if (open) setHistory(readHistory());
  }, [open]);
  const remember = (text) => {
    const next = [text, ...readHistory().filter((h) => h !== text)].slice(0, 20);
    writeHistory(next);
    setHistory(next);
  };

  // Lara in the right pane: what to ask her, and the place she's handed
  const [lara, setLara] = useState(null);
  const [dock, setDock] = useState(null);
  const askLara = (ask) => setLara({ ask });
  useEffect(() => {
    if (!lara || !dock) return;
    window.dispatchEvent(new CustomEvent(OPEN_LARA, { detail: { ask: lara.ask, dock, onClose: () => setLara(null) } }));
  }, [lara, dock]);
  // closed with Lara in it: she goes too
  useEffect(() => {
    if (open || !lara) return;
    window.dispatchEvent(new CustomEvent(UNDOCK_LARA));
    setLara(null);
  }, [open, lara]);

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
  // closed: cleared for next time (only on closing, not before the first open)
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) {
      setQuery("");
      setTab("oneg");
    }
    wasOpen.current = open;
  }, [open]);
  // what you type is kept in the address, so a refresh keeps it
  useEffect(() => {
    if (!open) return;
    const url = new URL(window.location.href);
    const typed = query.trim();
    const inTab = tab === "oneg" ? "" : tab;
    if ((url.searchParams.get("q") ?? "") === typed && (url.searchParams.get("in") ?? "") === inTab) return;
    if (typed) url.searchParams.set("q", typed);
    else url.searchParams.delete("q");
    if (inTab) url.searchParams.set("in", inTab);
    else url.searchParams.delete("in");
    window.history.replaceState(null, "", `${url.pathname}${url.search.replace(/search=(?=&|$)/, "search")}${url.hash}`);
  }, [open, query, tab]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);
  // opened: the field takes the typing
  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);
  // going to another page puts it away
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  const run = (row) => {
    remember(query.trim() || row.label);
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
      if (tab !== "oneg") return askProviders();
      if (rows[index]) run(rows[index]);
    }
  };

  const TABS = [
    { id: "oneg", label: s.tabs.oneg, icon: <OnegMark className="h-3 w-auto" /> },
    { id: "doctors", label: s.tabs.doctors, icon: <Stethoscope className="size-4 text-emerald-500" /> },
    { id: "hospitals", label: s.tabs.hospitals, icon: <Building2 className="size-4 text-orange-500" /> },
    { id: "pharmacies", label: s.tabs.pharmacies, icon: <Pill className="size-4 text-red-500" /> },
    { id: "clinics", label: s.tabs.clinics, icon: <HeartPulse className="size-4 text-teal-500" /> },
    { id: "nursing", label: s.tabs.nursing, icon: <HandHeart className="size-4 text-pink-500" /> },
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

  const askProviders = () => {
    const p = s.providers;
    const needs = [describeFilters(tab, filters, s), query.trim()].filter(Boolean).join(", ");
    remember(query.trim() || needs || TABS.find((x) => x.id === tab)?.label);
    askLara(
      p.ask[tab]
        .replace("{place}", where.place?.label ?? areaLabel(filters.area, p))
        .replace("{needs}", needs ? p.needs.replace("{list}", needs) : "")
        .trim()
    );
  };
  const onOneg = tab === "oneg";
  // the map looks at the area you picked, else at you, else at Kenya
  const me = where.place?.lat != null ? [where.place.lat, where.place.lon] : null;
  const mapView = filters.area ? areaView(filters.area) : me ? { center: me, zoom: 13 } : areaView(null);

  if (!open || !target) return null;

  const panel = (
        <div className="flex h-full min-h-0 flex-col">
          {/* The top bar's own search: the round bar, the field, and its Ask Lara pill */}
          <div className="px-3 pt-3 pb-1">
          <div className="oneg-search-bar flex h-10 w-full items-center gap-2 rounded-full ps-3.5 pe-1">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={s.placeholders?.[tab] ?? s.placeholder}
              aria-label={s.label}
              className="h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted-foreground/70"
            />
            <button type="button" onClick={() => (onOneg ? askLara(query.trim() || undefined) : askProviders())} className="oneg-lara-pill h-8 shrink-0 cursor-pointer">
              <span className="flex h-full items-center gap-1.5 ps-3 pe-2 text-[0.8125rem] font-medium text-muted-foreground">
                {s.askLara}
                <LaraMini />
              </span>
            </button>
          </div>
          </div>

          {/* Where to look */}
          <ScrollRow role="tablist" className="flex items-center gap-4 border-b border-border px-4 pt-1">
            {TABS.map((item, i) => (
              <span key={item.id} className="flex shrink-0 items-center gap-4">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "relative flex h-9 shrink-0 cursor-pointer items-center gap-1.5 text-sm whitespace-nowrap transition-colors",
                    tab === item.id ? "font-semibold text-foreground" : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  {item.icon}
                  {item.label}
                  {tab === item.id && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />}
                </button>
                {i === 0 && <span aria-hidden className="h-5 w-px bg-border" />}
              </span>
            ))}
            <button type="button" className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground">
              <AppWindow className="size-4" />
              {s.tabs.apps}
            </button>
          </ScrollRow>

          {/* What to look for: Oneg's kinds, or a provider tab's filters */}
          {isProviderTab(tab) && (
            <ScrollRow className="flex items-center gap-1.5 px-3 py-2">
              <ProviderFilters tab={tab} filters={filters} onChange={setFilters} s={s} />
            </ScrollRow>
          )}
          {onOneg && (
          <ScrollRow className="flex items-center gap-1.5 px-3 py-2">
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
          </ScrollRow>
          )}

          {/* Commands and results */}
          <div ref={listRef} role="listbox" className="scrollbar-pill min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {!onOneg && <ProviderEmpty tab={tab} icon={TABS.find((x) => x.id === tab)?.icon} s={s} onAsk={askProviders} />}
            {onOneg && q && results.length === 0 && <p className="px-4 pt-3 pb-1 text-sm text-muted-foreground">{s.empty.replace("{query}", query.trim())}</p>}
            {onOneg && rows.map((row, i) => {
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
        </div>
  );

  return createPortal(
    <section
      role="dialog"
      aria-label={s.label}
      onKeyDown={(e) => {
        // with Lara in it, Esc is hers (she goes, the search comes back)
        if (e.key === "Escape" && !lara) {
          e.stopPropagation();
          onOpenChange(false);
        }
      }}
      className="absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-border bg-canvas text-foreground duration-150 animate-in fade-in-0"
    >
      <SplitPane
        storageKey="oneg.app.search-split"
        initial={40}
        label={resizeLabel}
        startClassName="lg:pe-0"
        endClassName="hidden border-t-0 pt-0 lg:flex lg:ps-0"
        start={lara ? <div ref={setDock} className="flex min-h-0 flex-1 flex-col" /> : panel}
        end={
          <>
            {/* The map's top bar: where you are; your history and ✕ */}
            <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border px-3">
              <button
                type="button"
                onClick={where.locate}
                title={l.refresh}
                className="flex h-8 min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                {where.status === "finding" ? (
                  <LocateFixed className="size-4 shrink-0 animate-pulse text-action" />
                ) : (
                  <MapPin className={cn("size-4 shrink-0", where.place ? "text-action" : "text-muted-foreground")} />
                )}
                <span className="truncate font-semibold">{placeText}</span>
              </button>

              <span className="flex-1" />
              <MorphPopover open={historyOpen} onOpenChange={setHistoryOpen}>
                <MorphPopoverTrigger>
                  <button
                    type="button"
                    className="flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <History className="size-4" />
                    {s.history.title}
                  </button>
                </MorphPopoverTrigger>
                <MorphPopoverContent side="bottom" align="end" sideOffset={6} radius={12} className="flex w-72 flex-col gap-0.5 border-0 p-1">
                  {history.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">{s.history.empty}</p>
                  ) : (
                    <>
                      {history.map((text) => (
                        <button
                          key={text}
                          type="button"
                          onClick={() => {
                            setQuery(text);
                            setHistoryOpen(false);
                            setLara(null);
                            window.setTimeout(() => inputRef.current?.focus(), 0);
                          }}
                          className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-start text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
                        >
                          <History className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{text}</span>
                        </button>
                      ))}
                      <span className="mx-2 my-1 h-px bg-border" />
                      <button
                        type="button"
                        onClick={() => {
                          writeHistory([]);
                          setHistory([]);
                        }}
                        className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-start text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Trash2 className="size-3.5 shrink-0" />
                        {s.history.clear}
                      </button>
                    </>
                  )}
                </MorphPopoverContent>
              </MorphPopover>
              <button
                type="button"
                aria-label={s.close}
                title={s.close}
                onClick={() => onOpenChange(false)}
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <HealthMap view={mapView} me={me} meLabel={where.place?.label} />
          </>
        }
      />
    </section>,
    target
  );
}
