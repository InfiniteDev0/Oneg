"use client";

// What Milo's notes need around them in Oneg: the notes, the Educational categories as Milo's
// blocks, the collections as Milo's categories, and who's signed in (the demo account for now).
// The Notes page fills the main panel, as Milo's does its page.

import { Suspense } from "react";
import { DEMO_ACCOUNT } from "@/lib/demo-account";
import { BlocksProvider } from "./blocks-provider";
import { CategoriesProvider } from "./categories-provider";
import { NotesProvider } from "./notes-provider";
import { UserProvider } from "./user-provider";
import { NotesView } from "./notes";

const USER = { name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email, avatarUrl: null };

export function NotesProviders({ edu, children }) {
  return (
    <UserProvider user={USER}>
      <NotesProvider>
        <CategoriesProvider>
          <BlocksProvider edu={edu}>{children}</BlocksProvider>
        </CategoriesProvider>
      </NotesProvider>
    </UserProvider>
  );
}

export function NotesShell({ edu }) {
  return (
    <NotesProviders edu={edu}>
      <div className="absolute inset-0 flex flex-col overflow-hidden">
        <Suspense>
          <NotesView />
        </Suspense>
      </div>
    </NotesProviders>
  );
}
