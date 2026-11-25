// POST /api/lara/write — Lara writing into a note, from the Notes editor (lara-writer.jsx).
// One request, one piece of writing, handed back as note-ready HTML (the editor's own tags only):
//
//   ask         answer what you asked (/lara), using the note as context
//   summarise   a short summary of the note
//   questions   revision questions on the note, with the answers after
//   flashcards  question → answer cards from the note
//   continue    carry on writing the note, in its voice
//   explain     explain the selected text simply
//   simplify    say the selected text in plainer words
//   recap       summarise the selected text
//
// Same model and safety net as Lara's chat (/api/lara): Claude Opus 5.5, adaptive thinking, and
// the server-side fallback so a wrongly declined health question is retried. No tools: this is
// writing from what's on the page (her chat has web search for anything current).

import Anthropic from "@anthropic-ai/sdk";
import { hasLocale } from "@/i18n/config";

const MODEL = "claude-opus-5-5";
const ACTIONS = new Set(["ask", "summarise", "questions", "flashcards", "continue", "explain", "simplify", "recap"]);
const MAX_NOTE = 24000; // characters of the note sent as context
const MAX_PROMPT = 2000;

const LANGUAGE = { en: "English", sw: "Swahili", so: "Somali", ar: "Arabic" };

// a few requests a minute per address, as the chat route keeps it
const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 12;
}

const system = (lang) => `You are Lara, the health study assistant in Oneg, a health platform for people in Kenya and East Africa. You are writing directly into the user's study note.

Write in ${LANGUAGE[lang] ?? "English"}, matching the note's language if it is clearly written in another.

Output only an HTML fragment that goes straight into the note. Use only these tags: <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <code>, <br>. No attributes, no markdown, no code fences, no <html> or <body>, and no lead-in like "Here is" — start with the content itself.

Be accurate and plain-spoken, the way a good tutor writes study notes: short paragraphs, clear headings when they help, lists for steps and key points. Explain medical terms the first time they appear. Do not invent facts, figures or references; if something is uncertain or depends on the person, say so. When writing about a personal health problem rather than a study topic, add a short line on when to see a health worker; in an emergency, say to call 999 or 112 (Kenya).`;

function task(action, { prompt, note, selection }) {
  const noteBlock = note ? `<note>\n${note}\n</note>` : "<note>(empty)</note>";
  const sel = `<selection>\n${selection}\n</selection>`;
  switch (action) {
    case "ask":
      return `${noteBlock}\n\nThe user asks, while writing this note:\n<question>\n${prompt}\n</question>\n\nWrite the answer as a part of their note.`;
    case "summarise":
      return `${noteBlock}\n\nWrite a short summary of this note: an <h3> heading "Summary", then the key points as a list.`;
    case "questions":
      return `${noteBlock}\n\nWrite revision questions that test understanding of this note: an <h3> "Revision questions", an <ol> of 5 to 8 questions, then an <h3> "Answers" and an <ol> of short answers in the same order.`;
    case "flashcards":
      return `${noteBlock}\n\nMake flashcards from this note: an <h3> "Flashcards", then a <ul> where each <li> is one card written as <strong>the question</strong><br>the answer. 6 to 12 cards, one idea each.`;
    case "continue":
      return `${noteBlock}\n\nContinue writing this note from where it ends, in the same voice and format. Add one or two paragraphs or a few points that naturally come next. Do not repeat what is already there.`;
    case "explain":
      return `${noteBlock}\n\nExplain this part of the note simply, as if to a first-year student:\n${sel}`;
    case "simplify":
      return `${noteBlock}\n\nRewrite this part of the note in plainer, shorter words, keeping every fact:\n${sel}`;
    case "recap":
      return `${noteBlock}\n\nSummarise this part of the note in two or three sentences or a few points:\n${sel}`;
    default:
      return noteBlock;
  }
}

// only the editor's own tags, without attributes; anything else is dropped
const ALLOWED = new Set(["p", "h2", "h3", "ul", "ol", "li", "strong", "em", "blockquote", "code", "br"]);
function clean(html) {
  return html
    .replace(/^\s*```(?:html)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-z0-9]+)[^>]*>/gi, (tag, name) => {
      const n = name.toLowerCase();
      if (!ALLOWED.has(n)) return "";
      return tag.startsWith("</") ? `</${n}>` : n === "br" ? "<br>" : `<${n}>`;
    })
    .trim();
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const action = body?.action;
  if (!ACTIONS.has(action)) return Response.json({ error: "bad_request" }, { status: 400 });
  const lang = hasLocale(body?.lang) ? body.lang : "en";
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim().slice(0, MAX_PROMPT) : "";
  const note = typeof body?.note === "string" ? body.note.slice(-MAX_NOTE) : "";
  const selection = typeof body?.selection === "string" ? body.selection.slice(0, MAX_NOTE) : "";
  if (action === "ask" && !prompt) return Response.json({ error: "bad_request" }, { status: 400 });
  if (["explain", "simplify", "recap"].includes(action) && !selection.trim()) return Response.json({ error: "bad_request" }, { status: 400 });
  if (["summarise", "questions", "flashcards", "continue"].includes(action) && !note.trim()) return Response.json({ error: "empty_note" }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (tooMany(ip)) return Response.json({ error: "too_many" }, { status: 429 });

  let client;
  try {
    client = new Anthropic();
  } catch {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const stream = client.beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 16000,
        system: system(lang),
        messages: [{ role: "user", content: task(action, { prompt, note, selection }) }],
        output_config: { effort: "medium" },
        thinking: { type: "adaptive" },
        // a health question wrongly declined is retried on the model Anthropic recommends
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      },
      { signal: request.signal }
    );
    const message = await stream.finalMessage();
    if (message.stop_reason === "refusal") return Response.json({ error: "refused" }, { status: 422 });
    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const html = clean(text);
    if (!html) return Response.json({ error: "failed" }, { status: 502 });
    return Response.json({ html, cut: message.stop_reason === "max_tokens" });
  } catch (error) {
    if (request.signal.aborted) return Response.json({ error: "stopped" }, { status: 499 });
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: "not_configured" }, { status: 503 });
    if (error instanceof Anthropic.RateLimitError) return Response.json({ error: "too_many" }, { status: 429 });
    console.warn("[lara/write]", error?.message ?? error);
    return Response.json({ error: "failed" }, { status: 502 });
  }
}
