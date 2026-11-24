"use client";

// Light, dark or Auto, and the theme colour: Barista's (features/theme/useTheme.ts
// and lib/theme-colour.js), for all of Oneg.
//   The choice lives in a cookie; THEME_SCRIPT (in the root layout's <head>) puts
//   it on <html> before anything paints, so a page never flashes the wrong theme.
//   Dark until someone picks otherwise, while the app is being built.
//   The theme colour is kept in localStorage and laid on <html> as data-accent;
//   globals.css turns it into the strong buttons' colour and the sidebar's gradient.

import { useSyncExternalStore } from "react";
import { createPreference } from "./preference";

export const THEME_COOKIE = "oneg-theme";
export const DEFAULT_CHOICE = "dark";
const ONE_YEAR = 60 * 60 * 24 * 365;

export const THEME_COLOURS = [
  { id: "black", hex: null },
  { id: "purple", hex: "#7b68ee" },
  { id: "blue", hex: "#1090e0" },
  { id: "pink", hex: "#ee5e99" },
  { id: "violet", hex: "#b660e0" },
  { id: "indigo", hex: "#6985ff" },
  { id: "orange", hex: "#e16b16" },
  { id: "teal", hex: "#0f9d9f" },
  { id: "bronze", hex: "#aa8d80" },
  { id: "mint", hex: "#3db88b" },
];
export const COLOUR_KEY = "oneg:theme-colour";
export const THEME_COLOUR = createPreference(COLOUR_KEY, THEME_COLOURS.map((c) => c.id), "black");

// Runs in <head> before the first paint: your light/dark and your colour
export const THEME_SCRIPT = `(function(){var r=document.documentElement;try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);var c=m?m[1]:'${DEFAULT_CHOICE}';var d=c==='dark'||(c==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}try{var a=localStorage.getItem('${COLOUR_KEY}');if(a&&a!=='black')r.dataset.accent=a;}catch(e){}})();`;

const listeners = new Set();
const notify = () => listeners.forEach((l) => l());
const subscribe = (onChange) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

function savedChoice() {
  const stored = document.cookie
    .split("; ")
    .find((pair) => pair.startsWith(`${THEME_COOKIE}=`))
    ?.split("=")[1];
  return stored === "light" || stored === "dark" || stored === "system" ? stored : DEFAULT_CHOICE;
}

const deviceDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
const resolve = (choice) => (choice === "system" ? (deviceDark() ? "dark" : "light") : choice);

export function setChoice(choice) {
  document.cookie = `${THEME_COOKIE}=${choice}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  const dark = resolve(choice) === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  notify();
}

export function setColour(id) {
  THEME_COLOUR.set(id);
  if (id === "black") delete document.documentElement.dataset.accent;
  else document.documentElement.dataset.accent = id;
}

export function useTheme() {
  const choice = useSyncExternalStore(subscribe, savedChoice, () => DEFAULT_CHOICE);
  const colour = useSyncExternalStore(THEME_COLOUR.subscribe, THEME_COLOUR.get, () => THEME_COLOUR.fallback);
  return { choice, setChoice, colour, setColour };
}
