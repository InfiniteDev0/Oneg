"use client";

// The signed-in app's frame, as Barista's AdminShell: the top bar across the
// whole width (h-12), and under it the sidebar card (Barista's, with ClickUp's
// items) beside the main panel, a rounded card with a border; only the panel's
// contents scroll. Colours are Barista's (.oneg-app in globals.css).
// Search (Ctrl+K) and Lara (Ctrl+J, the "Ask Lara" pill, the AI item) open over it.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import LaraChat, { UNDOCK_LARA } from "@/components/lara/lara-chat";
import { AppSidebar } from "./app-sidebar";
import { SearchPage } from "./search-page";
import { TopBar } from "./top-bar";

const SIDEBAR_KEY = "oneg.app.sidebar";

export function AppShell({ t, lara, lang, children }) {
  const router = useRouter();
  // Folded to ClickUp's rail until you open it; remembered
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // the spot over the main panel where Lara opens in Full screen, as ClickUp Brain
  const [laraSpot, setLaraSpot] = useState(null);
  // Lara full screen: the sidebar lights AI
  const [laraFull, setLaraFull] = useState(false);
  // and where search opens as a page
  const [searchSpot, setSearchSpot] = useState(null);

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

  // <html data-app> while you're in the app: its menus (drawn outside the frame)
  // take the app's colours, not the landing page's
  useEffect(() => {
    document.documentElement.dataset.app = "";
    return () => delete document.documentElement.dataset.app;
  }, []);

  // Search lives in the address (?search, and what you typed as &q=), so a
  // refresh brings it back as it was; closing it tidies the address again.
  const urlRead = useRef(false);
  useEffect(() => {
    if (!urlRead.current) {
      urlRead.current = true;
      if (new URLSearchParams(window.location.search).has("search")) {
        setSearchOpen(true);
        return;
      }
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has("search") === searchOpen) return;
    if (searchOpen) url.searchParams.set("search", "");
    else {
      url.searchParams.delete("search");
      url.searchParams.delete("q");
      url.searchParams.delete("in");
    }
    window.history.replaceState(null, "", `${url.pathname}${url.search.replace(/=(?=&|$)/g, "")}${url.hash}`);
  }, [searchOpen]);

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
        <TopBar t={t} lang={lang} onSearch={() => setSearchOpen(true)} searching={searchOpen} />

        <div className="flex min-h-0 flex-1">
          <AppSidebar
            t={t}
            lang={lang}
            open={open}
            onToggle={toggle}
            laraActive={laraFull}
            covered={searchOpen}
            // a click in the sidebar takes you there: search goes, and Lara too unless it's AI
            onNavigate={(to) => {
              setSearchOpen(false);
              if (to !== "lara") window.dispatchEvent(new CustomEvent(UNDOCK_LARA));
            }}
          />

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col pe-2 pb-2">
            {/* Barista's SidebarInset: a rounded, bordered panel in the canvas colour */}
            <main className="scrollbar-pill relative min-h-0 min-w-0 flex-1 overflow-y-auto rounded-lg border border-border bg-canvas">
              <div className="mx-auto flex min-h-full w-full max-w-[96rem] flex-col px-4 py-6 lg:px-6">{children}</div>
            </main>
            {/* Lara in Full screen: exactly over the panel; empty, it lets clicks through */}
            <div ref={setLaraSpot} className="pointer-events-none absolute start-0 end-2 top-0 bottom-2 z-20 flex *:pointer-events-auto" />
            {/* Search as a page: over the panel too, above Lara */}
            <div ref={setSearchSpot} className="pointer-events-none absolute start-0 end-2 top-0 bottom-2 z-30 *:pointer-events-auto" />
          </div>
        </div>

        <SearchPage
          open={searchOpen}
          onOpenChange={setSearchOpen}
          t={t}
          lang={lang}
          go={go}
          onToggleSidebar={toggle}
          target={searchSpot}
          resizeLabel={t.home.resize}
        />
        {/* Lara, without her floating face: the top bar and the sidebar open her */}
        <LaraChat label={lara.label} t={lara.chat} lang={lang} button={false} inlineTarget={laraSpot} onFullChange={setLaraFull} />
      </div>
    </TooltipProvider>
  );
}
