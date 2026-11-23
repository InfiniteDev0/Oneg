"use client";

import { Flag } from "@/components/flag";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/motion/select";
import { LOCALE_FLAG, localeNames, locales } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { useSwitchLocale } from "./use-switch-locale";

// Flag + EN / SW / SO / AR (same look and animation as Amanat's switcher).
// triggerClassName: e.g. a white fill on pages whose background matches the default grey.
export default function LanguageSwitcher({ lang, label, className = "", triggerClassName = "" }) {
  const switchTo = useSwitchLocale();

  return (
    <Select
      value={lang}
      onValueChange={(next) => next !== lang && switchTo(next)}
      className={cn("w-[5.5rem] shrink-0", className)}
    >
      <SelectTrigger className={cn("h-9 gap-1.5 rounded-lg px-2.5 text-xs font-semibold", triggerClassName)}>
        <span className="sr-only">{label}: </span>
        <span className="flex items-center gap-2" lang={lang}>
          <Flag code={LOCALE_FLAG[lang]} />
          <span className="uppercase">{lang}</span>
        </span>
      </SelectTrigger>
      <SelectContent>
        {locales.map((code) => (
          <SelectItem key={code} value={code} className="px-2 text-xs font-semibold">
            <span className="flex items-center gap-2" lang={code} title={localeNames[code]}>
              <Flag code={LOCALE_FLAG[code]} />
              <span className="uppercase">{code}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
