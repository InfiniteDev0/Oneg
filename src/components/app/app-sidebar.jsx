"use client";

// The app's sidebar, built to Barista's (AdminSidebar, NavMain, SidebarToggle on
// shadcn's Sidebar with variant "inset", collapsible "icon"):
//   a card in the sidebar colour (black in light mode, Barista's grey in dark, or
//   a gradient of your theme colour), 18rem wide open, folding to a 60px rail where
//   each name sits small under its icon's tile. Under the top bar: p-2 around the
//   card, no top padding.
//   Header   Barista's toggle: "Collapse" with « open, » folded, and a short line
//   Content  ClickUp's items: Home, Planner, AI (Lara), More
//   Footer   ClickUp's Labs, Install, Invite, Upgrade
// Icons work as Barista's NavIcon: the image is only a mask, its colour comes
// from the rail's tokens: grey at rest, yellow→pink under the pointer, yellow→
// green on the page you're on (globals.css, --rail-icon*).
// More is ClickUp's: nine dots that turn into the app tiles when you point at it,
// with "Add apps, hubs and integrations".

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { OPEN_LARA } from "@/components/lara/lara-chat";
import { cn } from "@/lib/utils";
import { MoreCluster } from "./app-icons";

// Barista's lib/mask.ts: the image's shape as a mask, its colour from CSS
const mask = (name) => {
  const image = `url("/icons/rail/${name}.svg")`;
  return {
    maskImage: image,
    WebkitMaskImage: image,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  };
};

// Barista's NAV_ITEM_CLASS: h-10, 15px names, the name dimmed at rest. Folded
// (data-folded on the sidebar), the button spans the rail with no fill; the
// tile takes the grey, and the name sits small under it.
const ITEM = cn(
  "group/item flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-[0.9375rem] text-sidebar-foreground/70 outline-none transition-colors",
  "hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
  "data-active:bg-sidebar-foreground/20 data-active:text-sidebar-foreground data-active:hover:bg-sidebar-foreground/20",
  "dark:data-active:bg-transparent! dark:data-active:hover:bg-transparent!",
  "group-data-folded/sidebar:h-auto group-data-folded/sidebar:flex-col group-data-folded/sidebar:gap-1 group-data-folded/sidebar:p-0 group-data-folded/sidebar:bg-transparent!"
);
// Barista's NavIcon tile: folded, a 36px rounded-xl tile that greys under the
// pointer, brighter (black in dark mode) on the page you're on
const TILE = cn(
  "relative flex shrink-0 items-center justify-center",
  "group-data-folded/sidebar:size-9 group-data-folded/sidebar:rounded-xl",
  "group-data-folded/sidebar:group-hover/item:bg-sidebar-foreground/10",
  "group-data-folded/sidebar:group-data-active/item:bg-sidebar-foreground/20! dark:group-data-folded/sidebar:group-data-active/item:bg-black!"
);
const ICON =
  "size-5 shrink-0 bg-(--rail-icon) group-hover/item:bg-(image:--rail-icon-hover) group-data-active/item:bg-(image:--rail-icon-active)!";
const NAME = cn(
  "truncate",
  "group-data-folded/sidebar:max-w-full group-data-folded/sidebar:px-0.5 group-data-folded/sidebar:text-[0.6875rem] group-data-folded/sidebar:leading-tight group-data-folded/sidebar:font-medium"
);

function Item({ href, onClick, label, active, tip, children }) {
  const props = { "data-active": active ? "" : undefined, className: ITEM };
  const inner = (
    <>
      <span className={TILE}>{children}</span>
      <span className={NAME}>{label}</span>
    </>
  );
  const el = href ? (
    <Link href={href} aria-current={active ? "page" : undefined} {...props}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} {...props}>
      {inner}
    </button>
  );
  if (!tip) return el;
  return (
    <Tooltip>
      <TooltipTrigger render={el} />
      <TooltipContent side="right" sideOffset={8}>
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}

const Icon = ({ name }) => <span aria-hidden style={mask(name)} className={ICON} />;

