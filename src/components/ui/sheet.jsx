"use client";

// A panel anchored to an edge. Copied from the Milo project (web/src/components/ui/sheet.jsx);
// only change: classes go through cn() so a page can swap the panel colour.

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

export const SHEET_WIDTH = "min(27rem, calc(100vw - 2rem))";

const SIDES = {
  right: "inset-y-4 right-4 data-open:slide-in-from-right-8 data-closed:slide-out-to-right-8",
  bottom: "inset-x-4 bottom-4 data-open:slide-in-from-bottom-8 data-closed:slide-out-to-bottom-8",
  left: "inset-y-4 left-4 data-open:slide-in-from-left-8 data-closed:slide-out-to-left-8",
  // Oneg: a smaller window in the bottom corner, and the whole screen
  corner: "bottom-4 end-4 data-open:slide-in-from-bottom-8 data-closed:slide-out-to-bottom-8",
  full: "inset-4 data-open:zoom-in-95 data-closed:zoom-out-95",
};

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  // stays open while you use the page behind it: no backdrop, and clicking elsewhere doesn't close it
  floating = false,
  // floating, but a click outside still closes it
  dismissible = false,
  style,
  // extra classes for the panel, like a border or its own colour
  className = "",
  // Oneg: a ref to the element that gets focus when it opens (e.g. a text box)
  initialFocus,
  children,
}) {
  const bottom = side === "bottom";

  return (
    <DialogPrimitive.Root
      open={open}
      modal={!floating}
      disablePointerDismissal={floating && !dismissible}
      onOpenChange={(next, details) => onOpenChange(next, details)}
    >
      <DialogPrimitive.Portal>
        {!floating && (
          // Oneg: the rest of the app blurs behind the panel while it's open
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        )}

        <DialogPrimitive.Popup
          initialFocus={initialFocus}
          style={
            bottom
              ? { height: "min(60svh, 30rem)", ...style }
              : side === "full"
                ? style
                : side === "corner"
                  ? { width: "min(25rem, calc(100vw - 2rem))", height: "min(42rem, calc(100svh - 2rem))", ...style }
                  : { width: SHEET_WIDTH, ...style }
          }
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden rounded-2xl bg-card text-sm shadow-[0_24px_60px_rgba(0,0,0,0.14)] outline-none transition-[width,height] duration-300 ease-out data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            SIDES[side],
            className
          )}
        >
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
