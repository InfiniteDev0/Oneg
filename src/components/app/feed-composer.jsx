"use client";

// Twitter's "What is happening?!" box at the top of Home's feed, and the posts
// you write with it. Your picture, the box (it grows as you write), a photo you
// add, then the tools — Photo, Emoji, Bold, Italic — and Post. Bold and italic
// wrap the words you've selected (**bold**, _italic_) and show as such.
// Until accounts are on Supabase, your posts are kept in this browser only
// (useMyPosts) and show at the top of your feed, newest first.
// Also here: the round pen button that takes its place once you've scrolled
// past it (FeedPenButton). A click on the pen brings the box to you: pinned to
// the top of the feed where you are, ready to type, until you post, press
// Escape, or click away with nothing written.

import { forwardRef, useEffect, useRef, useState } from "react";
import { Bold, ImageIcon, Italic, Smile, Trash2, X } from "lucide-react";
import { gooeyToast } from "goey-toast";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { DEMO_ACCOUNT } from "@/lib/demo-account";
import { cn } from "@/lib/utils";
import { AvatarBadge } from "./app-icons";

const MINE = "oneg.feed.mine";
const MAX_POSTS = 20;
const MAX_CHARS = 280;
const EMOJIS = ["😊", "😷", "🤒", "🤕", "😴", "💪", "🙏", "❤️", "💊", "🩺", "🩹", "🏥", "🥗", "🍎", "💧", "🏃", "🧘", "🌿", "👶", "🤰", "🦟", "☀️", "👍", "🎉"];

const handle = DEMO_ACCOUNT.firstName.toLowerCase();

/** Your posts, kept in this browser. */
export function useMyPosts() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(MINE) ?? "[]");
      if (Array.isArray(saved)) setPosts(saved);
    } catch {
      // storage blocked
    }
  }, []);
  // returns false when the browser has no room for it (a big photo)
  const save = (next) => {
    try {
      localStorage.setItem(MINE, JSON.stringify(next));
    } catch {
      return false;
    }
    setPosts(next);
    return true;
  };
  return {
    posts,
    add: (post) => save([post, ...posts].slice(0, MAX_POSTS)),
    remove: (id) => save(posts.filter((p) => p.id !== id)),
  };
}

