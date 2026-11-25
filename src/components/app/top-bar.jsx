"use client";

// The strip across the top of the signed-in app, as Barista's AdminTopBar (h-12,
// px-2, no shape of its own) with ClickUp's contents:
//   left    the workspace pill (opens the workspace menu) and the calendar
//   middle  Search · Ctrl K, with the "Ask Lara" pill that spins a gradient
//           border on hover (ClickUp's "Imagine")
//   right   Book (create), video, talk to Lara, and your avatar (profile menu)

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gooeyToast } from "goey-toast";
import {
  AppWindow,
  Bell,
  ChevronDown,
  ClipboardList,
  Clock,
  Download,
  ExternalLink,
  FileText,
  HeartPulse,
  HelpCircle,
  Keyboard,
  Check,
  Languages,
  LogOut,
  Palette,
  Pill,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  Star,
  StickyNote,
  Trash2,
  Users,
  Video,
  Volume2,
  Wallet,
} from "lucide-react";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { OPEN_LARA } from "@/components/lara/lara-chat";
import { DEMO_ACCOUNT, endDemoSession } from "@/lib/demo-account";
import { cn } from "@/lib/utils";
import { AvatarBadge, CalendarMark, CreateGlyph, WorkspaceBadge } from "./app-icons";
import { EmergencyButton } from "./emergency-button";
import { NotificationsButton } from "./notifications-button";
import { ThemesDialog } from "./themes-dialog";
import { Flag } from "@/components/flag";
import { useSwitchLocale } from "@/components/landing/use-switch-locale";
import { LOCALE_FLAG, localeNames, locales } from "@/i18n/config";

/** Barista's bar icons: just the grey icon, a soft square only under the pointer. */
export const BAR_ICON =
  "grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-[1.125rem]";

export const MENU_ROW =
  "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-start text-[0.9375rem] outline-none transition-colors hover:bg-muted focus-visible:bg-muted [&>svg]:size-[1.125rem] [&>svg]:shrink-0 [&>svg]:text-muted-foreground";

