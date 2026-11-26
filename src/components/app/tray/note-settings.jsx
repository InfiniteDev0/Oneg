"use client";

// What this note is: its colour, the block it belongs to, and whether it's pinned.

import { useState } from "react";
import { CalendarClock, Check, Pin, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NOTE_COLOURS, paperStyle } from "@/lib/note-colours";
import { nextStamp, stampOf } from "@/lib/stamp";
import { useNow } from "@/lib/time";
import { useBlocks } from "../blocks-provider";
import { NoteSettingsIcon } from "./icons";

// one row of Belongs to: its colour's dot, its name, a tick on the one it's in
function Choice({ label, dot, picked, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={picked}
      className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.05] ${
        picked ? "text-foreground" : "text-foreground/70"
      }`}
    >
      {dot ? (
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: dot }} />
      ) : (
        <span className="size-2 shrink-0 rounded-full ring-1 ring-foreground/30" />
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {picked && <Check className="size-3.5 shrink-0" strokeWidth={2.5} />}
    </button>
  );
}

export function NoteSettings({ note, onChange }) {
  const { blocks, archived } = useBlocks();

  // a set-aside block still shows if this note already belongs to it
  const setAside = archived.find((b) => b.id === note.blockId);
  const choices = setAside ? [...blocks, setAside] : blocks;

  // the categories, filtered by what's typed, in their sections
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const groups = [];
  for (const b of choices) {
    if (q && !b.name.toLowerCase().includes(q)) continue;
    const section = b.sectionName ?? "";
    const group = groups.find(([name]) => name === section);
    if (group) group[1].push(b);
    else groups.push([section, [b]]);
  }

  // a minute's tick keeps "tomorrow" right across midnight
  const now = useNow(true, 60000);
  const tomorrow = now == null ? null : nextStamp(stampOf(new Date(now)));
  const waiting = tomorrow != null && note.showOn === tomorrow;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Note settings"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            <NoteSettingsIcon className="size-5" />
          </button>
        }
      />

      <PopoverContent align="end" sideOffset={8} className="w-64 p-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-foreground/45">Colour</span>
            <div className="flex flex-wrap gap-2">
              {NOTE_COLOURS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.label}
                  onClick={() => onChange({ colour: c.id })}
                  style={paperStyle(c)}
                  className="milo-paper flex size-8 cursor-pointer items-center justify-center rounded-lg ring-1 ring-foreground/10 transition-transform hover:scale-110"
                >
                  {(note.colour ?? "plain") === c.id && (
                    <Check className="size-4 text-foreground" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Oneg: ~40 categories, so a short list to search (by section, a dot of each colour),
              not Milo's cloud of chips */}
          <div className="flex flex-col gap-2 border-t border-foreground/5 pt-3">
            <span className="text-xs text-foreground/45">Belongs to</span>
            <label className="flex h-8 items-center gap-2 rounded-lg bg-foreground/[0.05] px-2.5 text-xs">
              <Search className="size-3.5 shrink-0 text-foreground/45" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a category"
                aria-label="Find a category"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-foreground/40"
              />
            </label>
            <div className="scrollbar-none -mx-1 flex max-h-56 flex-col overflow-y-auto">
              {!q && <Choice label="General note" picked={note.blockId == null} onPick={() => onChange({ blockId: null })} />}
              {groups.map(([section, list]) => (
                <div key={section} className="flex flex-col">
                  <span className="px-2 pt-2.5 pb-1 text-[11px] font-medium text-foreground/40">{section}</span>
                  {list.map((b) => (
                    <Choice
                      key={b.id}
                      label={b.name}
                      dot={b.bg}
                      picked={note.blockId === b.id}
                      onPick={() => onChange({ blockId: b.id })}
                    />
                  ))}
                </div>
              ))}
              {q && groups.length === 0 && <span className="px-2 py-2 text-xs text-foreground/45">No category called that</span>}
            </div>
          </div>

          {/* waits for tomorrow's notes; pressing it again keeps it an ordinary note */}
          <button
            type="button"
            onClick={() => tomorrow && onChange({ showOn: waiting ? null : tomorrow })}
            aria-pressed={waiting}
            className={`flex cursor-pointer items-center gap-2 border-t border-foreground/5 pt-3 text-xs transition-colors hover:text-foreground ${
              waiting ? "text-foreground" : "text-foreground/60"
            }`}
          >
            <CalendarClock className="size-3.5" />
            {waiting ? "Coming back tomorrow" : "Bring back tomorrow"}
          </button>

          <button
            type="button"
            onClick={() => onChange({ pinned: !note.pinned })}
            aria-pressed={!!note.pinned}
            className="flex cursor-pointer items-center gap-2 border-t border-foreground/5 pt-3 text-xs text-foreground/60 transition-colors hover:text-foreground"
          >
            <Pin className="size-3.5" fill={note.pinned ? "currentColor" : "none"} />
            {note.pinned ? "Pinned to the top" : "Pin to the top"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
