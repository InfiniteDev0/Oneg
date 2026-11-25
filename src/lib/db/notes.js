"use client";

// Milo's lib/db/notes.js, for Oneg: notes kept in this browser until accounts are on Supabase.
// Trash and covers are here from the start (Milo's migration 0015), so `notesSupport().trash` is yes.

const KEY = "oneg.milo-notes.v1";

export const notesSupport = () => ({ trash: true });

// The editor stores HTML; search over HTML would match tag names, so a plain copy is kept too.
export function toPlain(html) {
  if (!html) return "";
  if (typeof window === "undefined") return html.replace(/<[^>]*>/g, " ");
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function readNotes() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
export function writeNotes(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    // storage full (big pictures) or blocked
    return false;
  }
}

export async function listNotes() {
  return readNotes().sort((a, b) => b.createdAt - a.createdAt);
}
// covers ride along with each note here
export async function listCovers() {
  return Object.fromEntries(readNotes().map((n) => [n.id, n.cover ?? null]));
}

export function saveNote(note) {
  const list = readNotes();
  const at = list.findIndex((n) => n.id === note.id);
  if (at >= 0) list[at] = note;
  else list.unshift(note);
  return writeNotes(list);
}
export function deleteNote(id) {
  writeNotes(readNotes().filter((n) => n.id !== id));
}
