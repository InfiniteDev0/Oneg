"use client";

// a card tool's name on hover — above it, so the pointer never covers it (side moves it)

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/milo-tooltip";

export function Tip({ label, side = "top", children }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side} sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
