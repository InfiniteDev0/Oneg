"use client";

// The pieces of Notes, shared by the Notes page and a topic page's notes panel:
//   CategorySelect  pick a note's category — any Educational topic, by section
//   NoteRow         a note in a list: its title, its first line, its category, when
//   NoteEditor      a note open: its title, category, the book or course it's
//                   from, and what you wrote (the box grows as you write);
//                   everything is kept as you type; Delete can be undone

import { useEffect, useRef } from "react";
import { BookMarked, Trash2 } from "lucide-react";
import { gooeyToast } from "goey-toast";
import { cn } from "@/lib/utils";
import { SECTIONS, TOPICS } from "../learn-data";

export function when(time, lang) {
  try {
    return new Intl.DateTimeFormat(lang, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(time));
  } catch {
    return new Date(time).toLocaleString();
  }
}

/** A native select (keyboard and screen readers know it), the topics grouped by section. */
export function CategorySelect({ value, onChange, edu, t, allLabel, className, id }) {
  return (
    <select
      id={id}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className={cn(
        "h-8 max-w-56 cursor-pointer truncate rounded-md border border-border bg-transparent ps-2 pe-7 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <option value="">{allLabel ?? t.general}</option>
      {SECTIONS.map((section) => (
        <optgroup key={section.key} label={edu.sections[section.key]}>
          {section.topics.map(([key]) => (
            <option key={key} value={key}>
              {edu.topics[key]}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

/** A note in a list. */
export function NoteRow({ note, active, onPick, edu, t, lang, showTopic = true }) {
  const topic = note.topic && TOPICS[note.topic];
  const firstLine = note.body.split("\n").find((line) => line.trim()) ?? "";
  return (
    <button
      type="button"
      onClick={() => onPick(note.id)}
      aria-current={active ? "true" : undefined}
      className={cn("flex w-full cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 text-start outline-none transition-colors hover:bg-muted focus-visible:bg-muted", active && "bg-muted")}
    >
      <span className="truncate text-[0.9375rem] font-semibold">{note.title.trim() || t.untitled}</span>
      <span className="truncate text-sm text-muted-foreground">{firstLine || t.noText}</span>
      <span className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        {showTopic && topic && (
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: topic.colour }} />
            <span className="truncate">{edu.topics[note.topic]}</span>
          </span>
        )}
        <span className="shrink-0">{when(note.updatedAt, lang)}</span>
      </span>
    </button>
  );
}

/** A note open: write in it; it's kept as you go. */
export function NoteEditor({ note, store, edu, t, lang, autoFocus = false, onDeleted }) {
  const body = useRef(null);
  const title = useRef(null);

  // the box grows with what you write
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 240)}px`;
  }, [note.body, note.id]);
  useEffect(() => {
    if (autoFocus) title.current?.focus();
  }, [autoFocus, note.id]);

  const topic = note.topic && TOPICS[note.topic];
  const remove = () => {
    const gone = store.remove(note.id);
    onDeleted?.();
    gooeyToast.success(t.deleted, { action: { label: t.undo, successLabel: t.back, onClick: () => store.restore(gone) } });
  };

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {topic && <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: topic.colour }} />}
        <label className="sr-only" htmlFor={`cat-${note.id}`}>
          {t.category}
        </label>
        <CategorySelect id={`cat-${note.id}`} value={note.topic} onChange={(topicKey) => store.update(note.id, { topic: topicKey })} edu={edu} t={t} />
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-border px-2">
          <BookMarked className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={note.source}
            onChange={(e) => store.update(note.id, { source: e.target.value })}
            placeholder={t.fromPlaceholder}
            aria-label={t.from}
            className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </span>
        <button
          type="button"
          onClick={remove}
          aria-label={t.delete}
          title={t.delete}
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-[#f4212e]/10 hover:text-[#f4212e]"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <input
        ref={title}
        value={note.title}
        onChange={(e) => store.update(note.id, { title: e.target.value })}
        placeholder={t.titlePlaceholder}
        aria-label={t.titlePlaceholder}
        className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/60"
      />
      <textarea
        ref={body}
        value={note.body}
        onChange={(e) => store.update(note.id, { body: e.target.value })}
        placeholder={t.bodyPlaceholder}
        aria-label={t.bodyPlaceholder}
        className="w-full resize-none bg-transparent text-[0.9375rem] leading-7 outline-none placeholder:text-muted-foreground/60"
      />
      <p className="text-xs text-muted-foreground">{t.saved.replace("{time}", when(note.updatedAt, lang))}</p>
    </article>
  );
}