// A photo, made no bigger than 1280px so it fits in the browser's storage
function shrink(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

// **bold** and _italic_ shown as such; everything else as written
export function RichText({ text }) {
  return text.split(/(\*\*[^*\n]+\*\*|_[^_\n]+_)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^_[^_]+_$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

const TOOL =
  "grid size-8 cursor-pointer place-items-center rounded-full text-action outline-none transition-colors hover:bg-action/10 focus-visible:ring-2 focus-visible:ring-action disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent [&_svg]:size-4.5";

export const FeedComposer = forwardRef(function FeedComposer({ t, onPost, pinned = false, onUnpin }, ref) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const box = useRef(null);
  const fileRef = useRef(null);

  // the box grows with what you write
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  // put words where the cursor is (or around what's selected)
  const insert = (before, after = "") => {
    const el = box.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + before + text.slice(start, end) + after + text.slice(end);
    setText(next.slice(0, MAX_CHARS));
    requestAnimationFrame(() => {
      el?.focus();
      const at = end + before.length + (start === end ? 0 : after.length);
      el?.setSelectionRange(at, at);
    });
  };

  const pick = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      setImage(await shrink(file));
    } catch {
      gooeyToast.error(t.photoFailed);
    }
  };

  const left = MAX_CHARS - text.length;
  const ready = text.trim().length > 0 || image;
  const post = () => {
    if (!ready) return;
    const ok = onPost({ id: `mine:${Date.now()}`, text: text.trim(), image, publishedAt: new Date().toISOString() });
    if (!ok) return gooeyToast.error(t.noRoom);
    setText("");
    setImage(null);
    onUnpin?.();
  };

  // brought here by the pen: ready to type
  useEffect(() => {
    if (pinned) box.current?.focus({ preventScroll: true });
  }, [pinned]);

  return (
    <div
      ref={ref}
      onKeyDown={(e) => pinned && e.key === "Escape" && onUnpin?.()}
      onBlur={(e) => {
        // clicked away with nothing written (the emoji menu is drawn elsewhere, but is still the box's)
        const to = e.relatedTarget;
        if (!pinned || e.currentTarget.contains(to) || to?.closest?.("[data-morph-popover-portal]")) return;
        if (!text.trim() && !image) onUnpin?.();
      }}
      className={cn(
        "flex gap-3 border-b border-border px-4 pt-3 pb-2",
        pinned && "sticky top-0 z-20 bg-canvas duration-200 animate-in fade-in-0 slide-in-from-top-3"
      )}
    >
      <AvatarBadge initials={DEMO_ACCOUNT.initials} size="size-10" dot={false} className="text-sm" />
      <div className="min-w-0 flex-1">
        <textarea
          ref={box}
          rows={1}
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") post();
          }}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          className="block w-full resize-none bg-transparent py-2 text-xl leading-7 outline-none placeholder:text-muted-foreground"
        />
        {image && (
          <div className="relative mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="max-h-96 w-full rounded-2xl border border-border object-cover" />
            <button
              type="button"
              aria-label={t.removePhoto}
              onClick={() => setImage(null)}
              className="absolute end-2 top-2 grid size-8 cursor-pointer place-items-center rounded-full bg-black/70 text-white backdrop-blur transition-colors hover:bg-black/85"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="-ms-2 mt-2 flex items-center gap-0.5">
          <button type="button" aria-label={t.photo} title={t.photo} onClick={() => fileRef.current?.click()} disabled={!!image} className={TOOL}>
            <ImageIcon />
          </button>
          <MorphPopover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <MorphPopoverTrigger>
              <button type="button" aria-label={t.emoji} title={t.emoji} className={TOOL}>
                <Smile />
              </button>
            </MorphPopoverTrigger>
            <MorphPopoverContent side="bottom" align="start" sideOffset={6} radius={12} className="grid w-64 grid-cols-6 gap-0.5 border-0 p-1.5">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    insert(emoji);
                    setEmojiOpen(false);
                  }}
                  className="grid size-9 cursor-pointer place-items-center rounded-lg text-xl transition-colors hover:bg-muted"
                >
                  {emoji}
                </button>
              ))}
            </MorphPopoverContent>
          </MorphPopover>
          <button type="button" aria-label={t.bold} title={t.bold} onClick={() => insert("**", "**")} className={TOOL}>
            <Bold />
          </button>
          <button type="button" aria-label={t.italic} title={t.italic} onClick={() => insert("_", "_")} className={TOOL}>
            <Italic />
          </button>

          <span className="flex-1" />
          {left <= 40 && <span className={cn("me-3 text-[0.8125rem] tabular-nums", left <= 10 ? "text-[#f4212e]" : "text-muted-foreground")}>{left}</span>}
          <button
            type="button"
            onClick={post}
            disabled={!ready}
            className="h-9 cursor-pointer rounded-full bg-action px-4 text-[0.9375rem] font-bold text-white transition-colors hover:bg-action-hover disabled:cursor-default disabled:opacity-50 disabled:hover:bg-action"
          >
            {t.post}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
});

/** One of your posts, as the news posts look, with Delete instead of the link. */
export function MyPost({ post, t, when, onDelete }) {
  return (
    <article className="flex gap-3 border-b border-border px-4 py-3">
      <AvatarBadge initials={DEMO_ACCOUNT.initials} size="size-10" dot={false} className="text-sm" />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1 text-[0.9375rem] leading-5">
          <span className="truncate font-bold">{DEMO_ACCOUNT.name}</span>
          <span className="truncate text-muted-foreground">@{handle}</span>
          <span className="shrink-0 text-muted-foreground">· {when}</span>
          <button
            type="button"
            aria-label={t.delete}
            title={t.delete}
            onClick={onDelete}
            className="ms-auto grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-[#f4212e]/10 hover:text-[#f4212e]"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        {post.text && (
          <p className="text-[0.9375rem] leading-5 break-words whitespace-pre-wrap">
            <RichText text={post.text} />
          </p>
        )}
        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt="" className="mt-3 max-h-[32rem] w-full rounded-2xl border border-border object-cover" />
        )}
      </div>
    </article>
  );
}

