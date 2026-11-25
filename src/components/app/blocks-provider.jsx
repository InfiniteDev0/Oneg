"use client";

// Milo's blocks provider, for Oneg's notes: Milo's blocks are Oneg's Educational categories
// (learn-data.js) — Biology, Pharmacology, Medical schools… — each with its name (in your
// language), its card colour as the block's colour and white ink. They're fixed (not made,
// dropped or archived), so the notes see the same shape Milo's blocks have.

import { createContext, useContext, useMemo } from "react";
import { SECTIONS, TOPICS } from "./learn-data";

const BlocksContext = createContext(null);

export function BlocksProvider({ edu, children }) {
  const value = useMemo(() => {
    const blocks = SECTIONS.flatMap((section) =>
      section.topics.map(([key]) => ({
        id: key,
        name: edu?.topics?.[key] ?? key,
        section: section.key,
        bg: TOPICS[key].colour,
        ink: "#ffffff",
        icon: TOPICS[key].icon,
      }))
    );
    return { blocks, droppedToday: [], archived: [], hydrated: true };
  }, [edu]);
  return <BlocksContext.Provider value={value}>{children}</BlocksContext.Provider>;
}

export function useBlocks() {
  const ctx = useContext(BlocksContext);
  if (!ctx) throw new Error("useBlocks must be used inside <BlocksProvider>");
  return ctx;
}
