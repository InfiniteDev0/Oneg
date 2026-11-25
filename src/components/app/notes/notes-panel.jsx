"use client";

// Notes beside a topic page, so you write while you study a course or read a
// book: a floating panel at the side (the page stays usable behind it) with
// this topic's notes, newest first, and New note; a note opens in the panel
// (← back to the list). They're the same notes as the Notes page's — "All your
// notes" goes there, on this category.

import { useState } from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ArrowUpRight, ChevronLeft, Plus, X } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { useNotes } from "@/lib/notes-store";
import { NoteEditor, NoteRow } from "./note-editor";

export function NotesPanel({ open, onOpenChange, topic, t, edu, lang }) {
  const store = useNotes();
  const [activeId, setActiveId] = useState(null);
  const [fresh, setFresh] = useState(null);
  const name = edu.topics[topic];
  const mine = store.notes.filter((n) => n.topic === topic);
  const active = store.notes.find((n) => n.id === activeId);

  const newNote = () => {
    const note = store.create({ topic });
    setActiveId(note.id);
    setFresh(note.id);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} side="right" floating className="border border-border bg-canvas">
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border px-3">
        {active ? (
          <button type="button" onClick={() => setActiveId(null)} className="flex h-8 cursor-pointer items-center gap-1 rounded-md ps-1 pe-2 text-sm font-medium transition-colors hover:bg-muted">
            <ChevronLeft className="size-4 rtl:rotate-180" />
            {t.back}
          </button>
        ) : (
          <DialogPrimitive.Title className="truncate px-1 text-[0.9375rem] font-semibold">{t.panelTitle.replace("{topic}", name)}</DialogPrimitive.Title>
        )}
        <span className="flex-1" />
        <button type="button" onClick={newNote} aria-label={t.new} title={t.new} className="grid size-8 cursor-pointer place-items-center rounded-md transition-colors hover:bg-muted">
          <Plus className="size-4.5" />
        </button>
        <DialogPrimitive.Close render={<button type="button" aria-label={t.close} title={t.close} className="grid size-8 cursor-pointer place-items-center rounded-md transition-colors hover:bg-muted" />}>
          <X className="size-4.5" />
        </DialogPrimitive.Close>
      </div>

      <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto">
        {active ? (
          <div className="p-4">
            <NoteEditor key={active.id} note={active} store={store} edu={edu} t={t} lang={lang} autoFocus={fresh === active.id} onDeleted={() => setActiveId(null)} />
          </div>
        ) : mine.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">{t.noneHere.replace("{topic}", name)}</p>
            <button type="button" onClick={newNote} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90">
              <Plus className="size-4" />
              {t.new}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 p-2">
            {mine.map((note) => (
              <NoteRow key={note.id} note={note} onPick={setActiveId} edu={edu} t={t} lang={lang} showTopic={false} />
            ))}
          </div>
        )}
      </div>

      <Link href={`/${lang}/app/notes?topic=${topic}`} className="flex h-11 shrink-0 items-center justify-center gap-1.5 border-t border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        {t.allNotes}
        <ArrowUpRight className="size-4" />
      </Link>
    </Sheet>
  );
}
