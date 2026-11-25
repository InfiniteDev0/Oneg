// Notes (More → Notes): Milo's notes, with the Educational categories as Milo's blocks and
// collections as Milo's categories (NotesShell).

import { getDictionary } from "@/i18n/dictionaries";
import { NotesShell } from "@/components/app/notes-shell";

export default async function NotesPage({ params }) {
  const { lang } = await params;
  const app = (await getDictionary(lang)).app;
  return <NotesShell edu={app.home.edu} />;
}
