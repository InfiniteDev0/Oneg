"use client";

// Milo's lib/db/day-tasks.js, for Oneg: a collection's tasks, kept in this browser until accounts
// are on Supabase. `day` is the column a task sits in, never a due date (as in Milo). Labels (a task
// in a collection), custom repeats and times are all here, so each check is a yes.

const KEY = "oneg.day-tasks.v1";
const pad = (n) => String(n).padStart(2, "0");

// "Thu Nov 05 2026" → "2026-11-05", in the browser's own time zone
export const dateOfKey = (key) => {
  const d = new Date(key);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
// "2026-11-05" → "Thu Nov 05 2026" (built from parts: parsing the string would read it as UTC)
export const keyOfDate = (date) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toDateString();
};

export const dayTaskLabels = () => true;
export const dayTaskExtras = () => true;
export async function checkLabels() {
  return true;
}
export async function checkExtras() {
  return true;
}

function read() {
  try {
    const rows = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}
function write(rows) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    // not kept
  }
}

// every day task, grouped by the day it sits in and in its order there: { [dayKey]: task[] }
export async function listDayTasks() {
  const rows = read()
    .filter((r) => !r.deletedAt)
    .sort((a, b) => a.day.localeCompare(b.day) || a.position - b.position);
  const byDay = {};
  for (const r of rows) (byDay[keyOfDate(r.day)] ??= []).push(r.task);
  return byDay;
}

function saveDayTask(task, key, position) {
  const rows = read().filter((r) => r.task.id !== task.id);
  rows.push({ day: dateOfKey(key), position, task });
  write(rows);
  return { error: null };
}

export const dayTaskQueue = {
  save(id, [, task, key, position]) {
    saveDayTask(task, key, position);
  },
  remove(id) {
    write(read().filter((r) => r.task.id !== id));
  },
};

// a task made from a collection's page: at the top of its day, with its subtasks and note
export async function createDayTask(day, { title, minutes = null, steps = [], note = "", categoryId, atTime }) {
  const task = {
    id: crypto.randomUUID(),
    title,
    done: false,
    minutes,
    actualMs: 0,
    startedAt: null,
    note,
    steps: steps.map((s) => ({ id: crypto.randomUUID(), name: s.name, done: Boolean(s.done) })),
    repeat: "none",
    doneOn: {},
    categoryId: categoryId ?? null,
    repeatRule: null,
    atTime: atTime ?? null,
  };
  return saveDayTask(task, day.toDateString(), -1);
}

// deleted on purpose (after Undo)
export const trashDayTask = (id) => {
  write(read().map((r) => (r.task.id === id ? { ...r, deletedAt: Date.now() } : r)));
};
