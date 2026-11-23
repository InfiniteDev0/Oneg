import { NextResponse } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, locales } from "@/i18n/config";

// Pick a language: the visitor's saved choice first, then their browser's language list.
function getLocale(request) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && hasLocale(saved)) return saved;

  // Example header: "so-SO,so;q=0.9,en;q=0.8"
  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  return preferred.find(({ lang }) => hasLocale(lang))?.lang ?? defaultLocale;
}

// Sends any URL without a language (e.g. "/" or "/auth") to the right one ("/sw" or "/sw/auth").
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return;

  request.nextUrl.pathname = `/${getLocale(request)}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next.js internals, API routes, and files like icon.png or favicon.ico
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
