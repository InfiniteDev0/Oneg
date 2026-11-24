// Lara's search_oneg tool: finds Oneg pages that match what someone needs.
// For now it searches the site's own menus (in the person's language and in
// English) plus a few keywords per page. When the doctor directory, the library
// and the hospitals list live in Supabase, search them here as well.

import { getDictionary } from "@/i18n/dictionaries";
import { buildNav } from "@/components/landing/nav-links";

// Extra English words people use for each page, so "pay with mpesa" finds the wallet
const KEYWORDS = {
  "/symptom-check": "symptoms symptom checker ai triage lara sick ill pain fever cough headache",
  "/doctors": "find doctor doctors specialist gp physician paediatrician gynaecologist dentist search",
  "/consultations": "book booking appointment consultation consult see a doctor chat call",
  "/consultations/video": "video call online consultation telemedicine remote",
  "/records": "health records medical history results lab tests files",
  "/prescriptions": "prescription prescriptions medicine medication refill pharmacy",
  "/family": "family children child kids parents dependants accounts",
  "/emergency": "emergency urgent ambulance 999 112 accident help now",
  "/hospitals": "hospital hospitals clinic clinics near me nearby emergency department",
  "/pharmacies": "pharmacy pharmacies chemist medicine near me nearby",
  "/wallet": "wallet pay payment payments money mpesa m-pesa top up balance fees cost price",
  "/pricing": "price prices pricing cost fees how much",
  "/library": "library learn education articles health information",
  "/library/first-aid": "first aid burns cuts choking bleeding cpr",
  "/library/families": "parents pregnancy baby children family health",
  "/courses": "courses training learn",
  "/blog": "blog articles doctors write",
  "/news": "news health news alerts outbreak",
  "/help": "help faq questions support account",
  "/help/support": "support 24/7 contact help agent",
  "/contact": "contact email phone talk to us",
  "/for-doctors": "doctor join oneg work freelance practice earn",
  "/for-doctors/verification": "verify verification licence license kmpdc verified badge",
  "/for-hospitals": "hospital clinic partner partnership",
  "/for-hospitals/referrals": "referral referrals refer patients network",
};

const words = (text) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

// Every page in the menus, with its labels in this language and in English
async function pagesFor(lang) {
  const [dict, en] = await Promise.all([getDictionary(lang), getDictionary("en")]);
  const pages = new Map();

  const add = (nav, primary) => {
    for (const menu of nav) {
      if (!menu.columns) continue;
      const entries = [
        ...menu.columns.flatMap((col) => [
          ...col.links.map((l) => ({ title: l.label, section: `${menu.label} › ${col.title}`, href: l.href })),
          ...(col.seeAll ? [{ title: col.seeAll.label, section: menu.label, href: col.seeAll.href }] : []),
        ]),
        ...(menu.featured?.items ?? []).map((f) => ({ title: f.title, section: menu.label, href: f.href, desc: f.desc })),
      ];
      for (const e of entries) {
        const path = e.href.replace(/^\/[a-z]{2}(?=\/)/, "");
        const page = pages.get(path) ?? { path, url: `/${lang}${path}`, text: "" };
        if (primary && !page.title) Object.assign(page, { title: e.title, section: e.section, desc: e.desc });
        if (primary && e.desc && !page.desc) page.desc = e.desc;
        page.text += ` ${e.title} ${e.section} ${e.desc ?? ""}`;
        pages.set(path, page);
      }
    }
  };

  add(buildNav(lang, dict.header), true);
  if (lang !== "en") add(buildNav("en", en.header), false);
  for (const page of pages.values()) page.text += ` ${KEYWORDS[page.path] ?? ""}`;
  return [...pages.values()];
}

export async function searchOneg(lang, query) {
  const terms = words(query);
  const pages = await pagesFor(lang);

  const scored = pages
    .map((page) => {
      const haystack = words(page.text);
      const score = terms.reduce(
        (sum, term) => sum + (haystack.includes(term) ? 2 : haystack.some((w) => w.startsWith(term) || term.startsWith(w)) ? 1 : 0),
        0
      );
      return { page, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (!scored.length) {
    return { results: [], note: "No Oneg page matched. Try other words, or suggest the Find a doctor page or Help." };
  }
  return {
    results: scored.map(({ page }) => ({
      title: page.title,
      section: page.section,
      url: page.url,
      ...(page.desc ? { description: page.desc } : {}),
    })),
  };
}
