import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import AuthView from "@/components/auth/auth-view";

// /[lang]/auth            → log in (photo + form)
// /[lang]/auth?mode=signup → sign up (form only)
export default async function AuthPage({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    // AuthView reads ?mode= in the browser, which needs a Suspense boundary
    <Suspense fallback={null}>
      <AuthView t={dict.auth} lang={lang} languageLabel={dict.header.language} />
    </Suspense>
  );
}
