import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import SiteHeader from "@/components/landing/site-header";
import Hero from "@/components/landing/hero";

export default async function Home({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang} dict={dict} />
      <main>
        <Hero lang={lang} dict={dict} />
      </main>
    </>
  );
}
