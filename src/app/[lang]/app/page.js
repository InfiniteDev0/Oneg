// The app's Home: the view you're on (For You or Education) with its menu, a
// line across, and the two panes with VS Code's drag line (HomeView).

import { getDictionary } from "@/i18n/dictionaries";
import { HomeView } from "@/components/app/home-view";

export default async function AppHome({ params }) {
  const { lang } = await params;
  const t = (await getDictionary(lang)).app.home;

  return <HomeView t={t} lang={lang} />;
}
