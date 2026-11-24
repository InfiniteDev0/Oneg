"use client";

// The signed-in app's frame, as Barista's AdminShell: the top bar across the
// whole width (h-12), and under it the sidebar card (Barista's, with ClickUp's
// items) beside the main panel, a rounded card with a border; only the panel's
// contents scroll. Colours are Barista's (.oneg-app in globals.css). ClickUp's
// "1 Priority" tray runs along the bottom.
// Search (Ctrl+K) and Lara (Ctrl+J, the "Ask Lara" pill, the AI item) open over it.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import LaraChat from "@/components/lara/lara-chat";
import { AppSidebar } from "./app-sidebar";
import { SearchDialog } from "./search-dialog";
import { TopBar } from "./top-bar";

const SIDEBAR_KEY = "oneg.app.sidebar";

export function AppShell({ t, lara, lang, children }) {
  const router = useRouter();
  // Folded to ClickUp's rail until you open it; remembered
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SIDEBAR_KEY) === "open") setOpen(true);
    } catch {
      // storage blocked: it starts folded
    }
  }, []);
  const toggle = useCallback(() => {
    setOpen((was) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, was ? "folded" : "open");
      } catch {
        // not remembered
      }
      return !was;
    });
  }, []);

  // Ctrl+K opens search from anywhere
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = useCallback((path) => router.push(`/${lang}/app${path}`), [router, lang]);

  return (
    <TooltipProvider delay={300}>
      <div className="oneg-app flex h-svh flex-col overflow-hidden bg-background text-foreground">
        <TopBar t={t} lang={lang} onSearch={() => setSearchOpen(true)} />

        <div className="flex min-h-0 flex-1">
          <AppSidebar t={t} lang={lang} open={open} onToggle={toggle} />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col pe-2">
            {/* Barista's SidebarInset: a rounded, bordered panel in the canvas colour */}
            <main className="scrollbar-pill min-h-0 min-w-0 flex-1 overflow-y-auto rounded-lg border border-border bg-canvas">
              <div className="mx-auto w-full max-w-[96rem] px-4 py-6 lg:px-6">{children}</div>
            </main>

            {/* ClickUp's tray along the bottom */}
            <div className="flex h-10 shrink-0 items-center">
              <button
                type="button"
                onClick={() => go("/reminders")}
                className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 text-[0.8125rem] font-medium text-foreground/85 transition-colors hover:bg-muted"
              >
                <Flag className="size-3.5 text-muted-foreground" />
                {t.tray.priority.replace("{count}", "1")}
              </button>
            </div>
          </div>
        </div>

        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} t={t} lang={lang} go={go} onToggleSidebar={toggle} />
        {/* Lara, without her floating face: the top bar and the sidebar open her */}
        <LaraChat label={lara.label} t={lara.chat} lang={lang} button={false} />
      </div>
    </TooltipProvider>
  );
}
