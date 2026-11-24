"use client";

// Oneg's toasts: goey-toast (gooey, morphing toasts built on Sonner), set up as
// Barista's AdminToaster. Top centre, where the eye already is after pressing a
// form button; the smooth preset; Escape closes one. It lives in the root layout
// so a toast keeps going while the page changes (login → app).

import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";

export function Toaster() {
  // The app is dark while it's being built (see app/[lang]/layout.js)
  return <GooeyToaster position="top-center" preset="smooth" closeOnEscape showTimestamp={false} theme="dark" />;
}
