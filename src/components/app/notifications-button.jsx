"use client";

// The bell, with the unread count, and the notifications sheet it opens —
// Barista's (features/notifications/notifications-sheet), ported whole:
//   · the ringing bell with the count in red; N opens it from anywhere; the
//     browser tab says so too ("(3) Oneg" and a red dot on its icon)
//   · the page blurs behind a floating panel in Barista's pale sage (black in
//     dark mode) that slides in from the edge
//   · its title switches between Notifications and Reminders; Clear all, Mark
//     all as read and ✕ beside it
//   · the notifications in an animated list — cards scale in as they scroll
//     into view, the edges fade — under Today and Earlier, unread first; each
//     card drawn like a goey toast (its icon and title in a pill flowing into
//     the body, label–value rows with when, the toast's round button)
//   · on a computer, drag a card to show Clear or Open; on a phone, swipe it
//     right to clear or left to open; the arrow keys, Enter and Delete work too
//   · clearing one, or all, can be undone from the toast
// What's in it, all of it true: health alerts (an outbreak in today's real
// health news, /api/health-feed; its button asks Lara), Welcome, and your
// health profile. Reminders join from Supabase; read and cleared are kept in
// this browser.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { AlarmClock, BellOff, Check, CheckCheck, ChevronDown, ClipboardList, PartyPopper, Siren, X } from "lucide-react";
import { gooeyToast } from "goey-toast";
import { AnimatedList } from "@/components/motion/animated-list";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { OPEN_LARA } from "@/components/lara/lara-chat";
import { useTabBadge } from "@/lib/tab-badge";
import { cn } from "@/lib/utils";
import { TOPICS } from "./feed-sidebar";
import { SwipeNotification, SwipeReveal } from "./notification-swipe";
import { BAR_ICON, BarTip } from "./top-bar";

const READ = "oneg.notifications.read";
const CLEARED = "oneg.notifications.cleared";
const SINCE = "oneg.notifications.since";
/** How long the sheet takes to slide away — the next thing happens after it has. */
const SHEET_CLOSE_MS = 300;

// Each kind in its own colour, so the pill says what it's about at a glance;
// `cta` is its button, tinted like a goey toast's action button (Barista's KINDS)
const KINDS = {
  welcome: { icon: PartyPopper, tone: "text-cyan-600 dark:text-cyan-400", cta: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:hover:bg-cyan-500/25" },
  profile: { icon: ClipboardList, tone: "text-blue-600 dark:text-blue-400", cta: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25" },
  alert: { icon: Siren, tone: "text-red-600 dark:text-red-400", cta: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25" },
};

// Barista's bell, ringing (Glyphs.tsx BellRingGlyph)
function BellRingGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.52302 1.30256c0.93749 -0.81564 2.35868 -0.716867 3.17428 0.22062 0.8157 0.93749 0.7169 2.35868 -0.2206 3.17432 -3.46434 3.01412 -5.81837 7.4263 -6.23439 12.4869 -0.10181 1.2384 -1.18831 2.1599 -2.42678 2.0581 -1.23846 -0.1018 -2.159898 -1.1883 -2.058087 -2.4268C1.27059 10.5736 4.18198 5.07942 8.52302 1.30256Zm27.77948 0.22062c0.8156 -0.937487 2.2368 -1.03626 3.1743 -0.22062 4.341 3.77686 7.2524 9.27104 7.7656 15.51314 0.1018 1.2385 -0.8196 2.325 -2.0581 2.4268 -1.2385 0.1018 -2.325 -0.8197 -2.4268 -2.0581 -0.416 -5.0606 -2.77 -9.47278 -6.2344 -12.4869 -0.9375 -0.81564 -1.0363 -2.23683 -0.2206 -3.17432ZM23.9999 3.5c7.9182 0 14.5194 6.05958 15.1956 13.9489l0.4791 5.5894c0.2139 2.4951 1.0105 4.9053 2.3257 7.0365l1.4711 2.3837c1.4773 2.3937 0.6715 4.8664 -2.1168 5.2373 -3.1881 0.4241 -8.5121 0.8042 -17.3547 0.8042 -8.8426 0 -14.16656 -0.3801 -17.35475 -0.8042 -2.78827 -0.3709 -3.59405 -2.8436 -2.1168 -5.2373l1.47113 -2.3837c1.31523 -2.1312 2.11184 -4.5414 2.32571 -7.0365l0.47909 -5.5894C9.48051 9.55958 16.0817 3.5 23.9999 3.5Zm0 38c-3.2509 0 -6.0435 -0.0509 -8.4431 -0.1372C17.1373 44.4145 20.3241 46.5 23.998 46.5c3.6738 0 6.8606 -2.0854 8.4411 -5.1371 -2.3988 0.0863 -5.1901 0.1371 -8.4392 0.1371Z"
      />
    </svg>
  );
}

function readSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]"));
  } catch {
    return new Set();
  }
}
function writeSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set].slice(-300)));
  } catch {
    // not remembered
  }
}

