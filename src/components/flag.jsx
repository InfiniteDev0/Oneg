import { cn } from "@/lib/utils";

// A small rectangular country flag (ISO 3166 code, e.g. "KE").
// The SVGs live in public/flags (from the MIT-licensed country-flag-icons package).
export function Flag({ code, className }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${code}.svg`}
      alt=""
      aria-hidden="true"
      width={21}
      height={14}
      className={cn("h-3.5 w-auto shrink-0 rounded-xs", className)}
    />
  );
}