export function AppSidebar({ t, lang, open, onToggle }) {
  const r = t.rail;
  const pathname = usePathname();
  const base = `/${lang}/app`;
  const at = (path) => (path ? pathname.startsWith(`${base}${path}`) : pathname === base);
  const Toggle = open ? ChevronsLeft : ChevronsRight;

  return (
    // Barista: p-2 around the card, none on top (it sits under the top bar); open
    // --sidebar-width 72 spacing (18rem), folded --sidebar-width-icon 15 spacing
    // (3.75rem) + that padding + 2px
    <div
      data-folded={open ? undefined : ""}
      className={cn("group/sidebar shrink-0 p-2 pt-0 transition-[width] duration-200 ease-linear", open ? "w-72" : "w-[calc(3.75rem+1rem+2px)]")}
    >
      <div data-slot="sidebar-inner" className="flex size-full flex-col overflow-hidden rounded-sm bg-sidebar text-sidebar-foreground">
        {/* Header: Barista's SidebarToggle (p-2, then pt-2 and gap-3 inside) */}
        <div className="flex flex-col gap-2 p-2">
          <div className="flex flex-col gap-3 pt-2 group-data-folded/sidebar:items-center group-data-folded/sidebar:px-0">
            <button
              type="button"
              onClick={onToggle}
              aria-label={open ? r.collapse : r.expand}
              aria-expanded={open}
              className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-start text-base font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/10 group-data-folded/sidebar:size-9 group-data-folded/sidebar:justify-center group-data-folded/sidebar:rounded-xl group-data-folded/sidebar:px-0"
            >
              <Toggle className="size-5 shrink-0 rtl:rotate-180" strokeWidth={2.5} />
              <span className="truncate text-sm group-data-folded/sidebar:hidden">{r.collapse}</span>
            </button>
            <span aria-hidden className="h-0.5 w-full rounded-full bg-sidebar-foreground/10 group-data-folded/sidebar:w-6" />
          </div>
        </div>

        {/* Content: Barista's NavMain (gap-1; folded px-1 py-1 and gap-1.5) */}
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2 [scrollbar-width:none] group-data-folded/sidebar:items-center group-data-folded/sidebar:gap-1.5 group-data-folded/sidebar:px-1 group-data-folded/sidebar:py-1">
          <Item href={base} label={r.home} active={at("")}>
            <Icon name="home" />
            <span className="absolute -end-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#e5397f] px-1 text-[0.625rem] font-bold text-white ring-2 ring-sidebar group-data-folded/sidebar:-end-1.5 group-data-folded/sidebar:-top-1.5">
              3
            </span>
          </Item>
          <Item href={`${base}/planner`} label={r.planner} active={at("/planner")}>
            <Icon name="planner" />
          </Item>
          <Item onClick={() => window.dispatchEvent(new CustomEvent(OPEN_LARA))} label={r.ai}>
            <Icon name="ai" />
          </Item>
          <Item href={`${base}/apps`} label={r.more} active={at("/apps")} tip={r.moreTip}>
            {/* nine dots at rest; under the pointer, ClickUp's app tiles spring in */}
            <span className="relative grid size-5 place-items-center">
              <span
                aria-hidden
                style={mask("more")}
                className={cn(ICON, "absolute inset-0 transition-all duration-300 ease-out group-hover/item:scale-50 group-hover/item:opacity-0")}
              />
              <MoreCluster className="scale-50 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/item:scale-100 group-hover/item:opacity-100" />
            </span>
          </Item>
        </nav>

        {/* Footer: ClickUp's bottom items */}
        <div className="flex flex-col gap-1 p-2 pb-3 group-data-folded/sidebar:items-center group-data-folded/sidebar:gap-1.5 group-data-folded/sidebar:px-1">
          <Item href={`${base}/labs`} label={r.labs} active={at("/labs")}>
            <Icon name="labs" />
          </Item>
          <Item href={`${base}/download`} label={r.install} active={at("/download")}>
            <Icon name="install" />
          </Item>
          <Item href={`${base}/family`} label={r.invite} active={at("/family")}>
            <Icon name="invite" />
          </Item>
          <Item href={`${base}/upgrade`} label={r.upgrade} active={at("/upgrade")}>
            <Icon name="upgrade" />
          </Item>
        </div>
      </div>
    </div>
  );
}
