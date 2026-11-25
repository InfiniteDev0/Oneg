"use client";

// A topic's own page, as Spotify's category pages: a header in the topic's
// colour, fading into the page, with its name large and its picture. Under it,
// Barista's segment tabs (DayPanel's Day plan | Notes | Reminders: the pill
// slides to the one picked) — Books, Universities, Courses — kept in the
// address (?tab=) so a refresh stays on it:
//   Books         the Milo library's books for it (coming), and quick
//                 questions for Lara to learn it with
//   Universities  where to study it; for Medical schools, Nursing and
//                 Scholarships, the well-known places and programmes (Lara
//                 looks up what changes: entry requirements, fees, deadlines)
//   Courses       courses and certificates in it
// Then the other topics in its section.

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, ChevronLeft, GraduationCap, HelpCircle, Landmark, Library, Lightbulb, MessageCircleQuestion } from "lucide-react";
import { OPEN_LARA } from "@/components/lara/lara-chat";
import { cn } from "@/lib/utils";
import { TopicCard } from "./edu-browse";
import { SECTIONS, STUDY_LISTS, TOPICS } from "./learn-data";

const TABS = ["books", "universities", "courses"];
const ask = (text) => window.dispatchEvent(new CustomEvent(OPEN_LARA, { detail: { ask: text } }));

const PROMPTS = [
  ["basics", Lightbulb],
  ["questions", MessageCircleQuestion],
  ["myths", HelpCircle],
  ["study", GraduationCap],
];

function LaraFace() {
  return (
    <span className="oneg-lara-face size-[1.1rem] shrink-0 rounded-[5px]" aria-hidden="true">
      <span className="flex gap-[2px]">
        <span className="h-[5px] w-[3px] rounded-full bg-white" />
        <span className="h-[5px] w-[3px] rounded-full bg-white" />
      </span>
    </span>
  );
}

// the round Ask Lara button
function AskButton({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="oneg-lara-pill h-9 shrink-0 cursor-pointer">
      <span className="flex h-full items-center gap-2 px-4 text-sm font-medium">
        {label}
        <LaraFace />
      </span>
    </button>
  );
}

// a tab with nothing on Oneg yet: what will be here, and Lara meanwhile
function Coming({ icon: Icon, title, body, askLabel, onAsk }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <p className="font-semibold">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{body}</p>
      <AskButton label={askLabel} onClick={onAsk} />
    </div>
  );
}

export function LearnPage({ topic, t, lang }) {
  const info = TOPICS[topic];
  const name = t.topics[topic];
  const Icon = info.icon;
  const list = STUDY_LISTS[topic];
  const section = SECTIONS.find((s) => s.key === info.section);
  const related = section.topics.filter(([key]) => key !== topic);
  const fill = (text) => text.replaceAll("{topic}", name);

  // the tab: from the address after a refresh, Books to start
  const [tab, setTab] = useState("books");
  useEffect(() => {
    const saved = new URLSearchParams(window.location.search).get("tab");
    if (TABS.includes(saved)) setTab(saved);
  }, []);
  const choose = (next) => {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "books") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  return (
    // the panel's padding is cancelled so the colour runs edge to edge, as Spotify's
    <div className="-mx-4 -mt-6 lg:-mx-6">
      {/* The header, in the topic's colour */}
      <header
        className="relative overflow-hidden px-4 pt-5 pb-8 lg:px-6"
        style={{ background: `linear-gradient(to bottom, ${info.colour}, color-mix(in srgb, ${info.colour} 35%, transparent) 75%, transparent)` }}
      >
        <Link href={`/${lang}/app`} className="mb-8 inline-flex h-8 items-center gap-1 rounded-full bg-black/25 ps-2 pe-3 text-sm font-semibold text-white transition-colors hover:bg-black/40">
          <ChevronLeft className="size-4 rtl:rotate-180" />
          {t.back}
        </Link>
        <div className="flex items-end gap-6">
          <span aria-hidden className="grid size-28 shrink-0 rotate-[-6deg] place-items-center rounded-xl bg-black/25 sm:size-36">
            <Icon className="size-1/2 text-white" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 text-white">
            <p className="text-sm font-semibold opacity-90">{t.sections[info.section]}</p>
            <h1 className="mt-1 text-4xl leading-none font-black tracking-tight break-words sm:text-6xl">{name}</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-10 px-4 pb-12 lg:px-6">
        <div>
          {/* Books | Universities | Courses, as Barista's segment tabs: the pill slides to the one picked */}
          <div className="mb-6 flex items-center justify-end border-b border-border pb-4">
            <div role="tablist" className="flex w-full shrink-0 rounded-md bg-black/[0.06] p-0.5 sm:w-auto dark:bg-white/[0.08]">
              {TABS.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => choose(value)}
                  className={cn(
                    "relative flex-1 cursor-pointer rounded-[5px] px-3 py-1.5 text-sm font-medium outline-none transition-colors sm:flex-none sm:py-1 sm:text-[13px]",
                    tab === value ? "text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === value && (
                    <motion.span layoutId="learn-tab" transition={{ type: "spring", stiffness: 245, damping: 36, mass: 1.2 }} className="absolute inset-0 rounded-[5px] bg-foreground" />
                  )}
                  <span className="relative">{t.tabs[value]}</span>
                </button>
              ))}
            </div>
          </div>

          {tab === "books" && (
            <div className="flex flex-col gap-8">
              <Coming icon={Library} title={t.books.title} body={fill(t.books.body)} askLabel={t.books.askLabel} onAsk={() => ask(fill(t.books.ask))} />
              {/* quick questions for Lara, to learn it with */}
              <section>
                <h2 className="mb-3 text-xl font-bold">{fill(t.askHeading)}</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
                  {PROMPTS.map(([key, PromptIcon]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => ask(fill(t.prompts[key].ask))}
                      className="oneg-lara-card flex cursor-pointer items-center gap-3 p-3.5 text-start outline-none"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                        <PromptIcon className="size-4.5" />
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-semibold">{t.prompts[key].label}</span>
                      <LaraFace />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {tab === "universities" &&
            (list ? (
              <section>
                <h2 className="mb-1 text-xl font-bold">{t.lists[topic]}</h2>
                <p className="mb-3 text-sm text-muted-foreground">{t.listNote}</p>
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {list.map((item) => (
                    <li key={item} className="flex items-center gap-3 px-4 py-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: info.colour }}>
                        <Icon className="size-4.5" />
                      </span>
                      <span className="min-w-0 flex-1 text-[0.9375rem] font-medium">{item}</span>
                      <AskButton label={t.askLara} onClick={() => ask(t.listAsk[topic === "scholarships" ? "scholarship" : "school"].replace("{name}", item))} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <Coming icon={Landmark} title={t.universities.title} body={fill(t.universities.body)} askLabel={t.universities.askLabel} onAsk={() => ask(fill(t.universities.ask))} />
            ))}

          {tab === "courses" && (
            <Coming icon={BookOpen} title={t.courses.title} body={fill(t.courses.body)} askLabel={t.courses.askLabel} onAsk={() => ask(fill(t.courses.ask))} />
          )}
        </div>

        {/* The other topics in its section */}
        {related.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-bold">{t.related.replace("{section}", t.sections[info.section])}</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))] gap-4">
              {related.map(([key]) => (
                <TopicCard key={key} href={`/${lang}/app/learn/${key}`} name={t.topics[key]} icon={TOPICS[key].icon} colour={TOPICS[key].colour} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
