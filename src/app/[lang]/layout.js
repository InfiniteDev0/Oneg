import { notFound } from "next/navigation";
import { Albert_Sans } from "next/font/google";
import "../globals.css";
import { getDirection, hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Toaster } from "@/components/toaster";
import { THEME_SCRIPT } from "@/lib/theme";

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
    // The Themes dialog's choice (light, dark or Auto) and theme colour go on <html>
    // before the first paint (THEME_SCRIPT), so the class here is only the default.
    <html lang={lang} dir={getDirection(lang)} className={`${albertSans.variable} dark antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      {/* Lara is added by app/[lang]/(site)/layout.js, so she isn't on the auth pages */}
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
