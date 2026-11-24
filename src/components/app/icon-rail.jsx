"use client";

// ClickUp's icon rail, at Barista's folded-sidebar size (60px wide): each item is
// an icon tile with its name small under it. The » at the top shows or hides the
// side panel (Lenzro's), a short line under it, then Home, Planner, AI (Lara) and
// More (the app tiles, with ClickUp's tooltip), and Labs, Install, Invite and
// Upgrade at the bottom.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, FlaskConical, UserPlus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { OPEN_LARA } from "@/components/lara/lara-chat";
import { cn } from "@/lib/utils";
import { HomeTile, InstallGlyph, MoreCluster, PlannerGlyph, UpgradeGlyph } from "./app-icons";

// Barista's NAV_ITEM_CLASS, folded: no fill on the button, the tile takes the
// hover and active grey; the name small, centred, one line under it
const ITEM = "group/rail flex w-full cursor-pointer flex-col items-center gap-1 outline-none";
const TILE =
  "grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors group-hover/rail:bg-foreground/10 group-hover/rail:text-foreground group-focus-visible/rail:ring-2 group-focus-visible/rail:ring-ring [&_svg]:size-5";
const NAME = "max-w-full truncate px-0.5 text-[0.6875rem] leading-tight font-medium text-foreground/70 group-hover/rail:text-foreground";

function RailItem({ href, onClick, label, tip, active, tile, children }) {
  const inner = (
    <>
      {tile ?? <span className={cn(TILE, active && "bg-foreground/15 text-foreground")}>{children}</span>}
      <span className={cn(NAME, active && "font-semibold text-foreground")}>{label}</span>
    </>
  );
  const el = href ? (
    <Link href={href} className={ITEM} aria-current={active ? "page" : undefined}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={ITEM}>
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

export function IconRail({ t, lang, panelOpen, onTogglePanel }) {
  const r = t.rail;
  const pathname = usePathname();
  const base = `/${lang}/app`;
  const Toggle = panelOpen ? ChevronsLeft : ChevronsRight;

  return (
    <nav className="flex w-[60px] shrink-0 flex-col items-center gap-3 px-1 pt-1 pb-2">
      {/* Barista's SidebarToggle, folded: the » and a short line under it */}
      <div className="flex flex-col items-center gap-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={onTogglePanel}
                aria-label={panelOpen ? r.collapse : r.expand}
                aria-expanded={panelOpen}
                className="grid size-9 cursor-pointer place-items-center rounded-xl text-foreground transition-colors hover:bg-foreground/10"
              />
            }
          >
            <Toggle className="size-5 rtl:rotate-180" strokeWidth={2.5} />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {panelOpen ? r.collapse : r.expand}
          </TooltipContent>
        </Tooltip>
        <span aria-hidden className="h-0.5 w-6 rounded-full bg-foreground/10" />
      </div>

      <div className="flex w-full flex-col items-center gap-3.5">
        <RailItem href={base} label={r.home} active={pathname === base} tile={<HomeTile count={3} />} />
        <RailItem href={`${base}/planner`} label={r.planner} active={pathname.startsWith(`${base}/planner`)}>
          <PlannerGlyph />
        </RailItem>
        <RailItem onClick={() => window.dispatchEvent(new CustomEvent(OPEN_LARA))} label={r.ai}>
          <span className="oneg-lara-face size-[1.35rem] rounded-[7px]" aria-hidden="true">
            <span className="flex gap-[3px]">
              <span className="h-[6px] w-[3.5px] rounded-full bg-white" />
              <span className="h-[6px] w-[3.5px] rounded-full bg-white" />
            </span>
          </span>
        </RailItem>
        <RailItem
          href={`${base}/apps`}
          label={r.more}
          tip={r.moreTip}
          active={pathname.startsWith(`${base}/apps`)}
          tile={
            <span className="grid size-11 place-items-center rounded-2xl bg-[radial-gradient(closest-side,rgb(255_255_255/0.12),transparent)] transition-transform group-hover/rail:scale-105">
              <MoreCluster />
            </span>
          }
        />
      </div>

      <div className="mt-auto flex w-full flex-col items-center gap-3.5">
        <RailItem href={`${base}/labs`} label={r.labs} active={pathname.startsWith(`${base}/labs`)}>
          <FlaskConical />
        </RailItem>
        <RailItem href={`${base}/download`} label={r.install} active={pathname.startsWith(`${base}/download`)}>
          <InstallGlyph />
        </RailItem>
        <RailItem href={`${base}/family`} label={r.invite} active={pathname.startsWith(`${base}/family`)}>
          <UserPlus />
        </RailItem>
        <RailItem href={`${base}/upgrade`} label={r.upgrade} active={pathname.startsWith(`${base}/upgrade`)}>
          <UpgradeGlyph />
        </RailItem>
      </div>
    </nav>
  );
}
