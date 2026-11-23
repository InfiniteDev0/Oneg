import { getDictionary } from "@/i18n/dictionaries";
import LaraChat from "@/components/lara/lara-chat";

// Website pages (home, and later pricing, library, ...). The "(site)" folder
// doesn't appear in URLs; it only gives these pages Lara. The auth pages sit
// outside it, so Lara doesn't float over the sign-in forms.
export default async function SiteLayout({ children, params }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      {children}
      {/* Lara, the floating AI, and her chat panel */}
      <LaraChat label={dict.lara.label} t={dict.lara.chat} lang={lang} />
    </>
  );
}
