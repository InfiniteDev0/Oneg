"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE } from "@/i18n/config";

// Returns a function that moves the visitor to the same page in another language
// and remembers that choice for a year.
export function useSwitchLocale() {
  const pathname = usePathname();
  const router = useRouter();

  return (nextLocale) => {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    const rest = pathname.replace(/^\/[^/]+/, ""); // drop the current "/en"
    router.push(`/${nextLocale}${rest}`);
  };
}
