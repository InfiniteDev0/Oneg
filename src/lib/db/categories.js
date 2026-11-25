"use client";

// Milo's lib/db/categories.js, for Oneg: the same calls, kept in this browser until accounts are on
// Supabase. In Oneg these are collections (Milo's categories). Every column Milo had to probe for
// (colours, orders, covers) is simply here, so each check is a yes.

const KEY = "oneg.collections.v1";

export const categoryCovers = () => true;
export async function checkColors() {
  return true;
}
export async function checkOrders() {
  return true;
}
export async function checkCovers() {
  return true;
}

// a name always starts with a capital: "projects" reads "Projects"
export const capital = (name) => (name ? name.charAt(0).toUpperCase() + name.slice(1) : name);

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
    // storage full (a big cover picture) or blocked: not kept
  }
}

export async function listCategories() {
  return read();
}

// Milo's queue had save(id, [userId, category], wait) and remove(id); here they write straight away
export const categoryQueue = {
  save(id, [, category]) {
    const list = read();
    const at = list.findIndex((c) => c.id === id);
    if (at >= 0) list[at] = category;
    else list.push(category);
    write(list);
  },
  remove(id) {
    // its subcollections go with it, as Milo's database did
    write(read().filter((c) => c.id !== id && c.parentId !== id));
  },
};
