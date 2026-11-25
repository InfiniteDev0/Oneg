"use client";

// Two panes with a line down between them that drags sideways, as VS Code's.
// Barista's calculator line (StartCalculation): a 1px line in the border colour
// with a three-dot grip in its middle, both turning the ring colour under the
// pointer or while held; it stays between a quarter and three quarters across, a
// double-click puts it back where it started, and the arrow keys move it.
// Where you leave it is kept in this browser (storageKey). Stacked on a narrow
// screen, without the line. In Arabic the panes swap sides, and so does the drag.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MIN = 25;
const MAX = 75;
const clamp = (n) => Math.min(MAX, Math.max(MIN, n));

export function SplitPane({ start, end, storageKey, initial = 50, label = "Drag to resize", className, startClassName, endClassName }) {
  const box = useRef(null);
  const [split, setSplit] = useState(initial);
  const [dragging, setDragging] = useState(false);

  // Read after the first paint, so the server's page and the browser's agree
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(storageKey));
      if (saved >= MIN && saved <= MAX) setSplit(saved);
    } catch {
      // storage blocked: it starts where it starts
    }
  }, [storageKey]);
  const keep = (value) => {
    setSplit(value);
    try {
      localStorage.setItem(storageKey, String(value));
    } catch {
      // not remembered
    }
  };

  const rtl = () => box.current && getComputedStyle(box.current).direction === "rtl";

  const startDrag = (event) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    const flip = rtl();
    setDragging(true);
    let last = split;
    const move = (e) => {
      const from = flip ? rect.right - e.clientX : e.clientX - rect.left;
      last = clamp((from / rect.width) * 100);
      setSplit(last);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setDragging(false);
      keep(last);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    // the whole page shows the drag cursor and selects nothing while it's held
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const onKey = (event) => {
    const step = event.key === "ArrowLeft" ? -2 : event.key === "ArrowRight" ? 2 : 0;
    if (!step) return;
    event.preventDefault();
    keep(clamp(split + (rtl() ? -step : step)));
  };

  return (
    <div ref={box} style={{ "--split": `${split}%` }} className={cn("flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch", className)}>
      <div className={cn("flex min-h-0 min-w-0 flex-col lg:w-(--split) lg:flex-none", startClassName)}>{start}</div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={label}
        aria-valuenow={Math.round(split)}
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        tabIndex={0}
        onPointerDown={startDrag}
        onDoubleClick={() => keep(initial)}
        onKeyDown={onKey}
        className="group relative z-10 -mx-2 hidden w-4 shrink-0 cursor-col-resize touch-none justify-center outline-none lg:flex"
      >
        <span
          className={cn(
            "h-full w-px transition-colors duration-150",
            dragging ? "bg-ring" : "bg-border group-hover:bg-ring group-focus-visible:bg-ring"
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-1 rounded-full bg-canvas px-1 py-2 transition-colors duration-150",
            dragging ? "text-ring" : "text-muted-foreground group-hover:text-ring group-focus-visible:text-ring"
          )}
        >
          <span className="size-1 rounded-full bg-current" />
          <span className="size-1 rounded-full bg-current" />
          <span className="size-1 rounded-full bg-current" />
        </span>
      </div>

      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col border-t border-border pt-6 lg:border-t-0 lg:ps-8 lg:pt-0", endClassName)}>{end}</div>
    </div>
  );
}