const isoDay = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

// "Today", "Yesterday", "3 days ago" (Barista's whenLabel)
function whenLabel(date, today, n) {
  const days = daysBetween(today, date);
  if (days === 0) return n.today;
  if (days === -1) return n.yesterday;
  return n.daysAgo.replace("{n}", Math.abs(days));
}

// Outbreaks in this week's news: one alert each, dated by its newest story
function healthAlerts(posts, n, topics) {
  return TOPICS.filter((topic) => topic.kind === "outbreaks")
    // only this week's news is an alert
    .map((topic) => ({
      topic,
      stories: posts.filter((p) => Date.now() - Date.parse(p.publishedAt) < 7 * 86400000 && topic.match.test(`${p.title} ${p.text}`)),
    }))
    .filter(({ stories }) => stories.length > 0)
    .map(({ topic, stories }) => {
      const name = topics?.[topic.key] ?? topic.key;
      const day = isoDay(stories[0].publishedAt);
      return {
        id: `alert:${topic.key}:${day}`,
        kind: "alert",
        date: day,
        title: n.alert.title.replace("{topic}", name),
        details: [
          { label: n.alert.inNews, value: stories.length === 1 ? n.alert.story : n.alert.stories.replace("{n}", stories.length) },
          { label: n.alert.latest, value: stories[0].source.name },
        ],
        action: n.alert.action,
        ask: n.alert.ask.replace("{topic}", name),
      };
    });
}

/**
 * One notification, drawn like a goey toast (Barista's NotificationCard): the
 * icon and title in a pill that flows into the body with a soft curve, the
 * details as label–value rows with when beside them, then the toast's rounded
 * action button. Unread ones carry a dot; read ones fade back but keep their colour.
 */
