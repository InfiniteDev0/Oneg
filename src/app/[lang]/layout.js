import { notFound } from "next/navigation";
import { Albert_Sans } from "next/font/google";
import "../globals.css";
import { getDirection, hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
  display: "swap",
});

// Build a static copy of every page for each language
export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // Dark mode for now (Milo's dark colours), while the app is being built. Remove "dark" to go back to light mode.
  return (
    <html lang={lang} dir={getDirection(lang)} className={`${albertSans.variable} dark antialiased`}>
      {/* Lara is added by app/[lang]/(site)/layout.js, so she isn't on the auth pages */}
      <body>{children}</body>
    </html>
  );
}
