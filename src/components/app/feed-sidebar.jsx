"use client";

// For You's side column, as Twitter's: two rounded cards.
//   Who to follow   the sources in your feed, the busiest first (three, then
//                   Show more); who you follow is kept in this browser
//                   (useFollows, held by Home) and makes the Following view.
//                   A click on one shows only its stories. Verified doctors join here once
//                   their accounts exist.
//   Trending        health topics counted in the stories loaded now (Ebola,
//                   HIV, a strike, SHA…), each with its kind and how many
//                   stories mention it. A click shows only those stories.
// Everything here is read from the real feed; nothing is made up.

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FOLLOWS = "oneg.feed.follows";

// What counts as a topic, and its kind. English with the Swahili words for the
// same things, since the feed carries both.
export const TOPICS = [
  { key: "ebola", kind: "outbreaks", match: /\bebola\b/i },
  { key: "mpox", kind: "outbreaks", match: /\bmpox\b|monkeypox/i },
  { key: "cholera", kind: "outbreaks", match: /cholera|kipindupindu/i },
  { key: "malaria", kind: "outbreaks", match: /malaria/i },
  { key: "measles", kind: "outbreaks", match: /measles|surua/i },
  { key: "flu", kind: "outbreaks", match: /\bflu\b|influenza|h5n1/i },
  { key: "covid", kind: "outbreaks", match: /covid|coronavirus/i },
  { key: "hiv", kind: "conditions", match: /\bhiv\b|\baids\b|ukimwi/i },
  { key: "tb", kind: "conditions", match: /tuberculosis|\btb\b|kifua kikuu/i },
  { key: "cancer", kind: "conditions", match: /cancer|saratani/i },
  { key: "diabetes", kind: "conditions", match: /diabet|kisukari/i },
  { key: "mental", kind: "conditions", match: /mental health|depression|anxiety|suicid|afya ya akili/i },
  { key: "heart", kind: "conditions", match: /\bheart\b|blood pressure|hypertension|\bstroke\b/i },
  { key: "maternal", kind: "care", match: /maternal|pregnan|newborn|\bmothers?\b|uzazi|wajawazito/i },
  { key: "vaccines", kind: "care", match: /vaccin|immuni[sz]|chanjo/i },
  { key: "nutrition", kind: "care", match: /nutrition|obesity|\bdiet\b|lishe/i },
  { key: "strike", kind: "system", match: /strike|down tools|mgomo/i },
  { key: "sha", kind: "system", match: /\bSHA\b|social health authority|\bNHIF\b/ },
  { key: "funding", kind: "system", match: /funding|usaid|budget|bajeti/i },
  { key: "nhs", kind: "system", match: /\bNHS\b/ },
];

const words = (post) => `${post.title} ${post.text}`;

// the topics in the stories, most mentioned first
function trending(posts) {
  return TOPICS.map((topic) => ({ ...topic, count: posts.filter((p) => topic.match.test(words(p))).length }))
    .filter((topic) => topic.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

// the sources in the feed, the ones with the most stories first
function sources(posts) {
  const by = new Map();
  for (const p of posts) {
    const s = by.get(p.source.handle) ?? { ...p.source, count: 0 };
    s.count += 1;
    if (!s.icon && p.source.icon) s.icon = p.source.icon;
    by.set(p.source.handle, s);
  }
  return [...by.values()].sort((a, b) => b.count - a.count);
}

const SWATCHES = ["#1d9bf0", "#7856ff", "#00ba7c", "#f91880", "#ff7a00", "#14b8a6"];
function Avatar({ source }) {
  const [broken, setBroken] = useState(false);
  if (source.icon && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={source.icon} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} className="size-10 shrink-0 rounded-full bg-white object-contain" />;
  }
  const n = [...source.name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ background: SWATCHES[n % SWATCHES.length] }}>
      {source.name.trim()[0]?.toUpperCase()}
    </span>
  );
}

const CARD = "rounded-2xl border border-border";
const ROW = "w-full cursor-pointer px-4 text-start transition-colors hover:bg-foreground/3 outline-none focus-visible:bg-foreground/5";

/** The sources you follow (their handles), kept in this browser. */
export function useFollows() {
  const [follows, setFollows] = useState(() => new Set());
  useEffect(() => {
    try {
      setFollows(new Set(JSON.parse(localStorage.getItem(FOLLOWS) ?? "[]")));
    } catch {
      // storage blocked
    }
  }, []);
  // from the latest list, so quick clicks on two sources both count
  const toggle = (handle) =>
    setFollows((was) => {
      const copy = new Set(was);
      if (copy.has(handle)) copy.delete(handle);
      else copy.add(handle);
      try {
        localStorage.setItem(FOLLOWS, JSON.stringify([...copy]));
      } catch {
        // not remembered
      }
      return copy;
    });
  return { follows, toggle };
}

