"use client";

// The Notes page (More → Notes): along the top, Notes, the category to show (or
// all), a search, and New note; under it, as Home, two panes with the drag line —
// your notes on the left, newest first, and the one you picked open on the
// right. The category and the open note are kept in the address (?topic=,
// ?note=), so a refresh brings you back to them; a new note takes the category
// you're looking at.

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNotes } from "@/lib/notes-store";
import { SplitPane } from "../split-pane";
import { NotesGlyph } from "../more-apps";
import { CategorySelect, NoteEditor, NoteRow } from "./note-editor";

function setParam(name, value) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(name, value);
  else url.searchParams.delete(name);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function NotesApp({ t, edu, lang, resizeLabel }) {
  const store = useNotes();
  const [topic, setTopic] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [fresh, setFresh] = useState(null);

  // where you were, from the address
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTopic(params.get("topic"));
    setActiveId(params.get("note"));
  }, []);
  const pickTopic = (key) => {
    setTopic(key);
    setParam("topic", key);
  };
  const pick = (id) => {
    setActiveId(id);
    setFresh(null);
    setParam("note", id);
  };
  const newNote = () => {
    const note = store.create({ topic });
    setActiveId(note.id);
    setFresh(note.id);
    setParam("note", note.id);
  };

  const q = query.trim().toLowerCase();
  const shown = store.notes.filter(
    (n) => (!topic || n.topic === topic) && (!q || `${n.title} ${n.body} ${n.source}`.toLowerCase().includes(q))
  );
  const active = store.notes.find((n) => n.id === activeId);

  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto lg:overflow-hidden">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 lg:px-5">
        <NotesGlyph className="size-5 shrink-0" />
        <h1 className="me-2 text-[0.9375rem] font-semibold">{t.title}</h1>
        <CategorySelect value={topic} onChange={pickTopic} edu={edu} t={t} allLabel={t.all} />
        <span className="ms-auto flex h-8 w-56 items-center gap-2 rounded-md border border-border px-2 max-md:hidden">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </span>
        <button
          type="button"
          onClick={newNote}
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-foreground px-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 max-md:ms-auto"
        >
          <Plus className="size-4" />
          {t.new}
        </button>
      </div>

      <SplitPane
        storageKey="oneg.app.notes-split"
        initial={32}
        label={resizeLabel}
        startClassName="scrollbar-pill lg:overflow-y-auto"
        endClassName="scrollbar-pill px-4 py-6 lg:overflow-y-auto lg:ps-8 lg:pe-6"
        start={
          <div className="flex flex-col gap-0.5 p-2">
            {shown.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
                <NotesGlyph className="size-10" />
                <p className="font-semibold">{q ? t.noMatch : t.empty.title}</p>
                {!q && <p className="max-w-xs text-sm text-muted-foreground">{t.empty.body}</p>}
              </div>
            ) : (
              shown.map((note) => <NoteRow key={note.id} note={note} active={note.id === activeId} onPick={pick} edu={edu} t={t} lang={lang} showTopic={!topic} />)
            )}
          </div>
        }
        end={
          active ? (
            <NoteEditor key={active.id} note={active} store={store} edu={edu} t={t} lang={lang} autoFocus={fresh === active.id} onDeleted={() => pick(null)} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">{t.pick}</p>
              <button type="button" onClick={newNote} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold transition-colors hover:bg-muted">
                <Plus className="size-4" />
                {t.new}
              </button>
            </div>
          )
        }
      />
    </div>
  );
}
