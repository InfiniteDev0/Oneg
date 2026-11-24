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
  Bug,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Command,
  Download,
  FlaskConical,
  HeartPulse,
  HelpCircle,
  LogOut,
  Mic,
  NotebookPen,
  Paintbrush,
  Pill,
  Plus,
  Search,
  Settings,
  Smile,
  Users,
  Video,
  VolumeX,
  Wallet,
} from "lucide-react";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { OPEN_LARA } from "@/components/lara/lara-chat";
import { DEMO_ACCOUNT, endDemoSession } from "@/lib/demo-account";
import { cn } from "@/lib/utils";
import { AvatarBadge, CreateGlyph, PlannerGlyph, WorkspaceBadge } from "./app-icons";

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
          className="flex h-9 max-w-80 cursor-pointer items-center gap-2.5 rounded-lg bg-black/5 ps-1.5 pe-2 text-[0.9375rem] font-semibold outline-none transition-colors hover:bg-muted aria-expanded:bg-muted focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/5"
        >
          <WorkspaceBadge letter={DEMO_ACCOUNT.firstName[0]} />
          <span className="truncate">{w.name}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </MorphPopoverTrigger>
      <MorphPopoverContent side="bottom" align="start" sideOffset={6} radius={14} className="w-[21rem] p-0">
        {/* Your workspace: its badge, members and plan, then Settings and Family */}
        <div className="flex items-center gap-3 p-3.5 pb-3">
          <WorkspaceBadge letter={DEMO_ACCOUNT.firstName[0]} className="size-11 rounded-xl text-xl" />
          <div className="min-w-0">
            <p className="truncate text-[1.05rem] font-semibold">{w.name}</p>
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
            {w.name}
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

function ProfileMenu({ t, lang }) {
  const [open, setOpen] = useState(false);
  const p = t.profile;
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
      <MorphPopoverContent side="bottom" align="end" sideOffset={6} radius={14} className="max-h-[calc(100svh-4rem)] w-[18.5rem] overflow-y-auto p-0">
        <div className="flex items-center gap-3 p-3.5 pb-2.5">
          <AvatarBadge initials={DEMO_ACCOUNT.initials} size="size-10" className="text-sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{DEMO_ACCOUNT.name}</p>
            <p className="text-xs text-muted-foreground">{p.online}</p>
          </div>
        </div>
        <div className="px-3.5 pb-2.5">
          <button
            type="button"
            className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Smile className="size-4" />
            {p.setStatus}
          </button>
        </div>
        <div className="px-1.5 pb-1.5">
          <button type="button" className={MENU_ROW}>
            <VolumeX />
            <span className="flex-1">{p.mute}</span>
            <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
          </button>
        </div>

        <div className="border-t border-border p-1.5">
          {[
            { icon: Settings, label: p.settings, path: "/settings" },
            { icon: Bell, label: p.notifications, path: "/notifications" },
            { icon: Paintbrush, label: p.themes, path: "/themes" },
            { icon: FlaskConical, label: p.labs, path: "/labs" },
            { icon: Command, label: p.shortcuts, path: "/shortcuts" },
            { icon: Download, label: p.download, path: "/download" },
          ].map(({ icon: Icon, label, path }) => (
            <button key={path} type="button" onClick={() => go(path)} className={MENU_ROW}>
              <Icon />
              {label}
            </button>
          ))}
          <div className="flex items-center">
            <button type="button" onClick={() => go("/help")} className={cn(MENU_ROW, "flex-1")}>
              <HelpCircle />
              {p.help}
            </button>
            <BarTip label={p.reportBug}>
              <button type="button" aria-label={p.reportBug} onClick={() => go("/help/bug")} className={cn(BAR_ICON, "me-1 [&_svg]:size-4")}>
                <Bug />
              </button>
            </BarTip>
          </div>
        </div>

        <div className="border-t border-border p-1.5">
          <p className="px-2.5 pt-1.5 pb-1 text-xs text-muted-foreground">{p.personal}</p>
          {[
            { icon: CalendarCheck, label: p.book, path: "/consultations" },
            { icon: HeartPulse, label: p.myHealth, path: "/dashboard" },
            { icon: Pill, label: p.medicines, path: "/medicines" },
            { icon: NotebookPen, label: p.notepad, path: "/notepad" },
            { icon: Video, label: p.record, path: "/record" },
            { icon: Mic, label: p.talk, path: "/talk" },
          ].map(({ icon: Icon, label, path }) => (
            <button key={path} type="button" onClick={() => go(path)} className={MENU_ROW}>
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <div className="border-t border-border p-1.5">
          <button type="button" onClick={logOut} className={MENU_ROW}>
            <LogOut />
            {p.logout}
          </button>
        </div>
      </MorphPopoverContent>
    </MorphPopover>
  );
}

export function TopBar({ t, lang, onSearch }) {
  const s = t.search;
  const router = useRouter();

  return (
    <div className="relative flex h-12 shrink-0 items-center gap-2 px-2">
      <WorkspaceMenu t={t} lang={lang} />
      <BarTip label={t.top.calendar}>
        <button type="button" aria-label={t.top.calendar} onClick={() => router.push(`/${lang}/app/planner`)} className={BAR_ICON}>
          <PlannerGlyph />
        </button>
      </BarTip>

      {/* Search in the middle of the bar, and Ctrl+K anywhere */}
      <div className="pointer-events-none absolute inset-x-0 hidden justify-center lg:flex">
        <div className="oneg-search-bar pointer-events-auto flex h-9 w-[26rem] items-center gap-1 rounded-full ps-3 pe-1 xl:w-[30rem]">
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
      </div>

      <div className="ms-auto flex items-center gap-1">
        <BarTip label={t.top.create}>
          <button type="button" aria-label={t.top.create} onClick={() => router.push(`/${lang}/app/consultations`)} className={cn(BAR_ICON, "[&_svg]:size-5")}>
            <CreateGlyph />
          </button>
        </BarTip>
        <BarTip label={t.top.video}>
          <button type="button" aria-label={t.top.video} onClick={() => router.push(`/${lang}/app/consultations/video`)} className={BAR_ICON}>
            <Video />
          </button>
        </BarTip>
        <BarTip label={t.top.voice}>
          <button type="button" aria-label={t.top.voice} onClick={() => openLara()} className={BAR_ICON}>
            <Mic />
          </button>
        </BarTip>
        <ProfileMenu t={t} lang={lang} />
      </div>
    </div>
  );
}