// One source: its picture, name and @handle, and Follow (Following, Unfollow on hover).
// A click on the row (when it can) shows only its stories.
function SourceRow({ source, t, following, onToggle, onPick, active }) {
  const pickable = Boolean(onPick);
  return (
    <div
      role={pickable ? "button" : undefined}
      tabIndex={pickable ? 0 : undefined}
      onClick={pickable ? () => onPick(source) : undefined}
      onKeyDown={pickable ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(source)) : undefined}
      aria-pressed={pickable ? active : undefined}
      className={cn(ROW, "flex items-center gap-3 py-3", !pickable && "cursor-default", active && "bg-foreground/5")}
    >
      <Avatar source={source} />
      <div className="min-w-0 flex-1 leading-5">
        <p className="truncate text-[0.9375rem] font-bold">{source.name}</p>
        <p className="truncate text-[0.9375rem] text-muted-foreground">@{source.handle}</p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(source.handle);
        }}
        aria-pressed={following}
        className={cn(
          "group/follow h-8 shrink-0 cursor-pointer rounded-full px-4 text-sm font-bold transition-colors",
          following
            ? "border border-border text-foreground hover:border-[#f4212e]/40 hover:bg-[#f4212e]/10 hover:text-[#f4212e]"
            : "bg-foreground text-background hover:opacity-90"
        )}
      >
        {following ? (
          <>
            <span className="group-hover/follow:hidden">{t.following}</span>
            <span className="hidden group-hover/follow:inline">{t.unfollow}</span>
          </>
        ) : (
          t.follow
        )}
      </button>
    </div>
  );
}

function WhoToFollow({ list, t, active, onPick, follows, toggle }) {
  const [more, setMore] = useState(false);

  if (!list.length) return null;
  const shown = list.slice(0, more ? 6 : 3);
  return (
    <section className={cn(CARD, "overflow-hidden")}>
      <h2 className="px-4 pt-3 pb-1 text-xl font-extrabold">{t.whoToFollow}</h2>
      {shown.map((source) => (
        <SourceRow
          key={source.handle}
          source={source}
          t={t}
          following={follows.has(source.handle)}
          onToggle={toggle}
          onPick={onPick}
          active={active === source.handle}
        />
      ))}
      {list.length > 3 && (
        <button type="button" onClick={() => setMore((v) => !v)} className={cn(ROW, "py-4 text-[0.9375rem] text-action")}>
          {more ? t.showLess : t.showMore}
        </button>
      )}
    </section>
  );
}

/**
 * Following, before you follow anyone: everyone you could follow, the whole
 * list, as Twitter's — follow some and their stories take its place.
 */
export function FollowSuggestions({ feed, t, intro, follows, onToggleFollow }) {
  const { posts, state } = feed;
  const block = "oneg-sheen rounded-md bg-black/5 dark:bg-white/5";
  return (
    <div className="mx-auto w-full max-w-150 pb-8">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-extrabold">{t.whoToFollow}</h2>
        <p className="mt-1 text-[0.9375rem] text-muted-foreground">{intro}</p>
      </div>
      {state === "loading"
        ? [0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span className={cn(block, "size-10 rounded-full")} />
              <div className="flex flex-1 flex-col gap-1.5">
                <span className={cn(block, "h-4 w-2/5")} />
                <span className={cn(block, "h-3.5 w-1/4")} />
              </div>
            </div>
          ))
        : sources(posts).map((source) => (
            <SourceRow key={source.handle} source={source} t={t} following={follows.has(source.handle)} onToggle={onToggleFollow} />
          ))}
    </div>
  );
}

function Trends({ list, t, active, onPick }) {
  if (!list.length) return null;
  return (
    <section className={cn(CARD, "overflow-hidden pb-2")}>
      <h2 className="px-4 pt-3 pb-1 text-xl font-extrabold">{t.trends}</h2>
      {list.map((topic, i) => (
        <button
          key={topic.key}
          type="button"
          onClick={() => onPick(topic)}
          aria-pressed={active === topic.key}
          className={cn(ROW, "flex flex-col py-3", active === topic.key && "bg-foreground/5")}
        >
          <span className="text-[0.8125rem] text-muted-foreground">
            {i + 1} · {t.kinds[topic.kind]} · {t.trending}
          </span>
          <span className="text-[0.9375rem] font-bold">{t.topics[topic.key]}</span>
          <span className="text-[0.8125rem] text-muted-foreground">
            {topic.count === 1 ? t.story : t.stories.replace("{n}", topic.count)}
          </span>
        </button>
      ))}
    </section>
  );
}

function Placeholder() {
  const block = "oneg-sheen rounded-md bg-black/5 dark:bg-white/5";
  return (
    <div className={cn(CARD, "flex flex-col gap-4 p-4")}>
      <span className={cn(block, "h-6 w-36")} />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <span className={cn(block, "size-10 rounded-full")} />
          <div className="flex flex-1 flex-col gap-1.5">
            <span className={cn(block, "h-4 w-3/5")} />
            <span className={cn(block, "h-3.5 w-2/5")} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * filter: what the feed is narrowed to ({ id, label, test }), or null.
 * onFilter(next): narrow it (picking the same one again clears it).
 */
// hideFollow: the whole list is already on the left (Following, before you follow anyone)
export function FeedSidebar({ feed, t, filter, onFilter, follows, onToggleFollow, hideFollow = false }) {
  const { posts, state } = feed;
  if (state === "loading") return <div className="flex w-full flex-col gap-4"><Placeholder /></div>;
  if (!posts.length) return null;

  const pick = (next) => onFilter(filter?.id === next.id ? null : next);
  return (
    <div className="flex w-full flex-col gap-4">
      {!hideFollow && (
      <WhoToFollow
        list={sources(posts)}
        t={t}
        follows={follows}
        toggle={onToggleFollow}
        active={filter?.id.startsWith("source:") ? filter.id.slice(7) : null}
        onPick={(source) => pick({ id: `source:${source.handle}`, label: source.name, test: (p) => p.source.handle === source.handle })}
      />
      )}
      <Trends
        list={trending(posts)}
        t={t}
        active={filter?.id.startsWith("topic:") ? filter.id.slice(6) : null}
        onPick={(topic) => pick({ id: `topic:${topic.key}`, label: t.topics[topic.key], test: (p) => topic.match.test(words(p)) })}
      />
    </div>
  );
}
