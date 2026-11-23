// Loads the translation file for a language. Only runs on the server,
// so translations never add to the JavaScript sent to the browser.
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  sw: () => import("./dictionaries/sw.json").then((m) => m.default),
  so: () => import("./dictionaries/so.json").then((m) => m.default),
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
};

export const getDictionary = async (locale) => dictionaries[locale]();
