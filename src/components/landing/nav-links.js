// The header's menus. The shape (columns, links, icons) lives here; the words come
// from the current language's dictionary. Menus with `columns` open as a full-width
// ClickUp-style panel. Pages that don't exist yet show a 404 until we build them.

const MENUS = [
  {
    key: "patients",
    columns: [
      { key: "care", links: { symptoms: "/symptom-check", findDoctor: "/doctors", book: "/consultations", video: "/consultations/video" } },
      { key: "health", links: { records: "/records", prescriptions: "/prescriptions", family: "/family" } },
      { key: "urgent", links: { emergency: "/emergency", hospitals: "/hospitals", pharmacies: "/pharmacies" }, seeAll: "/for-patients" },
    ],
    featured: [
      { key: "ai", icon: "ai", href: "/symptom-check", isNew: true },
      { key: "mpesa", icon: "mpesa", href: "/pricing" },
    ],
  },
  {
    key: "doctors",
    columns: [
      { key: "start", links: { join: "/for-doctors", verify: "/for-doctors/verification", howItWorks: "/how-it-works" } },
      { key: "practice", links: { schedule: "/for-doctors/schedule", prescribe: "/for-doctors/prescriptions", notes: "/for-doctors/notes" } },
      { key: "earn", links: { payouts: "/for-doctors/payouts", fees: "/for-doctors/fees" }, seeAll: "/for-doctors" },
    ],
    featured: [
      { key: "dashboard", icon: "doctorDashboard", href: "/for-doctors/dashboard" },
      { key: "verified", icon: "verified", href: "/for-doctors/verification" },
    ],
  },
  {
    key: "hospitals",
    columns: [
      { key: "partner", links: { partner: "/for-hospitals", solutions: "/for-hospitals/solutions", contact: "/contact" } },
      { key: "services", links: { referrals: "/for-hospitals/referrals", telemedicine: "/for-hospitals/telemedicine", beds: "/for-hospitals/beds" }, seeAll: "/for-hospitals" },
    ],
    featured: [
      { key: "dashboard", icon: "hospitalDashboard", href: "/for-hospitals/dashboard" },
      { key: "network", icon: "network", href: "/for-hospitals/referrals" },
    ],
  },
  {
    key: "learn",
    columns: [
      { key: "learn", links: { library: "/library", firstAid: "/library/first-aid", videos: "/library/videos", courses: "/courses" } },
      { key: "discover", links: { blog: "/blog", news: "/news", families: "/library/families" } },
      { key: "support", links: { help: "/help", support247: "/help/support", contact: "/contact" } },
    ],
    spotlight: { href: "/library/first-aid" },
  },
];

export function buildNav(lang, t) {
  const to = (path) => `/${lang}${path}`;

  const menus = MENUS.map((menu) => {
    const words = t.nav[menu.key];
    return {
      key: menu.key,
      label: words.label,
      columns: menu.columns.map((col) => ({
        title: words[col.key].title,
        links: Object.entries(col.links).map(([k, path]) => ({ label: words[col.key].items[k], href: to(path) })),
        seeAll: col.seeAll ? { label: words[col.key].seeAll, href: to(col.seeAll) } : null,
      })),
      featured: menu.featured
        ? {
            title: t.nav.featuredTitle,
            items: menu.featured.map((f) => ({
              icon: f.icon,
              title: words.featured[f.key].title,
              desc: words.featured[f.key].desc,
              badge: f.isNew ? t.nav.newBadge : null,
              href: to(f.href),
            })),
          }
        : null,
      spotlight: menu.spotlight ? { ...words.spotlight, href: to(menu.spotlight.href) } : null,
    };
  });

  return [...menus, { key: "pricing", label: t.nav.pricing, href: to("/pricing") }];
}

// Shared look for top-level header links and menu buttons
export const navLinkClass =
  "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[0.9375rem] whitespace-nowrap text-foreground/80 transition-colors hover:bg-field hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
