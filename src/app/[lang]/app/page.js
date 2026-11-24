// The app's Home: as Lenzro's workspace home (an icon, the title and a line under
// it, then an empty state in the middle) until there's real health data to show.

import { getDictionary } from "@/i18n/dictionaries";
import { DEMO_ACCOUNT } from "@/lib/demo-account";
import { AskLaraButton } from "@/components/app/ask-lara-button";
import { HomeTile } from "@/components/app/app-icons";

export default async function AppHome({ params }) {
  const { lang } = await params;
  const t = (await getDictionary(lang)).app.home;

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-col gap-4 px-8 pt-10">
        <HomeTile className="[&>span:first-child]:size-16 [&>span:first-child]:rounded-2xl [&_svg]:size-8" />
        <h1 className="text-4xl font-semibold tracking-tight">{t.greeting.replace("{name}", DEMO_ACCOUNT.firstName)}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-lg font-medium">{t.emptyTitle}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t.emptyBody}</p>
        <AskLaraButton label={t.ask} />
      </div>
    </div>
  );
}
