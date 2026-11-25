"use client";

// Home's For You feed: real health news (/api/health-feed) laid out as
// Twitter's timeline. Each post: the source's picture, name, @handle and how
// long ago; the headline and a line or two; the picture; where it's from. Under
// it, Ask Lara (she explains the story), Like, Save and Share; likes and saves
// are kept in this browser. A click on the post opens the story on its site.
// More loads as you near the bottom. The posts come from useHealthFeed, which
// Home holds so the side column (who to follow, trends) reads the same ones; a
// filter from there (a topic, or one source) narrows what's shown.
// On For You, Twitter's box to write a post sits on top, with your posts under
// it; scrolled past, a round pen button stands in for it (feed-composer.jsx).

import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, Heart, Share, X } from "lucide-react";
import { gooeyToast } from "goey-toast";
import { OPEN_LARA } from "@/components/lara/lara-chat";
import { cn } from "@/lib/utils";
import { FeedComposer, FeedPenButton, MyPost, useMyPosts } from "./feed-composer";

const LIKES = "oneg.feed.likes";
const SAVES = "oneg.feed.saves";

function readSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]"));
  } catch {
    return new Set();
  }
}
function writeSet(key, set) {
  try {
    // the newest few hundred is plenty
    localStorage.setItem(key, JSON.stringify([...set].slice(-500)));
  } catch {
    // not remembered
  }
}

// "5m", "3h", "2d", then "Nov 20", as Twitter shows it
function when(iso, lang) {
  const minutes = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  try {
    return new Intl.DateTimeFormat(lang, { month: "short", day: "numeric" }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleDateString();
  }
}

// the source's own picture, or its first letter on a colour of its own
const SWATCHES = ["#1d9bf0", "#7856ff", "#00ba7c", "#f91880", "#ff7a00", "#14b8a6"];
function SourceAvatar({ source }) {
  const [broken, setBroken] = useState(false);
  if (source.icon && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={source.icon} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} className="size-10 shrink-0 rounded-full bg-white object-contain" />
    );
  }
  const n = [...source.name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ background: SWATCHES[n % SWATCHES.length] }}>
      {source.name.trim()[0]?.toUpperCase()}
    </span>
  );
}

function Picture({ src }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className="mt-3 aspect-video w-full rounded-2xl border border-border object-cover"
    />
  );
}

// Twitter's action: grey at rest, its own colour (and a soft circle) under the pointer
function Action({ label, onClick, active, tone, children }) {
  const tones = {
    lara: "hover:text-action [&:hover>span:first-child]:bg-action/10",
    like: cn("hover:text-[#f91880] [&:hover>span:first-child]:bg-[#f91880]/10", active && "text-[#f91880]"),
    save: cn("hover:text-action [&:hover>span:first-child]:bg-action/10", active && "text-action"),
    share: "hover:text-action [&:hover>span:first-child]:bg-action/10",
  };
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn("group/action flex cursor-pointer items-center gap-1 text-[0.8125rem] text-muted-foreground outline-none transition-colors", tones[tone])}
    >
      <span className="grid size-8 place-items-center rounded-full transition-colors group-focus-visible/action:ring-2 group-focus-visible/action:ring-ring [&_svg]:size-4.5">
        {children}
      </span>
    </button>
  );
}

function Post({ post, t, lang, liked, saved, onLike, onSave }) {
  const open = () => window.open(post.url, "_blank", "noopener,noreferrer");
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: post.title, url: post.url });
      else {
        await navigator.clipboard.writeText(post.url);
        gooeyToast.success(t.copied);
      }
    } catch {
      // closed the share sheet, or the clipboard is blocked
    }
  };
  const askLara = () =>
    window.dispatchEvent(new CustomEvent(OPEN_LARA, { detail: { ask: t.laraAsk.replace("{title}", post.title).replace("{url}", post.url) } }));

  return (
    <article
      onClick={open}
      className="flex cursor-pointer gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-foreground/3"
    >
      <SourceAvatar source={post.source} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1 text-[0.9375rem] leading-5">
          <span className="truncate font-bold">{post.source.name}</span>
          <span className="truncate text-muted-foreground">@{post.source.handle}</span>
          <span className="shrink-0 text-muted-foreground">· {when(post.publishedAt, lang)}</span>
        </div>
        <p className="mt-0.5 text-[0.9375rem] leading-5 font-medium">{post.title}</p>
        {post.text && <p className="mt-1 line-clamp-3 text-[0.9375rem] leading-5 text-muted-foreground">{post.text}</p>}
        <Picture src={post.image} />
        <p className="mt-2 truncate text-[0.8125rem] text-muted-foreground">{post.source.site}</p>
        <div className="-ms-2 mt-1 flex max-w-md items-center justify-between">
          <Action label={t.askLara} tone="lara" onClick={askLara}>
            {/* Lara's two eyes */}
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="5" y="4" width="5" height="16" rx="2.5" />
              <rect x="14" y="4" width="5" height="16" rx="2.5" />
            </svg>
          </Action>
          <Action label={liked ? t.liked : t.like} tone="like" active={liked} onClick={onLike}>
            <Heart className={cn(liked && "fill-current")} />
          </Action>
          <Action label={saved ? t.saved : t.save} tone="save" active={saved} onClick={onSave}>
            <Bookmark className={cn(saved && "fill-current")} />
          </Action>
          <Action label={t.share} tone="share" onClick={share}>
            <Share />
          </Action>
        </div>
      </div>
    </article>
  );
}

