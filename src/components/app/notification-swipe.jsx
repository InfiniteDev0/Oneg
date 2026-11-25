"use client";

// Barista's notification gestures (notifications-sheet/swipe-notification.tsx
// and swipe-reveal.tsx), in JavaScript.
//   Phones     swipe a card right and it's cleared, left and it opens; what each
//              way does shows under the card as it moves.
//   Computers  like an iPhone notification: drag a card left and a Clear button
//              slides out on its right, right and an Open button slides out on
//              its left; drag it most of the way (or fast) and it's done.
//              Clicking a card that's slid open closes it. One open at a time.

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** How far (px) a card must be swiped, either way, to count (phones). */
export const SWIPE_AT = 96;
export const SNAP = { type: "spring", stiffness: 500, damping: 40 };
/** How far a card slides to show its Clear or Open button (computers). */
export const REVEAL = 88;

const REVEAL_BUTTON =
  "flex w-[4.75rem] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl text-[0.8125rem] font-bold text-white outline-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)] focus-visible:ring-3";

export function SwipeNotification({ onClear, onOpen, clearLabel, openLabel, pill = true, children }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const clearOpacity = useTransform(x, [0, 24, SWIPE_AT], [0, 0, 1]);
  const openOpacity = useTransform(x, [-SWIPE_AT, -24, 0], [1, 0, 0]);
  // letting go of a drag also fires a click on the card; this swallows it
  const dragged = useRef(false);

  const away = async (to, then) => {
    await animate(x, to, { duration: 0.2, ease: "easeIn" });
    then();
  };

  return (
    <div ref={ref} className="relative">
      {/* level with the card's body, under the pill's gap */}
      <motion.div
        aria-hidden
        style={{ opacity: clearOpacity }}
        className={cn("absolute inset-x-0 bottom-0 flex items-center gap-2 rounded-2xl bg-red-500 ps-6 text-[0.8125rem] font-bold text-white", pill ? "top-8.5" : "top-0")}
      >
        <Trash2 className="size-5" />
        {clearLabel}
      </motion.div>
      <motion.div
        aria-hidden
        style={{ opacity: openOpacity }}
        className={cn("absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 rounded-2xl bg-blue-500 pe-6 text-[0.8125rem] font-bold text-white", pill ? "top-8.5" : "top-0")}
      >
        <Eye className="size-5" />
        {openLabel}
      </motion.div>

      <motion.div
        style={{ x }}
        drag="x"
        dragElastic={0.1}
        dragMomentum={false}
        onPointerDownCapture={() => {
          dragged.current = false;
        }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={(_, info) => {
          const at = x.get();
          const width = ref.current?.offsetWidth ?? 400;
          if (at > SWIPE_AT || (info.velocity.x > 800 && at > SWIPE_AT / 2)) {
            away(width + 40, onClear);
          } else if (at < -SWIPE_AT || (info.velocity.x < -800 && at < -SWIPE_AT / 2)) {
            away(-width - 40, () => {
              onOpen();
              // back in place, for when the sheet opens again
              x.set(0);
            });
          } else {
            animate(x, 0, SNAP);
          }
        }}
        onClickCapture={(event) => {
          if (!dragged.current) return;
          event.preventDefault();
          event.stopPropagation();
          dragged.current = false;
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** revealed: "clear" | "open" | null — which button this card is slid open to show. */
export function SwipeReveal({ revealed, onRevealChange, onClear, onOpen, clearLabel, openLabel, pill = true, children }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  // each button fades in as the card slides away from it
  const clearOpacity = useTransform(x, [-REVEAL, -24, 0], [1, 0, 0]);
  const openOpacity = useTransform(x, [0, 24, REVEAL], [0, 0, 1]);
  const dragged = useRef(false);

  // opening another card closes this one
  useEffect(() => {
    const controls = animate(x, revealed === "clear" ? -REVEAL : revealed === "open" ? REVEAL : 0, SNAP);
    return () => controls.stop();
  }, [revealed, x]);

  const clear = async () => {
    const width = ref.current?.offsetWidth ?? 400;
    await animate(x, -width - 40, { duration: 0.2, ease: "easeIn" });
    onClear();
  };

  return (
    <div ref={ref} className="relative">
      {/* level with the card's body, under the pill's gap */}
      <div className={cn("absolute start-0 bottom-0 flex w-22 justify-start", pill ? "top-8.5" : "top-0")}>
        <motion.button
          type="button"
          style={{ opacity: openOpacity }}
          tabIndex={revealed === "open" ? 0 : -1}
          aria-hidden={revealed !== "open"}
          onClick={() => {
            onRevealChange(null);
            onOpen();
          }}
          className={cn(REVEAL_BUTTON, "bg-blue-500 focus-visible:ring-blue-500/30")}
        >
          <Eye className="size-5" />
          {openLabel}
        </motion.button>
      </div>
      <div className={cn("absolute end-0 bottom-0 flex w-22 justify-end", pill ? "top-8.5" : "top-0")}>
        <motion.button
          type="button"
          style={{ opacity: clearOpacity }}
          tabIndex={revealed === "clear" ? 0 : -1}
          aria-hidden={revealed !== "clear"}
          onClick={() => clear()}
          className={cn(REVEAL_BUTTON, "bg-red-500 focus-visible:ring-red-500/30")}
        >
          <Trash2 className="size-5" />
          {clearLabel}
        </motion.button>
      </div>

      <motion.div
        style={{ x }}
        drag="x"
        dragElastic={0.1}
        dragMomentum={false}
        onPointerDownCapture={() => {
          dragged.current = false;
        }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={(_, info) => {
          const at = x.get();
          const width = ref.current?.offsetWidth ?? 400;
          if (at < -width / 2 || (info.velocity.x < -800 && at < -REVEAL / 2)) {
            clear();
            return;
          }
          if (at > width / 2 || (info.velocity.x > 800 && at > REVEAL / 2)) {
            onRevealChange(null);
            onOpen();
            animate(x, 0, SNAP);
            return;
          }
          const next = at < -REVEAL / 2 ? "clear" : at > REVEAL / 2 ? "open" : null;
          animate(x, next === "clear" ? -REVEAL : next === "open" ? REVEAL : 0, SNAP);
          onRevealChange(next);
        }}
        onClickCapture={(event) => {
          if (dragged.current || revealed) {
            event.preventDefault();
            event.stopPropagation();
            dragged.current = false;
            if (revealed) onRevealChange(null);
          }
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}