/** A dark label under a bar button, with its key (Barista's BarTip) */
export function BarTip({ label, keys, children, side = "bottom" }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side} sideOffset={8} className="flex items-center gap-2">
        {label}
        {keys && <span className="opacity-60">{keys}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

const openLara = (ask) => window.dispatchEvent(new CustomEvent(OPEN_LARA, { detail: { ask } }));

function WorkspaceMenu({ t, lang }) {
  const [open, setOpen] = useState(false);
  const w = t.workspace;
  const workspaceName = w.name.replace("{name}", DEMO_ACCOUNT.name);
  const router = useRouter();
  const go = (path) => {
    setOpen(false);
    router.push(`/${lang}/app${path}`);
  };

  return (
    <MorphPopover open={open} onOpenChange={setOpen}>
      <MorphPopoverTrigger>
        <button
          type="button"
          className="flex h-8 max-w-56 min-w-0 cursor-pointer items-center gap-2 rounded-sm bg-black/5 ps-1.5 pe-2 text-sm font-semibold outline-none transition-colors hover:bg-muted aria-expanded:bg-muted focus-visible:ring-2 focus-visible:ring-ring xl:max-w-80 dark:bg-white/5"
        >
          <WorkspaceBadge letter={DEMO_ACCOUNT.firstName[0]} className="size-5 rounded-sm text-[0.7rem]" />
          <span className="truncate">{workspaceName}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </MorphPopoverTrigger>
      <MorphPopoverContent side="bottom" align="start" sideOffset={6} radius={14} className="w-[21rem] p-0">
        {/* Your workspace: its badge, members and plan, then Settings and Family */}
        <div className="flex items-center gap-3 p-3.5 pb-3">
          <WorkspaceBadge letter={DEMO_ACCOUNT.firstName[0]} className="size-11 rounded-xl text-xl" />
          <div className="min-w-0">
            <p className="truncate text-[1.05rem] font-semibold">{workspaceName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {w.meta.replace("{count}", "3")} • {w.plan} •{" "}
              <button type="button" onClick={() => go("/upgrade")} className="cursor-pointer font-medium text-[#b86bff] hover:underline">
                {w.upgrade}
              </button>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 px-3.5 pb-3">
          {[
            { icon: Settings, label: w.settings, path: "/settings" },
            { icon: Users, label: w.people, path: "/family" },
          ].map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              type="button"
              onClick={() => go(path)}
              className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted"
            >
              <Icon className="size-4 text-muted-foreground" />
              {label}
            </button>
          ))}
        </div>

        <div className="border-t border-border p-1.5">
          <p className="px-2.5 pt-1.5 pb-1 text-xs text-muted-foreground">{w.manage}</p>
          {[
            { icon: AppWindow, label: w.apps, path: "/apps" },
            { icon: ClipboardList, label: w.records, path: "/records" },
            { icon: Pill, label: w.prescriptions, path: "/prescriptions" },
            { icon: Bell, label: w.reminders, path: "/reminders" },
            { icon: Wallet, label: w.wallet, path: "/wallet" },
          ].map(({ icon: Icon, label, path }) => (
            <button key={path} type="button" onClick={() => go(path)} className={MENU_ROW}>
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <div className="border-t border-border p-1.5">
          <p className="px-2.5 pt-1.5 pb-1 text-xs text-muted-foreground">{w.switch}</p>
          <button type="button" onClick={() => setOpen(false)} className={MENU_ROW}>
            <WorkspaceBadge letter={DEMO_ACCOUNT.firstName[0]} />
            {workspaceName}
          </button>
          <button type="button" onClick={() => go("/family")} className={MENU_ROW}>
            <WorkspaceBadge letter="H" className="bg-[#3f7be0]" />
            {DEMO_ACCOUNT.family}
          </button>
        </div>

        <div className="border-t border-border p-2.5">
          <button
            type="button"
            onClick={() => go("/family")}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted"
          >
            <Plus className="size-4" />
            {w.create}
          </button>
        </div>
      </MorphPopoverContent>
    </MorphPopover>
  );
}

/** Lenzro's MenuAction: an 18px icon, a 13px label, and a star (pin) that shows on hover */
function MenuAction({ icon, label, extra, showPin, pinLabel, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 transition-all",
        isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <span className="flex items-center gap-3">
        <span className={isActive ? "text-accent-foreground" : "text-foreground group-hover:text-accent-foreground"}>{icon}</span>
        <span className="text-[13px] transition-colors">{label}</span>
      </span>
      <span className="flex items-center gap-2">
        <span className="group-hover:text-accent-foreground">{extra}</span>
        {showPin && (
          <Star
            size={16}
            aria-label={pinLabel}
            className={cn(
              "transition-opacity",
              isActive ? "fill-current text-accent-foreground opacity-100" : "text-muted-foreground opacity-0 group-hover:text-accent-foreground group-hover:opacity-100"
            )}
          />
        )}
      </span>
    </button>
  );
}

function ProfileMenu({ t, lang }) {
  const [open, setOpen] = useState(false);
  const p = t.profile;
  const [themesOpen, setThemesOpen] = useState(false);
  // the language list, opened under its row
  const [langOpen, setLangOpen] = useState(false);
  const switchLocale = useSwitchLocale();
  const router = useRouter();
  const go = (path) => {
    setOpen(false);
    router.push(`/${lang}/app${path}`);
  };
  const logOut = () => {
    setOpen(false);
    endDemoSession();
    gooeyToast.success(p.signedOut, { description: p.signedOutBody });
    router.push(`/${lang}/auth`);
  };

  return (
    <MorphPopover open={open} onOpenChange={setOpen}>
      <MorphPopoverTrigger>
        <button
          type="button"
          aria-label={t.top.account}
          className="flex h-9 cursor-pointer items-center gap-1 rounded-full ps-0.5 pe-1 transition-colors hover:bg-muted aria-expanded:bg-muted"
        >
          <AvatarBadge initials={DEMO_ACCOUNT.initials} />
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </MorphPopoverTrigger>
      {/* Lenzro's UserMenu (C:\dev\Lenzro, features/workspace/components/shell/UserMenu.tsx):
          w-70 py-2, you at the top ("Profile" shows on hover), the settings, then
          Utilities with a star to pin each to the top bar, then Trash and Log out */}
      <MorphPopoverContent side="bottom" align="end" sideOffset={6} radius={14} className="scrollbar-pill max-h-[92vh] w-70 overflow-y-auto bg-background py-2">
        <div className="mb-2 px-2 pb-2">
          <button
            type="button"
            onClick={() => go("/profile")}
            className="group flex w-full cursor-pointer items-center justify-between rounded-xl p-2 transition-all hover:bg-accent"
          >
            <span className="flex items-center gap-3">
              <span className="relative">
                <AvatarBadge initials={DEMO_ACCOUNT.initials} size="size-10" dot={false} className="text-sm" />
                <span className="absolute end-0 bottom-0 size-3 rounded-full border-2 border-background bg-emerald-500" />
              </span>
              <span className="flex flex-col text-start">
                <span className="text-[12px] leading-tight text-foreground">{DEMO_ACCOUNT.name}</span>
                <span className="text-[12px] text-muted-foreground">{p.online}</span>
              </span>
            </span>
            <span className="rounded-full px-3 py-1 opacity-0 transition-colors duration-300 group-hover:bg-foreground group-hover:opacity-100">
              <span className="text-[12px] font-medium group-hover:text-background">{p.profile}</span>
            </span>
          </button>
        </div>
        <div className="my-1 h-px bg-border" />

        <div className="mb-2 space-y-0.5 px-2 pb-2">
          <MenuAction icon={<Volume2 size={18} />} label={p.mute} />
          <MenuAction icon={<Settings size={18} />} label={p.settings} onClick={() => go("/settings")} />
          <MenuAction icon={<Palette size={18} />} label={p.themes} onClick={() => { setOpen(false); setThemesOpen(true); }} />
          {/* the app's language: the same page in another one, remembered */}
          <MenuAction
            icon={<Languages size={18} />}
            label={p.language}
            extra={
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {localeNames[lang]}
                <ChevronDown size={14} className={cn("transition-transform", langOpen && "rotate-180")} />
              </span>
            }
            onClick={() => setLangOpen((v) => !v)}
          />
          {langOpen && (
            <div className="ms-6 space-y-0.5 border-s border-border ps-2">
              {locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setLangOpen(false);
                    if (code !== lang) switchLocale(code);
                  }}
                  className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-start text-[13px] transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Flag code={LOCALE_FLAG[code]} />
                  <span className="flex-1">{localeNames[code]}</span>
                  {code === lang && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
          <MenuAction icon={<Keyboard size={18} />} label={p.shortcuts} onClick={() => go("/shortcuts")} />
          <MenuAction icon={<Download size={18} />} label={p.download} extra={<ExternalLink size={14} />} onClick={() => go("/download")} />
          <MenuAction icon={<HelpCircle size={18} />} label={p.help} onClick={() => go("/help")} />
        </div>
        <div className="my-1 h-px bg-border" />

        <div className="mb-2 px-2 pb-2">
          <div className="px-3 py-2 text-[12px] tracking-wider text-muted-foreground">{p.utilities}</div>
          <div className="space-y-0.5">
            <MenuAction icon={<PlusCircle size={18} />} label={p.book} showPin pinLabel={p.pin} onClick={() => go("/consultations")} />
            <MenuAction icon={<HeartPulse size={18} />} label={p.myHealth} showPin pinLabel={p.pin} onClick={() => go("/dashboard")} />
            <MenuAction icon={<Clock size={18} />} label={p.medicines} showPin pinLabel={p.pin} onClick={() => go("/medicines")} />
            {/* your notes (Milo's, More → Notes); reminders come later, so no Create reminder yet */}
            <MenuAction icon={<FileText size={18} />} label={t.more.apps.notes} showPin pinLabel={p.pin} onClick={() => go("/notes")} />
            <MenuAction icon={<Video size={18} />} label={p.record} showPin pinLabel={p.pin} onClick={() => go("/record")} />
            <MenuAction icon={<StickyNote size={18} />} label={p.records} showPin pinLabel={p.pin} onClick={() => go("/records")} />
            <MenuAction icon={<Users size={18} />} label={p.family} showPin pinLabel={p.pin} onClick={() => go("/family")} />
            <MenuAction
              icon={<Sparkles size={18} />}
              label={p.lara}
              showPin
              pinLabel={p.pin}
              onClick={() => {
                setOpen(false);
                openLara();
              }}
            />
          </div>
        </div>
        <div className="my-1 h-px bg-border" />

        <div className="space-y-0.5 px-2">
          <MenuAction icon={<Trash2 size={18} />} label={p.trash} onClick={() => go("/trash")} />
          <MenuAction icon={<LogOut size={18} />} label={p.logout} onClick={logOut} />
        </div>
      </MorphPopoverContent>
      <ThemesDialog open={themesOpen} onOpenChange={setThemesOpen} t={t.themes} />
    </MorphPopover>
  );
}

export function TopBar({ t, lang, onSearch, searching = false }) {
  const s = t.search;
  const router = useRouter();

  return (
    <div className="relative flex h-12 shrink-0 items-center gap-2 px-2">
      <WorkspaceMenu t={t} lang={lang} />
      <BarTip label={t.top.calendar}>
        <button type="button" aria-label={t.top.calendar} onClick={() => router.push(`/${lang}/app/planner`)} className={BAR_ICON}>
          <CalendarMark className="size-4!" />
        </button>
      </BarTip>

      {/* Search in the middle of the bar, and Ctrl+K anywhere; while the search
          page is open, its question stands there instead */}
      <div className="pointer-events-none absolute inset-x-0 hidden justify-center lg:flex">
        {searching ? (
          <p className="flex h-9 items-center text-[0.9375rem] font-semibold">{s.heading}</p>
        ) : (
        <div className="oneg-search-bar pointer-events-auto flex h-9 w-[22rem] items-center gap-1 rounded-full ps-3 pe-1 xl:w-96">
          <button
            type="button"
            onClick={onSearch}
            aria-keyshortcuts="Control+K"
            className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground"
          >
            <Search className="size-4 shrink-0" />
            <span>{s.label}</span>
            <span className="text-xs text-muted-foreground/70">{s.keys}</span>
          </button>
          <BarTip label={s.askLaraTip} keys={s.askLaraKeys}>
            <button type="button" onClick={() => openLara()} className="oneg-lara-pill h-7 shrink-0 cursor-pointer">
              <span className="flex h-full items-center gap-1.5 ps-3 pe-2 text-[0.8125rem] font-medium text-muted-foreground">
                {s.askLara}
                <span className="oneg-lara-face size-[1.05rem] rounded-[5px]" aria-hidden="true">
                  <span className="flex gap-[2px]">
                    <span className="h-[5px] w-[3px] rounded-full bg-white" />
                    <span className="h-[5px] w-[3px] rounded-full bg-white" />
                  </span>
                </span>
              </span>
            </button>
          </BarTip>
        </div>
        )}
      </div>

      <div className="ms-auto flex items-center gap-1">
        <BarTip label={t.top.create}>
          <button type="button" aria-label={t.top.create} onClick={() => router.push(`/${lang}/app/consultations`)} className={cn(BAR_ICON, "[&_svg]:size-5")}>
            <CreateGlyph />
          </button>
        </BarTip>
        {/* Emergency numbers, and Barista's bell */}
        <EmergencyButton t={t} />
        <NotificationsButton t={t} lang={lang} />
        <ProfileMenu t={t} lang={lang} />
      </div>
    </div>
  );
}
