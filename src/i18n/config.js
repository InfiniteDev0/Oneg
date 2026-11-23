// Languages Oneg supports. The first part of every URL is one of these codes: /en, /sw, /so, /ar
export const locales = ["en", "sw", "so", "ar"];

export const defaultLocale = "en";

// Languages written right-to-left
const rtlLocales = ["ar"];

// Each language's name, written in that language (for the language picker)
export const localeNames = {
  en: "English",
  sw: "Kiswahili",
  so: "Soomaali",
  ar: "العربية",
};

// Flag shown for each language. Swahili uses Kenya (our launch market);
// Arabic has no single country, Saudi Arabia is the usual pick.
export const LOCALE_FLAG = {
  en: "GB",
  sw: "KE",
  so: "SO",
  ar: "SA",
};

// Cookie that remembers the language a visitor chose
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const hasLocale = (locale) => locales.includes(locale);

export const getDirection = (locale) =>
  rtlLocales.includes(locale) ? "rtl" : "ltr";
