"use client";

// Milo's undo toast, as Oneg's (Barista's goey toast): what happened, a line about it, and Undo.
// onCommit runs once Undo has had its few seconds; onUndo if it's pressed in time.

import { gooeyToast } from "goey-toast";

export const UNDO_MS = 6000;

export function showUndoToast({ title, hint, onUndo, onCommit, duration = UNDO_MS }) {
  let undone = false;
  const timer = setTimeout(() => {
    if (!undone) onCommit?.();
  }, duration);
  gooeyToast.success(title, {
    description: hint,
    duration,
    action: {
      label: "Undo",
      successLabel: "Back",
      onClick: () => {
        undone = true;
        clearTimeout(timer);
        onUndo?.();
      },
    },
  });
}
