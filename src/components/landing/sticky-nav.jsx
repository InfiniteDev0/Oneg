"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// The navbar's shell: stays pinned to the top of the window. At the top of the
// page it is solid white; once you scroll it turns to frosted glass (see-through,
// blurring the page behind it) with a thin line under it.
export default function StickyNav({ children }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      // sticky + relative: pinned, and still the anchor for the mega-menu panel under it
      className={cn(
        "sticky top-0 z-40 border-b text-navbar-foreground transition-[background-color,border-color,backdrop-filter] duration-200",
        scrolled
          ? "border-border/70 bg-navbar/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-navbar"
      )}
    >
      {children}
    </header>
  );
}
