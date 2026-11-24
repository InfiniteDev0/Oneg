// The app's Home: the greeting for now, inside Barista's panel.

import { getDictionary } from "@/i18n/dictionaries";
import { DEMO_ACCOUNT } from "@/lib/demo-account";

export default async function AppHome({ params }) {
  const { lang } = await params;
  const t = (await getDictionary(lang)).app.home;

  return (
    <div className="flex flex-col gap-2 pt-4">
      <h1 className="text-3xl font-semibold tracking-tight">{t.greeting.replace("{name}", DEMO_ACCOUNT.firstName)}</h1>
      <p className="text-muted-foreground">{t.subtitle}</p>
    </div>
  );
}
