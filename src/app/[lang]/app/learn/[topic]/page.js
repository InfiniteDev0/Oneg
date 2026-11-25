// An Educational topic's own page: /app/learn/biology, /app/learn/scholarships…
// (LearnPage). An unknown topic is a 404.

import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { LearnPage } from "@/components/app/learn-page";
import { TOPICS } from "@/components/app/learn-data";

export default async function LearnTopic({ params }) {
  const { lang, topic } = await params;
  if (!TOPICS[topic]) notFound();
  const t = (await getDictionary(lang)).app.home.edu;
  return <LearnPage topic={topic} t={t} lang={lang} />;
}
