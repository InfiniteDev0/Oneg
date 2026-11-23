"use client";

// Lara's face, bottom right, on every website page. Same build as Milo's button
// in the Milo project (milo-chat/button.jsx): mounted on the client into <body>,
// same spot (48px up, 24px in), same 48px chip with 14px corners, shadow, hover
// grow and tooltip. The face is Lara's own: just two eyes.
// Opens Lara's chat; gone while it's open, since the panel has its own close.

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EyeTracker } from "./eye-tracker";

// module scope: an inline subscribe resubscribes every render and loops
const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

export default function LaraButton({ label, open, onOpen }) {
  // false on the server, true on the client, without an effect or a mismatch
  const ready = useSyncExternalStore(subscribe, onClient, onServer);
  if (!ready || open) return null;

  return createPortal(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            // the chip itself is EyeTracker's own button (.oneg-lara .eyt-hit in globals.css)
            <div className="oneg-lara fixed right-[24px] bottom-[48px] z-40" />
          }
        >
          {/* follow 25: a small turn, like Milo's (about 17 degrees), so both eyes stay on the chip */}
          <EyeTracker size={48} follow={25} eyeScale={1.5} within="body" label={label} onPress={onOpen} />
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
    document.body,
  );
}
