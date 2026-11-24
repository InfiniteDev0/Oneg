// The signed-in app: everything under /[lang]/app, inside the app frame
// (top bar, icon rail, side panel). The proxy only lets you in with the demo
// account's cookie for now (lib/demo-account.js).

import { getDictionary } from "@/i18n/dictionaries";
import { AppShell } from "@/components/app/app-shell";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.app.meta.title, robots: { index: false, follow: false } };
}

export default async function AppLayout({ children, params }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <AppShell t={dict.app} lara={dict.lara} lang={lang}>
      {children}
    </AppShell>
  );
}