/** The round pen that stands in for the box once you've scrolled past it. */
export function FeedPenButton({ show, label, onClick }) {
  return (
    // sticks to the bottom of the feed's pane while it scrolls; takes no room
    <div className="pointer-events-none sticky bottom-5 z-10 h-0">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        tabIndex={show ? 0 : -1}
        className={cn(
          "absolute end-5 bottom-0 grid size-14 cursor-pointer place-items-center rounded-full bg-action text-white transition-[opacity,scale,background-color] duration-200 ease-out hover:bg-action-hover",
          show ? "pointer-events-auto scale-100 opacity-100" : "scale-75 opacity-0"
        )}
      >
        {/* Streamline's feather pen, given to us; its colour comes from the button */}
        <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden className="size-6">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M27.7897 2.77994C32.8929 0.861835 38.4179 0.146093 43.833 0.662701c1.8619 0.177634 3.3344 1.648979 3.5104 3.513119C48.3443 14.7778 44.4951 25.5302 36.8859 33.061c-0.4194 0.4149 -0.9507 0.6942 -1.5275 0.8055 -0.6317 0.1218 -2.3908 0.4546 -4.3942 0.759 0.6367 1.3004 0.3269 3.0069 -1.1563 3.8773 -4.8727 2.8596 -11.4818 4.9027 -18.0928 4.9027 -1.1046 0 -1.99999 -0.8954 -1.99999 -2 0 -1.1045 0.89539 -2 1.99999 -2 5.1138 0 10.2764 -1.3963 14.3677 -3.4332l-1.9447 -0.9667c-0.8313 -0.4133 -1.269 -1.3443 -1.0567 -2.2482 0.2122 -0.9038 1.0186 -1.5427 1.947 -1.5427 2.5653 0 7.5038 -0.884 9.2639 -1.2169 6.5834 -6.6484 9.9279 -16.0727 9.0767 -25.36109 -4.6418 -0.43044 -9.3696 0.15774 -13.7512 1.7328 -0.5119 1.26812 -1.3836 3.53502 -1.5996 4.68849 -0.1474 0.7869 -0.7498 1.4101 -1.5313 1.584 -0.7815 0.174 -1.5914 -0.1349 -2.0586 -0.785l-1.5288 -2.12716C15.8432 14.3231 10.7584 21.2506 9.14315 30.3853c1.94925 -2.3304 4.08695 -4.5477 6.33105 -6.6345 6.5389 -6.0804 14.0995 -11.1624 20.8725 -14.81111 0.179 -0.09938 0.3679 -0.1685 0.5603 -0.20857 0.2946 -0.06161 0.5952 -0.05453 0.8801 0.01468 0.2861 0.06929 0.5576 0.20151 0.7918 0.39242 0.1721 0.14002 0.3232 0.31087 0.4443 0.50984 0.1223 0.20008 0.2053 0.41414 0.2508 0.63274 0.0616 0.2945 0.0545 0.5952 -0.0147 0.8801 -0.1152 0.4744 -0.4027 0.9051 -0.8322 1.1915 -13.1878 9.0392 -26.3433 20.6428 -34.17876 34.1211 -0.08688 0.1565 -0.193 0.298 -0.31424 0.4224 -0.20977 0.2158 -0.46228 0.3775 -0.73586 0.4791 -0.2744 0.1023 -0.57226 0.1451 -0.87318 0.1184 -0.22252 -0.0195 -0.44453 -0.0766 -0.65662 -0.174 -0.21232 -0.0968 -0.40071 -0.2274 -0.56092 -0.3831 -0.21702 -0.2102 -0.379441 -0.4636 -0.481445 -0.7381 -0.102042 -0.2738 -0.144818 -0.5708 -0.118476 -0.871 0.01495 -0.1732 0.052733 -0.3461 0.114524 -0.5143 0.978087 -2.8261 2.334517 -5.5648 3.974967 -8.1958 0.05767 -14.0893 6.84641 -24.56 16.99571 -30.79317 1.2451 -0.76465 2.7987 -0.50186 3.7478 0.49682 0.3089 -0.81605 0.5927 -1.51301 0.7486 -1.89165 0.3124 -0.75822 0.9254 -1.35782 1.7005 -1.64916Z"
          />
        </svg>
      </button>
    </div>
  );
}
