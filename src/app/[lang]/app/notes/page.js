// Notes (More → Notes): your notes by category, and the one you picked open (NotesApp).

import { getDictionary } from "@/i18n/dictionaries";
import { NotesApp } from "@/components/app/notes/notes-app";

export default async function NotesPage({ params }) {
  const { lang } = await params;
  const app = (await getDictionary(lang)).app;
  return <NotesApp t={app.notes} edu={app.home.edu} lang={lang} resizeLabel={app.home.resize} />;
}
