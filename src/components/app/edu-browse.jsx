"use client";

// Home's Educational view, as Spotify's Browse: the health sciences in groups —
// study health (schools, scholarships…), life sciences, chemistry and
// medicines, the mind, the body, families, healthy living, public health,
// careers — each topic a coloured card with its name at the top and its picture
// tilted into the corner (an icon on a darker tile, where Spotify has a cover).
// Study health is drawn apart, as Spotify's shortcut tiles: the colour square
// with its icon on the left, the name and a line about it, an arrow on hover.
// A card or tile opens the topic's own page (/app/learn/<topic>, learn-page.jsx).
// The sections, icons and colours are in learn-data.js.

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SECTIONS, TOPICS } from "./learn-data";

export function TopicCard({ href, name, icon: Icon, colour }) {
  return (
    <Link
      href={href}
      style={{ backgroundColor: colour }}
      className="group relative flex aspect-[16/9] flex-col items-start overflow-hidden rounded-lg p-4 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <span className="relative z-10 block max-w-[62%] text-lg leading-tight font-bold text-white">{name}</span>
      {/* the picture, tilted into the corner, as Spotify's covers */}
      <span
        aria-hidden
        className="absolute -end-[6%] -bottom-[8%] grid aspect-square w-[42%] rotate-[25deg] place-items-center rounded-md bg-black/25 transition-transform duration-300 ease-out group-hover:rotate-[18deg] group-hover:scale-105 rtl:-rotate-[25deg] rtl:group-hover:-rotate-[18deg]"
      >
        <Icon className="size-1/2 text-white" strokeWidth={1.75} />
      </span>
    </Link>
  );
}

function StudyTile({ href, name, line, icon: Icon, colour }) {
  return (
    <Link
      href={href}
      className="group flex h-20 items-center gap-4 overflow-hidden rounded-lg bg-foreground/5 pe-4 outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="grid h-full aspect-square shrink-0 place-items-center" style={{ backgroundColor: colour }}>
        <Icon className="size-7 text-white" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-bold">{name}</span>
        <span className="block truncate text-sm text-muted-foreground">{line}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-180" />
    </Link>
  );
}

export function EduBrowse({ t, lang }) {
  return (
    <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-10 lg:px-6">
      {SECTIONS.map((section) => (
        <section key={section.key} className="mb-9">
          <h2 className="mb-3 text-lg font-bold">{t.sections[section.key]}</h2>
          {section.key === "study" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-3">
              {section.topics.map(([key]) => (
                <StudyTile key={key} href={`/${lang}/app/learn/${key}`} name={t.topics[key]} line={t.studyLines?.[key]} icon={TOPICS[key].icon} colour={TOPICS[key].colour} />
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))] gap-4">
            {section.topics.map(([key]) => (
              <TopicCard key={key} href={`/${lang}/app/learn/${key}`} name={t.topics[key]} icon={TOPICS[key].icon} colour={TOPICS[key].colour} />
            ))}
          </div>
          )}
        </section>
      ))}
    </div>
  );
}
