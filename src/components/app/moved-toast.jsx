"use client";

// Milo's moved toast, as Oneg's goey toast: "2 notes moved to Biology".

import { gooeyToast } from "goey-toast";

export function showMovedToast({ count, to, noun }) {
  const what = `${count} ${noun}${count === 1 ? "" : "s"}`;
  gooeyToast.success(`${what} moved to ${to?.name || "Untitled"}`);
}
