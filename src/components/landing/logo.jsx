// Oneg logo: a bold rounded cyan "O" ring followed by "neg".
export function OnegMark({ className = "" }) {
  return (
    <svg viewBox="0 0 120 80" className={`text-oneg-cyan ${className}`} aria-hidden="true" fill="currentColor">
      {/* Ring: rounded outer shape with a pill-shaped hole */}
      <path
        fillRule="evenodd"
        d="M36 4h48a32 32 0 0 1 32 32v8a32 32 0 0 1-32 32H36A32 32 0 0 1 4 44v-8A32 32 0 0 1 36 4Zm3 23a13 13 0 0 0 0 26h42a13 13 0 0 0 0-26H39Z"
      />
    </svg>
  );
}

export function Logo({ className = "" }) {
  return (
    // The logo always reads left-to-right, even on Arabic pages
    <span dir="ltr" className={`inline-flex items-center ${className}`}>
      <OnegMark className="h-[1.9rem] w-auto" />
      <span className="-ms-px text-[2rem] leading-none font-semibold tracking-tight">neg</span>
    </span>
  );
}
