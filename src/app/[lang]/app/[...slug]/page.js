// Every app page that isn't built yet: "Coming soon" inside the app frame,
// instead of a 404 that would leave the app.

import { getDictionary } from "@/i18n/dictionaries";

export default async function ComingSoon({ params }) {
  const { lang } = await params;
  const t = (await getDictionary(lang)).app.soon;
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-2 px-6 py-24 text-center">
      <p className="text-lg font-medium">{t.title}</p>
      <p className="text-sm text-muted-foreground">{t.body}</p>
    </div>
  );
}
