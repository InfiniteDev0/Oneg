"use client";

// Milo's lib/db/note-opens.js, for Oneg: when each note was opened today, for the Recent tab —
// kept in this browser. Yesterday's opens are let go.

const KEY = "oneg.note-opens.v1";

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

// note id -> opened at, since midnight
export async function listOpenedToday() {
  const midnight = new Date().setHours(0, 0, 0, 0);
  return Object.fromEntries(Object.entries(read()).filter(([, at]) => at >= midnight));
}

export function saveOpen(userId, id, at) {
  const midnight = new Date().setHours(0, 0, 0, 0);
  const kept = Object.fromEntries(Object.entries(read()).filter(([, t]) => t >= midnight));
  kept[id] = at;
  try {
    localStorage.setItem(KEY, JSON.stringify(kept));
  } catch {
    // not kept
  }
}
