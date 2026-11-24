"use client";

// The signed-in app's frame, laid out as Barista's AdminShell and ClickUp:
//   the top bar across the whole width (h-12)
//   under it: ClickUp's icon rail (60px), Lenzro's side panel (280px, hides with »),
//   and the main panel (rounded, only its contents scroll)
//   along the bottom, ClickUp's tray ("1 Priority")
// Search (Ctrl+K) and Lara (Ctrl+J, the "Ask Lara" pill, the AI rail button) open over it.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import LaraChat from "@/components/lara/lara-chat";
import { cn } from "@/lib/utils";
import { IconRail } from "./icon-rail";
import { SearchDialog } from "./search-dialog";
import { SidePanel } from "./side-panel";
import { TopBar } from "./top-bar";

const PANEL_KEY = "oneg.app.panel";

export function AppShell({ t, lara, lang, children }) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // the side panel stays as you left it
  useEffect(() => {
    try {
      if (localStorage.getItem(PANEL_KEY) === "closed") setPanelOpen(false);
    } catch {
      // storage blocked: it starts open
    }
  }, []);
  const togglePanel = useCallback(() => {
    setPanelOpen((open) => {
      try {
        localStorage.setItem(PANEL_KEY, open ? "closed" : "open");
      } catch {
        // not remembered
      }
      return !open;
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
      <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
        <TopBar t={t} lang={lang} onSearch={() => setSearchOpen(true)} />

        <div className="flex min-h-0 flex-1">
          <IconRail t={t} lang={lang} panelOpen={panelOpen} onTogglePanel={togglePanel} />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col pe-1.5">
            {/* Lenzro's body: the panel and the page side by side, 4px apart */}
            <div className="flex min-h-0 flex-1 gap-1">
              <div
                className={cn(
                  "shrink-0 overflow-hidden rounded-xl bg-muted-foreground/10 transition-[width] duration-200",
                  panelOpen ? "w-[280px]" : "w-0"
                )}
              >
                <SidePanel t={t} lang={lang} go={go} />
              </div>
              <main className="scrollbar-pill min-h-0 min-w-0 flex-1 overflow-y-auto rounded-xl bg-muted-foreground/10">{children}</main>
            </div>

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

        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} t={t} lang={lang} go={go} onToggleSidebar={togglePanel} />
        {/* Lara, without her floating face: the top bar and the rail open her */}
        <LaraChat label={lara.label} t={lara.chat} lang={lang} button={false} />
      </div>
    </TooltipProvider>
  );
}
