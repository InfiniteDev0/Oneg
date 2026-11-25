"use client";

// Your notes: each with a title, what you wrote, its category (an Educational
// topic, or none) and, if you like, the book or course it's from. Kept in this
// browser until accounts are on Supabase. Every open copy of the hook hears a
// change at once (the Notes page and a topic page's notes panel stay in step).

import { useCallback, useEffect, useState } from "react";

const KEY = "oneg.notes.v1";
const CHANGED = "oneg:notes-changed";

function read() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage full or blocked: not kept
  }
  window.dispatchEvent(new Event(CHANGED));
}

const newId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `n${Date.now()}${Math.random().toString(36).slice(2, 7)}`);

export function useNotes() {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    const load = () => setNotes(read().sort((a, b) => b.updatedAt - a.updatedAt));
    load();
    window.addEventListener(CHANGED, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(CHANGED, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const create = useCallback((fields = {}) => {
    const now = Date.now();
    const note = { id: newId(), title: "", body: "", topic: null, source: "", createdAt: now, updatedAt: now, ...fields };
    write([note, ...read()]);
    return note;
  }, []);
  const update = useCallback((id, patch) => {
    write(read().map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));
  }, []);
  const remove = useCallback((id) => {
    const gone = read().find((n) => n.id === id);
    write(read().filter((n) => n.id !== id));
    return gone;
  }, []);
  const restore = useCallback((note) => {
    if (note) write([note, ...read().filter((n) => n.id !== note.id)]);
  }, []);

  return { notes, create, update, remove, restore };
}
