"use client";

// The sidebar's More, as ClickUp's: a panel beside the sidebar with the app's
// extra apps as tiles — each its coloured icon on a dark rounded square, its
// name under it — and Customize navigation along the bottom. Notes first
// (Streamline's Notes, in amber). The trigger is the sidebar's More item, its
// dots turning into the app tiles under the pointer.

import { useState } from "react";
import Link from "next/link";
import { Popover } from "@base-ui/react/popover";
import { Settings } from "lucide-react";

// Streamline's Notes (Solar, bold duotone), in two ambers: the sheet behind
// lighter, the one in front with its lines cut through
export function NotesGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        fill="#fcd34d"
        fillOpacity="0.5"
        d="M16.4149 17.9745c-0.2085 0.6383 -0.5751 1.2158 -1.0679 1.6774 -0.7313 0.6849 -1.8589 0.987 -4.1139 1.5913 -2.25512 0.6042 -3.38266 0.9064 -4.35844 0.6788 -0.77045 -0.1796 -1.47034 -0.5837 -2.01115 -1.1611 -0.68492 -0.7313 -0.98704 -1.8588 -1.59129 -4.1139l-0.51764 -1.9318c-0.60425 -2.2551 -0.90637 -3.3827 -0.67885 -4.3584 0.17964 -0.7705 0.58372 -1.47039 1.16114 -2.0112 0.73128 -0.68492 1.85882 -0.98704 4.1139 -1.59129 0.42663 -0.11431 0.81292 -0.21782 1.16544 -0.30897 -0.00003 0.00011 0.00003 -0.0001 0 0 -0.07642 0.27979 -0.15711 0.58123 -0.24399 0.90547l-0.51764 1.93185c-0.60425 2.25504 -0.90637 3.38264 -0.67885 4.35844 0.17964 0.7704 0.58372 1.4703 1.16114 2.0111 0.73128 0.6849 1.85883 0.9871 4.11393 1.5913 2.0325 0.5446 3.1491 0.8438 4.0641 0.731Z"
      />
      <path
        fill="#f59e0b"
        fillRule="evenodd"
        clipRule="evenodd"
        d="m20.8293 10.7154 -0.5177 1.9319c-0.6042 2.2551 -0.9064 3.3826 -1.5913 4.1139 -0.5408 0.5774 -1.2407 0.9815 -2.0111 1.1611 -0.0963 0.0225 -0.194 0.0398 -0.2942 0.0521 -0.9151 0.1129 -2.0316 -0.1863 -4.0642 -0.7309 -2.2551 -0.6043 -3.38265 -0.9064 -4.11393 -1.5913 -0.57742 -0.5408 -0.9815 -1.2407 -1.16114 -2.0112 -0.22752 -0.9758 0.0746 -2.1033 0.67885 -4.35837l0.51764 -1.93186c0.08688 -0.32423 0.16757 -0.62537 0.24399 -0.90516 0.45507 -1.66604 0.76088 -2.58263 1.3473 -3.20874 0.54079 -0.57742 1.24069 -0.9815 2.01119 -1.16114 0.9757 -0.22752 2.1033 0.0746 4.3584 0.67885 2.255 0.60425 3.3826 0.90637 4.1139 1.59129 0.5774 0.54081 0.9815 1.2407 1.1611 2.01116 0.2275 0.97577 -0.0746 2.10331 -0.6788 4.35837Zm-9.7769 -0.90951c0.1072 -0.4001 0.5185 -0.63754 0.9186 -0.53033l4.8296 1.29414c0.4001 0.1072 0.6375 0.5184 0.5303 0.9185 -0.1072 0.4001 -0.5184 0.6375 -0.9185 0.5303l-4.8297 -1.2941c-0.4001 -0.1072 -0.6375 -0.5184 -0.5303 -0.91851Zm-0.7768 2.89741c0.1072 -0.4001 0.5184 -0.6375 0.9185 -0.5303l2.8978 0.7765c0.4001 0.1072 0.6375 0.5184 0.5303 0.9185 -0.1072 0.4001 -0.5184 0.6376 -0.9185 0.5304l-2.8978 -0.7765c-0.4001 -0.1072 -0.6376 -0.5185 -0.5303 -0.9186Z"
      />
    </svg>
  );
}

// the apps, in order (more join as they're built)
const APPS = [{ key: "notes", href: "/notes", icon: NotesGlyph }];

/** trigger: the sidebar's More button (rendered by the sidebar), as a render prop's element */
export function MoreApps({ t, lang, trigger, onNavigate }) {
  const [open, setOpen] = useState(false);
  const base = `/${lang}/app`;
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={trigger} />
      <Popover.Portal>
        <Popover.Positioner side="right" align="start" sideOffset={14} className="z-50">
          <Popover.Popup className="w-[23rem] origin-[var(--transform-origin)] rounded-3xl border border-white/10 bg-[#1c1c1c] p-4 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)] outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="grid grid-cols-3 gap-x-2 gap-y-4 px-1 pt-2 pb-4">
              {APPS.map(({ key, href, icon: Icon }) => (
                <Link
                  key={key}
                  href={`${base}${href}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="group flex flex-col items-center gap-1.5 rounded-xl py-1 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <span className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-[#141414] transition-colors group-hover:bg-[#262626]">
                    <Icon className="size-8" />
                  </span>
                  <span className="text-[0.9375rem] font-medium">{t.apps[key]}</span>
                </Link>
              ))}
            </div>
            <Link
              href={`${base}/settings`}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-[0.9375rem] font-medium outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <Settings className="size-4" />
              {t.customize}
            </Link>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
