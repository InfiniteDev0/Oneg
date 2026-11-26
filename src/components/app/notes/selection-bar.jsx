"use client";

// Appears once a note is ticked, floating at the foot of the screen as beui's Overflow Actions
// rail: how many (✕ unticks them), Move to (a category or a collection, or a new one named right
// there) and Delete in red; Select all springs out from behind ⋯.

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { CheckCheck, FolderInput, FolderPlus, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OverflowActions } from "@/components/motion/overflow-actions";
import { useBlocks } from "../blocks-provider";
import { PickedIcon } from "../icon-picker/picked-icon";
import { cn } from "@/lib/utils";

const CHOICE = "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-foreground/5";
const HEAD = "px-2.5 pt-1.5 pb-0.5 text-[11px] font-medium text-muted-foreground";

// total and onSelectAll are optional: given, the bar offers Select all until everything is ticked.
// categories and onFile are optional too: given, Move to lists them and can make a new one
export function SelectionBar({ count, total, onSelectAll, onMove, onDelete, onClear, categories, onFile }) {
  const { blocks, droppedToday } = useBlocks();
  const [open, setOpen] = useState(false);
  // the new category's name, while it's being typed
  const [naming, setNaming] = useState(null);
  if (count === 0 || typeof document === "undefined") return null;

  const tops = categories?.list.filter((c) => !c.parentId) ?? [];
  const file = (c) => {
    onFile(c);
    setOpen(false);
  };
  const create = () => {
    const name = naming?.trim();
    if (!name) return setNaming(null);
    const c = categories.addCategory({ name });
    setNaming(null);
    if (c) file(c);
  };

  // blocks set aside today still take notes
  const choices = [...blocks, ...droppedToday];

  // the rail: how many (✕ unticks them), Move to, Delete; Select all behind ⋯
  const primary = [
    {
      id: "count",
      label: <span className="tabular-nums">{count} selected</span>,
      icon: <X />,
      title: "Clear selection",
      onClick: onClear,
    },
    {
      id: "move",
      label: "Move to",
      icon: <FolderInput />,
      className: "data-popup-open:bg-muted",
      render: (button) => <PopoverTrigger render={button} />,
    },
    { id: "delete", label: "Delete", icon: <Trash2 />, tone: "danger", onClick: onDelete },
  ];
  const extra = [
    onSelectAll && count < total
      ? { id: "all", label: `Select all ${total}`, icon: <CheckCheck />, onClick: onSelectAll }
      : { id: "clear", label: "Clear selection", icon: <X />, onClick: onClear },
  ];

  return createPortal(
    <motion.div
      role="toolbar"
      aria-label="Selected notes"
      initial={{ opacity: 0, y: 16, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed bottom-6 left-1/2 z-50 max-w-[calc(100vw-2rem)]"
    >
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setNaming(null);
        }}
      >
        <OverflowActions
          primaryActions={primary}
          overflowActions={extra}
          collapseOnAction
          openLabel="More actions"
          closeLabel="Fewer actions"
          classNames={{ track: "bg-popover text-popover-foreground shadow-xl", action: "bg-muted hover:bg-muted/70" }}
        />
        {/* Blocks and Categories side by side, a line between; just the blocks where there are no categories */}
        <PopoverContent
          side="top"
          align="start"
          sideOffset={10}
          className={cn("max-h-96 overflow-y-auto p-2", onFile ? "w-[30rem]" : "w-60")}
        >
          <div className={cn(onFile && "grid grid-cols-2 divide-x divide-foreground/10")}>
            <div className={cn("flex flex-col gap-1", onFile && "pe-2")}>
              {onFile && <span className={HEAD}>Categories</span>}
              <button
                type="button"
                onClick={() => {
                  onMove(null);
                  setOpen(false);
                }}
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-foreground/5"
              >
                General note
              </button>
              {choices.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onMove(b);
                    setOpen(false);
                  }}
                  className={CHOICE}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.bg }} />
                  {b.name.replace(" Block", "")}
                </button>
              ))}
            </div>

            {onFile && (
              <div className="flex min-w-0 flex-col gap-1 ps-2">
                <span className={HEAD}>Collections</span>
                {/* out of any category */}
                <button type="button" onClick={() => file(null)} className={`${CHOICE} text-muted-foreground`}>
                  No category
                </button>
                {tops.map((c) => (
                  <div key={c.id} className="flex flex-col gap-1">
                    <button type="button" onClick={() => file(c)} className={CHOICE}>
                      <PickedIcon icon={c.icon} size={13} />
                      <span className="truncate">{c.name || "Untitled"}</span>
                    </button>
                    {categories.list
                      .filter((s) => s.parentId === c.id)
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => file(s)}
                          className={`${CHOICE} ps-8 text-muted-foreground`}
                        >
                          <span className="truncate">{s.name || "Untitled"}</span>
                        </button>
                      ))}
                  </div>
                ))}
                {categories.canWrite &&
                  (naming == null ? (
                    <button type="button" onClick={() => setNaming("")} className={`${CHOICE} text-muted-foreground`}>
                      <FolderPlus className="size-3.5" />
                      New category
                    </button>
                  ) : (
                    <input
                      autoFocus
                      value={naming}
                      onChange={(e) => setNaming(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") create();
                        if (e.key === "Escape") setNaming(null);
                      }}
                      onBlur={create}
                      placeholder="Name it, then Enter"
                      aria-label="New collection name"
                      className="mx-1 rounded-md bg-background px-2 py-1.5 text-xs outline-none ring-1 ring-(--theme-accent)"
                    />
                  ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </motion.div>,
    document.body,
  );
}
