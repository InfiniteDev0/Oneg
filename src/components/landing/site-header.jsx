import Link from "next/link";
import AnnouncementBar from "./announcement-bar";
import DesktopNav from "./desktop-nav";
import LanguageSwitcher from "./language-switcher";
import MobileMenu from "./mobile-menu";
import StickyNav from "./sticky-nav";
import { Logo } from "./logo";
import { buildNav } from "./nav-links";

// Landing-page header: announcement banner + main navigation.
// What shows at each screen width:
//   phones/tablets  → logo, "Get started", menu button
//   lg  (1024px+)   → + mega-menu bar, language, log in
export default function SiteHeader({ lang, dict }) {
  const t = dict.header;
  const nav = buildNav(lang, t);
  const to = (path) => `/${lang}${path}`;

  const actions = {
    login: { label: t.actions.login, href: to("/auth") },
    getStarted: { label: t.actions.getStarted, href: to("/auth?mode=signup") },
  };

  return (
    <>
      {/* The banner scrolls away with the page; only the navbar below stays pinned */}
      <AnnouncementBar
        text={t.banner.text}
        linkLabel={t.banner.link}
        href={to("/symptom-check")}
        closeLabel={t.banner.close}
      />

      <StickyNav>
        <nav className="mx-auto flex h-14 max-w-400 items-center gap-4 px-4 sm:px-6 xl:px-8">
          <Link
            href={to("")}
            aria-label={t.home}
            className="shrink-0 rounded-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo />
          </Link>

          <DesktopNav items={nav} />

          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher lang={lang} label={t.language} className="me-1 hidden lg:block" />

            <Link
              href={actions.login.href}
              className="hidden h-9 items-center rounded-lg bg-black px-4 text-[0.9375rem] font-medium whitespace-nowrap text-white transition-colors hover:bg-black/80 lg:inline-flex"
            >
              {actions.login.label}
            </Link>

            <Link
              href={actions.getStarted.href}
              className="hidden h-9 items-center rounded-lg bg-primary px-5 text-[0.9375rem] font-medium whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
            >
              {actions.getStarted.label}
            </Link>

            <MobileMenu
              nav={nav}
              actions={actions}
              lang={lang}
              labels={{ language: t.language, openMenu: t.openMenu, closeMenu: t.closeMenu }}
            />
          </div>
        </nav>
      </StickyNav>
    </>
  );
}
