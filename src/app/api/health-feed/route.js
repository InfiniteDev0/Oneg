// GET /api/health-feed?lang=en[&page=…] — real health news for Home's feed,
// as posts: who wrote it, the headline, a line or two, a picture, the link.
//
// Where it comes from:
//   newsdata.io   (needs a key: NEWSDATA_API_KEY, or the older
//                 NEXT_PUBLIC_API_KEY, in .env; only ever read here, on the server)
//                   · health news from the top sources (newsdata's top 10% of
//                     sites, which keeps out the blogs) in your language; it
//                     pages: `next` is the token for the next lot
//                   · on the first page, Kenya's health news (our launch market)
//   WHO and BBC   their free health feeds (RSS), the newest few, on the first
//                 page only, so there's news even without a key.
// Each source is fetched at most every 15 minutes (Next's fetch cache), which
// keeps newsdata's free plan (200 calls a day) far from its limit.

const REVALIDATE = 900;
const LANGS = new Set(["en", "sw", "so", "ar"]);
// WHO's feed keeps years of releases; only the recent ones are news
const MAX_AGE_DAYS = 120;
// so one feed doesn't fill the page (BBC's has 50 stories)
const PER_RSS_SOURCE = 8;

const RSS_SOURCES = [
  {
    id: "who",
    name: "World Health Organization",
    handle: "WHO",
    site: "who.int",
    url: "https://www.who.int/rss-feeds/news-english.xml",
  },
  {
    id: "bbc",
    name: "BBC Health",
    handle: "BBCHealth",
    site: "bbc.co.uk",
    url: "https://feeds.bbci.co.uk/news/health/rss.xml",
    // BBC's pictures come 240px wide; their image server has bigger ones
    image: (src) => src.replace(/\/standard\/\d+\//, "/standard/800/"),
  },
];

// ── Text out of HTML and XML ──

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", ndash: "–", mdash: "—", hellip: "…" };

function decode(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

// the words of an HTML snippet: no tags, entities read, spaces tidied
function plain(html) {
  if (!html) return "";
  return decode(decode(html).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return "";
  return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
}

function attr(xml, name, attribute) {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*\\b${attribute}="([^"]+)"`, "i"));
  return m ? decode(m[1]) : "";
}

// a line or two, cut at a word
function clip(text, max = 280) {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max - 1) || max).replace(/[\s,.;:]+$/, "")}…`;
}

// ── The sources ──

async function fromRss(source) {
  const res = await fetch(source.url, { headers: { "user-agent": "Mozilla/5.0 (Oneg health feed)" }, next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`${source.id} ${res.status}`);
  const xml = await res.text();
  const oldest = Date.now() - MAX_AGE_DAYS * 86400000;
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map(([, item]) => {
      const url = decode(tag(item, "link"));
      const published = new Date(tag(item, "pubDate").replace(/ Z$/, " GMT"));
      const picture = attr(item, "media:thumbnail", "url") || attr(item, "media:content", "url") || attr(item, "enclosure", "url");
      const title = plain(tag(item, "title"));
      const text = plain(tag(item, "description"));
      return {
        id: `${source.id}:${url}`,
        source: { name: source.name, handle: source.handle, site: source.site, icon: null },
        title,
        // BBC's description often only repeats the headline
        text: text && text !== title ? clip(text) : "",
        image: picture ? (source.image ? source.image(picture) : picture) : null,
        url,
        publishedAt: Number.isNaN(published.getTime()) ? null : published.toISOString(),
      };
    })
    .filter((p) => p.title && p.url && p.publishedAt && Date.parse(p.publishedAt) >= oldest)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, PER_RSS_SOURCE);
}

async function fromNewsdata(key, query, page) {
  const params = new URLSearchParams({ apikey: key, category: "health", removeduplicate: "1", ...query });
  if (page) params.set("page", page);
  const res = await fetch(`https://newsdata.io/api/1/latest?${params}`, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`newsdata ${res.status}`);
  const data = await res.json();
  const posts = (data.results ?? [])
    .filter((r) => r.title && r.link)
    .map((r) => {
      let site = r.source_url ?? "";
      try {
        site = new URL(r.source_url ?? r.link).hostname.replace(/^www\./, "");
      } catch {
        // keep what it says
      }
      const text = plain(r.description);
      return {
        id: `nd:${r.article_id ?? r.link}`,
        source: {
          name: r.source_name || r.source_id || site,
          handle: r.source_id || site,
          site,
          icon: r.source_icon || null,
        },
        title: plain(r.title),
        text: text && !text.startsWith("ONLY AVAILABLE") ? clip(text) : "",
        image: r.image_url || null,
        url: r.link,
        // newsdata gives "2026-11-25 10:00:00" in UTC
        publishedAt: r.pubDate ? new Date(`${r.pubDate.replace(" ", "T")}Z`).toISOString() : null,
      };
    });
  return { posts, next: data.nextPage ?? null };
}

// Stories tagged "health" that are not health: horoscopes and the like never reach the feed
const NOT_HEALTH = /horoscope|numerolog|astrolog|zodiac|tarot|lottery|betting odds/i;

// the same story from two places shows once
function dedupe(posts) {
  const seen = new Set();
  return posts.filter((p) => {
    const k = p.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = LANGS.has(searchParams.get("lang")) ? searchParams.get("lang") : "en";
  const page = searchParams.get("page");
  const key = process.env.NEWSDATA_API_KEY || process.env.NEXT_PUBLIC_API_KEY;

  // first in the list: the stream that pages, whose token is `next`
  const jobs = [];
  const once = (job) => job.then((r) => ({ posts: r.posts, next: null }));
  if (key) {
    jobs.push(fromNewsdata(key, { language: lang, prioritydomain: "top" }, page));
    if (!page) {
      jobs.push(once(fromNewsdata(key, { country: "ke" }, null)));
      // little health news in Swahili, Somali or Arabic: English fills in
      if (lang !== "en") jobs.push(once(fromNewsdata(key, { language: "en", prioritydomain: "top" }, null)));
    }
  }
  if (!page) for (const source of RSS_SOURCES) jobs.push(fromRss(source).then((posts) => ({ posts, next: null })));

  const settled = await Promise.allSettled(jobs);
  const failed = settled.filter((s) => s.status === "rejected");
  for (const f of failed) console.warn("[health-feed]", f.reason?.message ?? f.reason);
  const ok = settled.filter((s) => s.status === "fulfilled").map((s) => s.value);

  if (!ok.length) return Response.json({ error: "unavailable" }, { status: 502 });

  const posts = dedupe(ok.flatMap((r) => r.posts).filter((p) => !NOT_HEALTH.test(`${p.title} ${p.text}`))).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const next = (key && settled[0]?.status === "fulfilled" && settled[0].value.next) || null;
  return Response.json({ posts, next }, { headers: { "cache-control": "private, max-age=300" } });
}
