"use client";

// A topic page's Notes tab: your notes in that Educational category (Milo's block), as Milo's
// note cards, with New note. A note opens in Milo's notes sheet floating beside the page (not
// full screen), so you write while you read the topic, a course or a book. They're the same notes
// as the Notes page's, where they sit under By category. Needs the notes providers around it
// (NotesProviders in notes-shell.jsx).

import { Plus } from "lucide-react";
import { useNotes } from "../notes-provider";
import { NoteSheet } from "./note-sheet";
import { NotesGrid } from "./notes-grid";
import { useNoteSheet } from "./use-note-sheet";

const NONE = new Set();

export function TopicNotes({ topic, name, t }) {
  const { notes, addNote, editNote, hydrated } = useNotes();
  const sheet = useNoteSheet();
  const mine = notes.filter((n) => n.blockId === topic);

  // beside the page rather than over it
  const open = (note) => {
    sheet.openNote(note);
    sheet.toggleFull();
  };
  const newNote = () => {
    const note = addNote({ blockId: topic });
    if (note) open(note);
  };

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{hydrated ? t.count.replace("{n}", mine.length) : ""}</p>
        <button
          type="button"
          onClick={newNote}
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          {t.new}
        </button>
      </div>
      <div className="-mx-2">
        <NotesGrid
          notes={mine}
          selected={NONE}
          onToggleSelect={() => {}}
          onOpen={open}
          onTogglePin={(n) => editNote(n.id, { pinned: !n.pinned })}
          empty={t.empty.replace("{topic}", name)}
          onAdd={newNote}
          addLabel={t.new}
        />
      </div>
      <NoteSheet sheet={sheet} />
    </section>
  );
}
