"use client";

// A button that opens Lara's panel (see OPEN_LARA in lara-chat.jsx)
import { OPEN_LARA } from "@/components/lara/lara-chat";

export function AskLaraButton({ label }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_LARA))}
      className="oneg-lara-pill mt-2 h-9 cursor-pointer"
    >
      <span className="flex h-full items-center gap-2 px-4 text-sm font-medium">
        {label}
        <span className="oneg-lara-face size-5 rounded-md" aria-hidden="true">
          <span className="flex gap-[2px]">
            <span className="h-[6px] w-[3px] rounded-full bg-white" />
            <span className="h-[6px] w-[3px] rounded-full bg-white" />
          </span>
        </span>
      </span>
    </button>
  );
}
