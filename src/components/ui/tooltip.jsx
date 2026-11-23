"use client"

// Copied from the Milo project (web/src/components/ui/tooltip.jsx), same Base UI
// version. Only change: Milo's colours and sizes are written in, in px, so the
// tooltip looks exactly like Milo's even though Oneg's page runs at 90% size and
// has its own colours. Milo: fill oklch(0.145 0 0) = #0a0a0a, text #f6f4f1,
// 12px text, 12px/6px padding, 8px corners, a 10px rounded diamond arrow.

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "@/lib/utils"

function TooltipProvider({
  delay = 0,
  ...props
}) {
  return (<TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />);
}

function Tooltip({
  ...props
}) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50">
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 inline-flex w-fit max-w-[320px] origin-(--transform-origin) items-center gap-[6px] rounded-[8px] bg-[#0a0a0a] px-[12px] py-[6px] text-[12px] leading-[16px] text-[#f6f4f1] data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}>
          {children}
          <TooltipPrimitive.Arrow
            className="z-50 size-[10px] translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-[#0a0a0a] fill-[#0a0a0a] data-[side=bottom]:top-[4px] data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-[4px] data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-[4px] data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-[4px] data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-[4px] data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-[10px]" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
