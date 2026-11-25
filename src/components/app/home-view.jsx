"use client";

// Home's frame: along the top, the view you're on — For You, Following or
// Education — a click opening the menu to switch, then a line across the whole
// panel, and under it the two panes with VS Code's drag line (SplitPane).
//   For You     the health news feed (Twitter's timeline) on the left, and
//               Twitter's side column on the right: who to follow, trending
//   Following   the same, with only the sources you follow — before you follow
//               anyone, the whole list of who to follow in their place
//   Educational the health sciences to learn, as Spotify's Browse (edu-browse.jsx);
//               one page, no drag line
// Each pane scrolls on its own; Home fills the main panel exactly. A pick in the
// side column (a source, a topic) narrows the feed until it's cleared. The view
// you chose is kept in this browser.

import { useEffect, useState } from "react";
import { Check, ChevronDown, GraduationCap, Sparkles, Users } from "lucide-react";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { cn } from "@/lib/utils";
import { EduBrowse } from "./edu-browse";
import { FeedSidebar, FollowSuggestions, useFollows } from "./feed-sidebar";
import { HealthFeed, useHealthFeed } from "./health-feed";
import { SplitPane } from "./split-pane";

const VIEW_KEY = "oneg.app.home-view";
const VIEWS = ["forYou", "following", "education"];
// the menu's small rows: rounded, no lines, a little space between them
const VIEW_ROW =
  "flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-start text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground";

export function HomeView({ t, lang }) {
  const views = [
    { key: "forYou", icon: Sparkles, label: t.views.forYou },
    { key: "following", icon: Users, label: t.views.following },
    { key: "education", icon: GraduationCap, label: t.views.education },
  ];
  const [view, setView] = useState("forYou");
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(null);
  const { follows, toggle } = useFollows();
  const isFeed = view !== "education";
  const feed = useHealthFeed(lang, isFeed);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (VIEWS.includes(saved)) setView(saved);
    } catch {
      // storage blocked: For You
    }
  }, []);

  const choose = (key) => {
    setView(key);
    setFilter(null);
    setOpen(false);
    try {
      localStorage.setItem(VIEW_KEY, key);
    } catch {
      // not remembered
    }
  };

  const current = views.find((v) => v.key === view) ?? views[0];

  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto lg:overflow-hidden">
      {/* The view's name with its menu; the line under it runs the panel's whole width */}
      <div className="flex h-12 shrink-0 items-center border-b border-border px-3 lg:px-5">
        <MorphPopover open={open} onOpenChange={setOpen}>
          <MorphPopoverTrigger>
            <button
              type="button"
              aria-label={t.views.choose}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[0.9375rem] font-semibold outline-none transition-colors hover:bg-muted aria-expanded:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              {current.label}
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </MorphPopoverTrigger>
          <MorphPopoverContent side="bottom" align="start" sideOffset={6} radius={12} className="flex w-44 flex-col gap-1 border-0 p-1">
            {views.map(({ key, icon: Icon, label }) => (
              <button key={key} type="button" onClick={() => choose(key)} className={cn(VIEW_ROW, key === view && "bg-muted")}>
                <Icon />
                <span className="flex-1">{label}</span>
                {key === view && <Check className="size-3.5 text-foreground!" />}
              </button>
            ))}
          </MorphPopoverContent>
        </MorphPopover>
      </div>

      {!isFeed ? (
        // Educational: one page, no drag line
        <EduBrowse t={t.edu} lang={lang} />
      ) : (
      <SplitPane
        storageKey="oneg.app.home-split"
        initial={65}
        label={t.resize}
        startClassName="scrollbar-pill lg:overflow-y-auto"
        endClassName="scrollbar-pill px-4 py-5 lg:overflow-y-auto lg:pt-5 lg:ps-8 lg:pe-5"
        start={
          view === "following" && follows.size === 0 ? (
            <FollowSuggestions feed={feed} t={t.side} intro={t.feed.followingEmpty} follows={follows} onToggleFollow={toggle} />
          ) : (
            <HealthFeed
              feed={feed}
              t={t.feed}
              lang={lang}
              filter={filter}
              onClearFilter={() => setFilter(null)}
              scope={view === "following" ? (p) => follows.has(p.source.handle) : null}
              empty={view === "following" ? t.feed.followingEmpty : undefined}
            />
          )
        }
        end={
          <FeedSidebar
            feed={feed}
            t={t.side}
            filter={filter}
            onFilter={setFilter}
            follows={follows}
            onToggleFollow={toggle}
            hideFollow={view === "following" && follows.size === 0}
          />
        }
      />
      )}
    </div>
  );
}