function Skeleton() {
  const block = "oneg-sheen rounded-md bg-black/5 dark:bg-white/5";
  return (
    <div className="flex gap-3 border-b border-border px-4 py-3">
      <span className={cn(block, "size-10 shrink-0 rounded-full")} />
      <div className="flex flex-1 flex-col gap-2">
        <span className={cn(block, "h-4 w-1/2")} />
        <span className={cn(block, "h-4 w-full")} />
        <span className={cn(block, "h-4 w-4/5")} />
        <span className={cn(block, "mt-1 aspect-video w-full rounded-2xl")} />
      </div>
    </div>
  );
}

/** The feed's posts: loaded once you're on For You, and more on request. */
export function useHealthFeed(lang, enabled = true) {
  const [posts, setPosts] = useState([]);
  const [next, setNext] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | more | error

  const load = useCallback(
    async (page) => {
      setState(page ? "more" : "loading");
      try {
        const res = await fetch(`/api/health-feed?lang=${lang}${page ? `&page=${encodeURIComponent(page)}` : ""}`);
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setPosts((list) => {
          if (!page) return data.posts;
          const have = new Set(list.map((p) => p.id));
          return [...list, ...data.posts.filter((p) => !have.has(p.id))];
        });
        setNext(data.next);
        setState("ready");
      } catch {
        setState(page ? "ready" : "error");
      }
    },
    [lang]
  );

  const started = useRef(false);
  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;
    load(null);
  }, [enabled, load]);

  return { posts, next, state, load };
}

// scope: which posts this view shows at all (Following: the sources you follow);
// empty: what to say when that leaves none
export function HealthFeed({ feed, t, lang, filter, onClearFilter, scope, empty }) {
  const { posts: all, next, state, load } = feed;
  const posts = all.filter((p) => (!scope || scope(p)) && (!filter || filter.test(p)));
  // narrowed, more comes only when asked (paging on its own could run through
  // the day's news looking for matches)
  const narrowed = Boolean(filter || scope);
  const [likes, setLikes] = useState(() => new Set());
  const [saves, setSaves] = useState(() => new Set());
  const sentinel = useRef(null);
  // the box to write in, and yours: only on For You, and not while narrowed
  const writing = !filter && !scope;
  const mine = useMyPosts();
  const composer = useRef(null);
  const [pen, setPen] = useState(false);
  // the pen brought the box to where you are (pinned to the top of the pane)
  const [pinned, setPinned] = useState(false);

  // the pen shows once the box has scrolled out of sight
  useEffect(() => {
    const el = composer.current;
    if (!writing || !el) {
      setPen(false);
      return;
    }
    const watch = new IntersectionObserver(([entry]) => setPen(!entry.isIntersecting));
    watch.observe(el);
    return () => watch.disconnect();
  }, [writing]);


  useEffect(() => {
    setLikes(readSet(LIKES));
    setSaves(readSet(SAVES));
  }, []);

  // nearing the bottom: the next lot
  useEffect(() => {
    const el = sentinel.current;
    // (not while filtered: it would page through the news looking for matches)
    if (!el || !next || state !== "ready" || narrowed) return;
    const watch = new IntersectionObserver((entries) => entries[0].isIntersecting && load(next), { rootMargin: "600px" });
    watch.observe(el);
    return () => watch.disconnect();
  }, [next, state, load, narrowed]);

  const toggle = (key, set, setSet, id) => {
    const copy = new Set(set);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setSet(copy);
    writeSet(key, copy);
  };

  return (
    <div className="w-full">
    <div className="mx-auto w-full max-w-150">
      {writing && (
        <>
          <FeedComposer ref={composer} t={t.composer} onPost={mine.add} pinned={pinned} onUnpin={() => setPinned(false)} />
          {mine.posts.map((post) => (
            <MyPost key={post.id} post={post} t={t.composer} when={when(post.publishedAt, lang)} onDelete={() => mine.remove(post.id)} />
          ))}
        </>
      )}
      {/* what the side column narrowed it to, with a way back to everything */}
      {filter && (
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-canvas/85 px-4 py-2.5 backdrop-blur">
          <span className="text-sm text-muted-foreground">{t.showing}</span>
          <span className="truncate text-sm font-bold">{filter.label}</span>
          <button
            type="button"
            onClick={onClearFilter}
            aria-label={t.clear}
            title={t.clear}
            className="ms-auto grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      {state === "loading" && [0, 1, 2].map((i) => <Skeleton key={i} />)}

      {state === "error" && (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <p className="text-muted-foreground">{t.error}</p>
          <button
            type="button"
            onClick={() => load(null)}
            className="h-9 cursor-pointer rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-90"
          >
            {t.retry}
          </button>
        </div>
      )}

      {state !== "loading" && state !== "error" && posts.length === 0 && (
        <p className="px-4 py-16 text-center text-muted-foreground">{filter ? t.noMatch : (empty ?? t.empty)}</p>
      )}

      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          t={t}
          lang={lang}
          liked={likes.has(post.id)}
          saved={saves.has(post.id)}
          onLike={() => toggle(LIKES, likes, setLikes, post.id)}
          onSave={() => toggle(SAVES, saves, setSaves, post.id)}
        />
      ))}

      {state === "more" && <Skeleton />}
      {narrowed && next && state === "ready" && (
        <div className="flex justify-center py-6">
          <button
            type="button"
            onClick={() => load(next)}
            className="h-9 cursor-pointer rounded-full border border-border px-4 text-sm font-bold transition-colors hover:bg-muted"
          >
            {t.more}
          </button>
        </div>
      )}
      <div ref={sentinel} className="h-px" />
      {posts.length > 0 && !next && state === "ready" && <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t.end}</p>}
    </div>
      {writing && <FeedPenButton show={pen && !pinned} label={t.composer.write} onClick={() => setPinned(true)} />}
    </div>
  );
}
