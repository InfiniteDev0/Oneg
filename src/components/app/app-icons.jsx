// Icons for the signed-in app's frame, drawn to match ClickUp's (and Barista's) where
// lucide has nothing close. All take the current text colour unless they have their own.

import { cn } from "@/lib/utils";

/** Barista's Create: a tick in a circle with a small plus at its shoulder. */
export function CreateGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M21 12a9 9 0 1 1-6.2-8.56" />
      <path d="m8.5 12 2.5 2.5 5-5" />
      <path d="M19 2v6M16 5h6" />
    </svg>
  );
}

/** ClickUp's Planner: a calendar page with "24" on it. */
export function PlannerGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
      <path d="M8 3v4M16 3v4" />
      <text x="12" y="17.2" textAnchor="middle" fontSize="7.6" fontWeight="700" fill="currentColor" stroke="none" fontFamily="system-ui, sans-serif">
        24
      </text>
    </svg>
  );
}

/** ClickUp's Upgrade: a light bulb with sparkles. */
export function UpgradeGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 6a5 5 0 0 0-3 9c.6.5 1 1.2 1 2v1h4v-1c0-.8.4-1.5 1-2a5 5 0 0 0-3-9Z" />
      <path d="M4 4.5 5.2 5.7M20 4.5l-1.2 1.2M12 1.5V3M3 10.5h1.5M19.5 10.5H21" />
    </svg>
  );
}

/** ClickUp's Install: an arrow into a tray. */
export function InstallGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 3v11M7.5 9.5 12 14l4.5-4.5" />
      <path d="M4 14.5V18a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18v-3.5" />
    </svg>
  );
}

/**
 * ClickUp's Home tile: a house with a smile, white on a blurred glow of colour
 * (Oneg's cyans and blues instead of ClickUp's pinks), with a count badge.
 */
export function HomeTile({ count, className }) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <span className="oneg-tile-glow grid size-9 place-items-center rounded-xl text-white">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[1.15rem]">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.2 2.6a3 3 0 0 0-2.4 0C7.6 4 5.2 5.9 3.9 7a3.2 3.2 0 0 0-1.1 2.3C2.7 10.4 2.6 12.2 2.6 14c0 1.5.1 2.9.1 4a3.2 3.2 0 0 0 3.1 3.1c1.5.1 3.6.1 6.2.1s4.7 0 6.2-.1a3.2 3.2 0 0 0 3.1-3.1c.1-1.1.1-2.5.1-4 0-1.8-.1-3.6-.2-4.7A3.2 3.2 0 0 0 20.1 7c-1.3-1.1-3.7-3-6.9-4.4ZM7.4 15.1c.1.2 1.3 2.6 4.6 2.6s4.5-2.4 4.6-2.5a1 1 0 0 0-1.8-.9c0 .1-.7 1.4-2.8 1.4s-2.8-1.3-2.8-1.4a1 1 0 0 0-1.8.8Z"
          />
        </svg>
      </span>
      {count ? (
        <span className="absolute -end-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#e5397f] px-1 text-[0.625rem] font-bold text-white ring-2 ring-background">
          {count}
        </span>
      ) : null}
    </span>
  );
}

/** ClickUp's More: four app tiles (a doc, a chart, a whiteboard, and +). */
export function MoreCluster({ className }) {
  return (
    <span className={cn("grid grid-cols-2 gap-[3px]", className)} aria-hidden="true">
      <span className="grid size-[0.95rem] place-items-center rounded-[4px] bg-[#4cb8f5]">
        <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round">
          <path d="M3 4h6M3 6h6M3 8h4" />
        </svg>
      </span>
      <span className="grid size-[0.95rem] place-items-center rounded-[4px] bg-[#b260d8]">
        <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3.5 9V7M6 9V4.5M8.5 9V3" />
        </svg>
      </span>
      <span className="grid size-[0.95rem] place-items-center rounded-[4px] bg-[#f6c544]">
        <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="#3a2d00" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 8c1-3 2-3 2.5-1.5S6.5 8.5 7.5 5 9.5 4 9.5 5" />
        </svg>
      </span>
      <span className="grid size-[0.95rem] place-items-center rounded-full bg-white">
        <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="#141414" strokeWidth="1.8" strokeLinecap="round">
          <path d="M6 3v6M3 6h6" />
        </svg>
      </span>
    </span>
  );
}

/** Your initials in a circle, with the green "online" dot. */
export function AvatarBadge({ initials, size = "size-7", dot = true, className }) {
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center rounded-full bg-foreground text-[0.7rem] font-bold text-background", size, className)}>
      {initials}
      {dot && <span className="absolute -end-0.5 -bottom-0.5 size-2.5 rounded-full bg-[#22c55e] ring-2 ring-background" />}
    </span>
  );
}

/** The workspace's letter in a rounded square (ClickUp's teal "A"). */
export function WorkspaceBadge({ letter, className }) {
  return (
    <span className={cn("grid size-6 shrink-0 place-items-center rounded-md bg-[#1fb5a0] text-[0.8rem] font-bold text-white", className)}>
      {letter}
    </span>
  );
}
