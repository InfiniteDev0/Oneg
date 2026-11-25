"use client";

// The phone in the top bar (the bar's own grey, as its other icons): emergency numbers, one tap to call (on a phone,
// tel: links dial straight away). Kenya's for now — our launch market — and
// Lara for first aid while help is on its way.

import { useState } from "react";
import { Phone, PhoneCall } from "lucide-react";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { OPEN_LARA } from "@/components/lara/lara-chat";
import { cn } from "@/lib/utils";
import { BAR_ICON } from "./top-bar";

const NUMBERS = [
  { number: "999", key: "police" },
  { number: "112", key: "any" },
  { number: "1199", key: "redCross" },
];

export function EmergencyButton({ t }) {
  const e = t.emergency;
  const [open, setOpen] = useState(false);

  return (
    <MorphPopover open={open} onOpenChange={setOpen}>
      <MorphPopoverTrigger>
        {/* the popover hands its click straight to this button, so no tooltip wrapper; a title instead */}
        <button type="button" aria-label={e.title} title={e.title} className={cn(BAR_ICON, "aria-expanded:bg-muted aria-expanded:text-foreground")}>
          <PhoneCall />
        </button>
      </MorphPopoverTrigger>
      <MorphPopoverContent side="bottom" align="end" sideOffset={6} radius={14} className="flex w-76 flex-col gap-1 border-0 p-1.5">
        <div className="px-2.5 pt-2 pb-1.5">
          <p className="text-[0.9375rem] font-semibold">{e.title}</p>
          <p className="text-[0.8125rem] text-muted-foreground">{e.body}</p>
        </div>
        {NUMBERS.map(({ number, key }, i) => (
          <a
            key={number}
            href={`tel:${number}`}
            className={cn(
              "flex items-center gap-3 rounded-xl px-2.5 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-red-500/40",
              i === 0 ? "bg-red-500/10 hover:bg-red-500/20" : "hover:bg-muted"
            )}
          >
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", i === 0 ? "bg-red-500 text-white" : "bg-red-500/10 text-red-500")}>
              <Phone className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold tabular-nums">{number}</span>
              <span className="block truncate text-xs text-muted-foreground">{e.numbers[key]}</span>
            </span>
            <span className="text-xs font-semibold text-red-500">{e.call}</span>
          </a>
        ))}
        <span className="mx-2.5 my-1 h-px bg-border" />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            window.dispatchEvent(new CustomEvent(OPEN_LARA, { detail: { ask: e.firstAidAsk } }));
          }}
          className="flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-start text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
        >
          <span className="oneg-lara-face size-[1.05rem] rounded-[5px]" aria-hidden="true">
            <span className="flex gap-[2px]">
              <span className="h-[5px] w-[3px] rounded-full bg-white" />
              <span className="h-[5px] w-[3px] rounded-full bg-white" />
            </span>
          </span>
          {e.firstAid}
        </button>
        <p className="px-2.5 pt-0.5 pb-1.5 text-[0.6875rem] text-muted-foreground">{e.where}</p>
      </MorphPopoverContent>
    </MorphPopover>
  );
}
