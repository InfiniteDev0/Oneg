"use client";

// Milo's lib/db/note-queue.js, for Oneg: a note's edits are kept after a short pause (so typing
// isn't a write per key), and a for-good delete happens once Undo has passed.

import { deleteNote, saveNote } from "./notes";

const timers = new Map();

export function saveNoteSoon(userId, note, wait = 800) {
  clearTimeout(timers.get(note.id));
  if (wait <= 0) {
    timers.delete(note.id);
    saveNote(note);
    return;
  }
  timers.set(
    note.id,
    setTimeout(() => {
      timers.delete(note.id);
      saveNote(note);
    }, wait)
  );
}

export function deleteNoteForGood(id) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  deleteNote(id);
}
