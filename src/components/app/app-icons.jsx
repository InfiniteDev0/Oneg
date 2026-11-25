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

/** Milo's top bar calendar: Streamline's Calendar Mark (Flex), in the text colour. */
export function CalendarMark({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.50342 2.08975c1.07975 -0.07862 1.9909 -0.10489 2.49662 -0.10489 0.50463 0 1.41298 0.02616 2.48971 0.10439V0.915039c0 -0.414213 0.33578 -0.75 0.74995 -0.75 0.4143 0 0.75 0.335786 0.75 0.75V2.23595c1.416 0.26692 2.5028 1.43251 2.6276 2.90096 0.1014 1.19267 0.1327 2.27823 0.1327 2.7742 0 0.4959 -0.0313 1.58024 -0.1326 2.77199 -0.1329 1.563 -1.3557 2.7829 -2.9052 2.9412 -1.5898 0.1623 -3.02514 0.2107 -3.71217 0.2107 -0.68702 0 -2.12236 -0.0484 -3.71216 -0.2107C1.73834 13.466 0.515581 12.2461 0.382648 10.6831 0.281291 9.49137 0.25 8.40702 0.25 7.91111c0 -0.49599 0.031302 -1.58155 0.132704 -2.77421C0.50735 3.67085 1.59081 2.50666 3.00342 2.23726l0 -1.322221c0 -0.414213 0.33578 -0.75 0.75 -0.75 0.41421 0 0.75 0.335786 0.75 0.75V2.08975ZM3.5 5.58936c-0.34518 0 -0.625 0.27982 -0.625 0.625 0 0.34517 0.27982 0.625 0.625 0.625H4c0.34518 0 0.625 -0.27983 0.625 -0.625 0 -0.34518 -0.27982 -0.625 -0.625 -0.625h-0.5Zm-0.625 3.625c0 -0.34518 0.27982 -0.625 0.625 -0.625H4c0.34518 0 0.625 0.27982 0.625 0.625 0 0.34517 -0.27982 0.625 -0.625 0.625h-0.5c-0.34518 0 -0.625 -0.27983 -0.625 -0.625Zm3.875 -3.625c-0.34518 0 -0.625 0.27982 -0.625 0.625 0 0.34517 0.27982 0.625 0.625 0.625h0.5c0.34518 0 0.625 -0.27983 0.625 -0.625 0 -0.34518 -0.27982 -0.625 -0.625 -0.625h-0.5Zm2.625 0.625c0 -0.34518 0.27982 -0.625 0.625 -0.625h0.5c0.3452 0 0.625 0.27982 0.625 0.625 0 0.34517 -0.2798 0.625 -0.625 0.625H10c-0.34518 0 -0.625 -0.27983 -0.625 -0.625Zm-2.625 2.375c-0.34518 0 -0.625 0.27982 -0.625 0.625 0 0.34517 0.27982 0.625 0.625 0.625h0.5c0.34518 0 0.625 -0.27983 0.625 -0.625 0 -0.34518 -0.27982 -0.625 -0.625 -0.625h-0.5Z"
      />
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
    <span className={cn("grid grid-cols-2 gap-[2px]", className)} aria-hidden="true">
      <span className="grid size-[0.62rem] place-items-center rounded-[2.5px] -rotate-12 bg-[#4cb8f5]">
        <svg viewBox="0 0 12 12" className="size-[0.4rem]" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round">
          <path d="M2.5 3.5h7M2.5 6h7M2.5 8.5h4.5" />
        </svg>
      </span>
      <span className="grid size-[0.62rem] place-items-center rounded-[2.5px] rotate-12 bg-[#b260d8]">
        <svg viewBox="0 0 12 12" className="size-[0.4rem]" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 10V7.5M6 10V4.5M9 10V2" />
        </svg>
      </span>
      <span className="grid size-[0.62rem] place-items-center rounded-[2.5px] rotate-12 bg-[#f6c544]">
        <svg viewBox="0 0 12 12" className="size-[0.4rem]" fill="none" stroke="#3a2d00" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 8.5c1.2-4 2.4-4 3-2s1.8 2.5 3 -1.5 2.5-1.5 3-.5" />
        </svg>
      </span>
      <span className="grid size-[0.62rem] place-items-center rounded-full -rotate-12 bg-white">
        <svg viewBox="0 0 12 12" className="size-[0.4rem]" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round">
          <path d="M6 2.5v7M2.5 6h7" />
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