function NotificationCard({ item, read, selected, today, n, onOpen }) {
  const { icon: Icon, tone, cta } = KINDS[item.kind];
  return (
    // the shadow goes round the pill and the body together, like the toast's
    <div className={cn("transition-[opacity,filter]", selected ? "drop-shadow-[0_6px_16px_rgba(0,0,0,0.12)]" : "drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)]", read && "opacity-60")}>
      <div className={cn("relative flex h-8.5 w-fit max-w-[calc(100%-1rem)] items-center gap-2 rounded-t-[1.0625rem] bg-card ps-2.5 pe-3", tone)}>
        <Icon className="size-4.5 shrink-0" />
        <span className="truncate text-[0.8125rem] leading-none font-bold">{item.title}</span>
        {!read && <span aria-label={n.unread} className="size-1.5 shrink-0 rounded-full bg-current" />}
        {/* the curve from the pill's side down into the body's top edge */}
        <span aria-hidden className="absolute start-full bottom-0 size-3.5 bg-[radial-gradient(circle_at_100%_0,transparent_14px,var(--color-card)_14.5px)] rtl:-scale-x-100" />
      </div>
      <div className="rounded-2xl rounded-ss-none bg-card px-3 pt-3 pb-3">
        <div className="flex items-start gap-3">
          <dl className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[0.8125rem] leading-tight">
            {item.details.map(({ label, value }) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="truncate text-end font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          <span className="shrink-0 text-[0.6875rem] leading-tight whitespace-nowrap text-muted-foreground">{whenLabel(item.date, today, n)}</span>
        </div>
        <button
          type="button"
          onClick={onOpen}
          // grabbing the card to swipe it shouldn't pick up the button instead
          draggable={false}
          className={cn("mt-3 block w-full cursor-pointer rounded-full px-5 py-2.5 text-center text-[0.8125rem] font-bold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-current/30", cta)}
        >
          {item.action}
        </button>
      </div>
    </div>
  );
}

const HEADER_BUTTON =
  "grid size-9 cursor-pointer place-items-center rounded-lg text-foreground outline-none transition-colors hover:bg-black/5 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-white/10 [&_svg]:size-5";

export function NotificationsButton({ t, lang }) {
  const n = t.notifications;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // the panel's two lists, switched from its title (as Barista's)
  const [view, setView] = useState("notifications");
  const [viewMenu, setViewMenu] = useState(false);
  const [read, setRead] = useState(() => new Set());
  const [cleared, setCleared] = useState(() => new Set());
  const [posts, setPosts] = useState([]);
  const [since, setSince] = useState(() => isoDay());
  const [isMobile, setIsMobile] = useState(false);
  // computers: the one card slid open to show its Clear or Open button
  const [revealed, setRevealed] = useState(null);

  useEffect(() => {
    setRead(readSet(READ));
    setCleared(readSet(CLEARED));
    // when you first had these (Welcome, your profile)
    try {
      const first = localStorage.getItem(SINCE) ?? isoDay();
      localStorage.setItem(SINCE, first);
      setSince(first);
    } catch {
      // storage blocked: today
    }
    // today's health news, for the alerts (the same cached feed Home reads)
    fetch(`/api/health-feed?lang=${lang}`)
      .then((res) => (res.ok ? res.json() : { posts: [] }))
      .then((data) => setPosts(data.posts ?? []))
      .catch(() => {});
    const phone = window.matchMedia("(max-width: 767px)");
    const onPhone = () => setIsMobile(phone.matches);
    onPhone();
    phone.addEventListener("change", onPhone);
    return () => phone.removeEventListener("change", onPhone);
  }, [lang]);

  // N opens (or closes) the panel from anywhere, unless you're typing
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() !== "n" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target?.closest?.("input, textarea, select, [contenteditable=true]")) return;
      setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const today = isoDay();
  const all = [
    ...healthAlerts(posts, n, t.home?.side?.topics),
    { id: "welcome", kind: "welcome", date: since, title: n.welcome.title, details: [{ label: n.welcome.label, value: n.welcome.value }], action: n.welcome.action, ask: "" },
    { id: "profile", kind: "profile", date: since, title: n.profile.title, details: [{ label: n.profile.label, value: n.profile.value }], action: n.profile.action, href: "/records" },
  ];
  const visible = all.filter((item) => !cleared.has(item.id));
  const unread = visible.filter((item) => !read.has(item.id));
  // the browser tab says so too
  useTabBadge(unread.length);
  // today's first, then earlier ones — in each, the unread ones on top
  const isToday = (item) => item.date === today;
  const readOnes = visible.filter((item) => read.has(item.id));
  const shown = [...unread.filter(isToday), ...readOnes.filter(isToday), ...unread.filter((i) => !isToday(i)), ...readOnes.filter((i) => !isToday(i))];
  // the heading over the first of each group
  const headings = new Map();
  const firstToday = shown.find(isToday);
  const firstEarlier = shown.find((i) => !isToday(i));
  if (firstToday) headings.set(firstToday.id, n.today);
  if (firstEarlier) headings.set(firstEarlier.id, n.earlier);

  const markRead = (ids) => {
    const next = new Set(read);
    ids.forEach((id) => next.add(id));
    setRead(next);
    writeSet(READ, next);
  };
  /** Cleared, with a way back. */
  const clear = (items) => {
    const ids = items.map((item) => item.id);
    const next = new Set(cleared);
    ids.forEach((id) => next.add(id));
    setCleared(next);
    writeSet(CLEARED, next);
    setRevealed(null);
    gooeyToast.success(items.length === 1 ? n.clearedOne.replace("{title}", items[0].title) : n.clearedMany.replace("{n}", items.length), {
      action: {
        label: n.undo,
        successLabel: n.back,
        onClick: () => {
          const back = readSet(CLEARED);
          ids.forEach((id) => back.delete(id));
          setCleared(back);
          writeSet(CLEARED, back);
        },
      },
    });
  };
  /** It counts as read, the sheet gets out of the way, then it does its thing. */
  const openItem = (item) => {
    markRead([item.id]);
    setOpen(false);
    window.setTimeout(() => {
      if (item.href) router.push(`/${lang}/app${item.href}`);
      else window.dispatchEvent(new CustomEvent(OPEN_LARA, { detail: { ask: item.ask || undefined } }));
    }, SHEET_CLOSE_MS);
  };
  const toReminders = () => {
    setOpen(false);
    window.setTimeout(() => router.push(`/${lang}/app/reminders`), SHEET_CLOSE_MS);
  };

  const card = (item, selected) => <NotificationCard item={item} read={read.has(item.id)} selected={selected} today={today} n={n} onOpen={() => openItem(item)} />;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next, details) => {
        // a click in the panel's own menu (drawn outside it) isn't a click outside
        if (!next && details?.event?.target?.closest?.("[data-morph-popover-portal]")) {
          details.cancel?.();
          return;
        }
        setOpen(next);
        if (!next) setRevealed(null);
      }}
    >
      {/* The bell, with its tip; N opens it from anywhere */}
      <BarTip label={n.title} keys="N">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-keyshortcuts="N"
          aria-label={unread.length ? n.labelUnread.replace("{n}", unread.length) : n.title}
          className={cn(BAR_ICON, "relative")}
        >
          <BellRingGlyph className="size-4!" />
          {unread.length > 0 && (
            <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[0.625rem] font-semibold text-white tabular-nums ring-2 ring-background">
              {unread.length > 99 ? "99+" : unread.length}
            </span>
          )}
        </button>
      </BarTip>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup
          className={cn(
            // a pale sage panel held off the edges, a little wider than a standard sheet, sliding in from the side
            "fixed inset-y-2 end-2 z-50 flex w-3/4 flex-col gap-0 overflow-hidden rounded-2xl border border-white/70 bg-[#e8ede8] p-0 text-foreground shadow-xl outline-none transition-transform duration-300 ease-in-out sm:max-w-[26rem] dark:border-white/10 dark:bg-neutral-950",
            "data-ending-style:translate-x-[calc(100%+0.5rem)] data-starting-style:translate-x-[calc(100%+0.5rem)] rtl:data-ending-style:-translate-x-[calc(100%+0.5rem)] rtl:data-starting-style:-translate-x-[calc(100%+0.5rem)]",
            // phones: a whole page that slides in from the side
            "max-md:inset-y-0 max-md:end-0 max-md:w-full max-md:rounded-none max-md:border-0"
          )}
        >
          <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-3">
            <div className="min-w-0">
              <MorphPopover open={viewMenu} onOpenChange={setViewMenu}>
                <MorphPopoverTrigger>
                  <button type="button" className="-ms-2 flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 outline-none transition-colors hover:bg-black/5 focus-visible:ring-3 focus-visible:ring-ring/30 dark:hover:bg-white/10">
                    <DialogPrimitive.Title className="text-lg font-medium tracking-tight">{view === "notifications" ? n.title : n.reminders}</DialogPrimitive.Title>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </button>
                </MorphPopoverTrigger>
                <MorphPopoverContent side="bottom" align="start" sideOffset={6} radius={10} className="flex min-w-52 flex-col gap-0.5 border-0 p-1.5">
                  {[
                    ["notifications", n.title, unread.length],
                    ["reminders", n.reminders, 0],
                  ].map(([value, label, count]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setView(value);
                        setViewMenu(false);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md py-2 ps-2.5 pe-2 text-start text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
                    >
                      <span className="flex-1">{label}</span>
                      {count > 0 && <span className="rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground tabular-nums">{count}</span>}
                      {view === value ? <Check className="size-4" /> : <span className="size-4" />}
                    </button>
                  ))}
                </MorphPopoverContent>
              </MorphPopover>
              <DialogPrimitive.Description className="sr-only">
                {view === "reminders" ? n.remindersEmpty : unread.length > 0 ? n.labelUnread.replace("{n}", unread.length) : n.caughtUp}
              </DialogPrimitive.Description>
            </div>
            <div className="-me-2 flex items-center gap-1">
              {view === "notifications" && (
                <>
                  <button
                    type="button"
                    disabled={visible.length === 0}
                    onClick={() => clear(visible)}
                    className="me-1 h-8 cursor-pointer rounded-full bg-black/5 px-3 text-[0.8125rem] font-semibold text-foreground outline-none transition-colors hover:bg-black/10 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-40 dark:bg-white/10 dark:hover:bg-white/15"
                  >
                    {n.clearAll}
                  </button>
                  <button type="button" aria-label={n.markAll} title={n.markAll} disabled={unread.length === 0} onClick={() => markRead(unread.map((i) => i.id))} className={HEADER_BUTTON}>
                    <CheckCheck />
                  </button>
                </>
              )}
              <DialogPrimitive.Close render={<button type="button" aria-label={n.close} title={n.close} className={HEADER_BUTTON} />}>
                <X />
              </DialogPrimitive.Close>
            </div>
          </div>

          {view === "reminders" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-card">
                <AlarmClock className="size-5 text-muted-foreground" />
              </span>
              <p className="font-medium text-foreground">{n.remindersEmpty}</p>
              <p className="max-w-64 text-sm text-muted-foreground">{n.remindersBody}</p>
              <button
                type="button"
                onClick={toReminders}
                className="mt-2 h-9 cursor-pointer rounded-full bg-foreground px-4 text-sm font-semibold text-background outline-none transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                {n.remindersCta}
              </button>
            </div>
          ) : shown.length > 0 ? (
            <AnimatedList
              aria-label={n.title}
              items={shown}
              getKey={(item) => item.id}
              renderItem={(item, selected) => (
                <>
                  {headings.has(item.id) && <h3 className="mb-2 px-1 text-sm font-semibold text-muted-foreground">{headings.get(item.id)}</h3>}
                  {/* phones: swipe right to clear, left to open; computers: drag to show Clear or Open */}
                  {isMobile ? (
                    <SwipeNotification onClear={() => clear([item])} onOpen={() => openItem(item)} clearLabel={n.clear} openLabel={n.open}>
                      {card(item, selected)}
                    </SwipeNotification>
                  ) : (
                    <SwipeReveal
                      revealed={revealed?.id === item.id ? revealed.side : null}
                      onRevealChange={(side) => setRevealed(side ? { id: item.id, side } : null)}
                      onClear={() => clear([item])}
                      onOpen={() => openItem(item)}
                      clearLabel={n.clear}
                      openLabel={n.open}
                    >
                      {card(item, selected)}
                    </SwipeReveal>
                  )}
                </>
              )}
              onItemRemove={(item) => clear([item])}
              onItemSelect={openItem}
              gradientClassName="from-[#e8ede8] dark:from-neutral-950"
              className="min-h-0 flex-1"
              listClassName="px-4 pt-2 pb-8"
              itemClassName="mb-5 last:mb-0"
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-card">
                <BellOff className="size-5 text-muted-foreground" />
              </span>
              <p className="font-medium text-foreground">{n.caughtUp}</p>
              <p className="max-w-64 text-sm text-muted-foreground">{n.caughtUpBody}</p>
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
