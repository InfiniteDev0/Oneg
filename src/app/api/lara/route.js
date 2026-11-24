// Lara's brain: POST /api/lara streams one reply from Claude.
//
// The browser sends the whole conversation (Claude's API keeps no memory between
// requests). Each request runs a small loop: Claude answers, or uses a tool
// (search Oneg's pages, search or read the web, or ask the person a question),
// we run the tool and send the result back, until Claude has finished the turn.
// Everything is streamed to the browser as one JSON object per line:
//   {type:"step", kind, label}       a tool Lara is using (shown as she works)
//   {type:"text", text}              part of her reply
//   {type:"ask", id, question, options, pending}  a question with tappable options
//   {type:"sources", items}          web pages she quoted
//   {type:"turn", messages}          the exact messages to add to the history
//   {type:"error", code}             busy | not_configured | refused | failed | too_many
//   {type:"done"}
//
// The history is append-only: the browser keeps Claude's messages exactly as
// they came back (thinking blocks included) and never edits earlier turns, which
// Claude requires for its saved reasoning, and which keeps the prompt cache warm.

import Anthropic from "@anthropic-ai/sdk";
import { hasLocale } from "@/i18n/config";
import { laraSystemPrompt } from "@/lib/lara/system-prompt";
import { searchOneg } from "@/lib/lara/oneg-search";

export const runtime = "nodejs";

const MODEL = "claude-opus-5-5";
const MAX_LOOPS = 8; // tool rounds per reply, so a runaway turn can't loop forever

// Declared in the same order on every request so Claude's prompt cache keeps working
const TOOLS = [
  { type: "web_search_20260209", name: "web_search", max_uses: 5 },
  { type: "web_fetch_20260209", name: "web_fetch", max_uses: 3 },
  {
    name: "search_oneg",
    description:
      "Search Oneg's own pages and services. Call this whenever you suggest a next step on Oneg (finding a doctor, booking a consultation, the Oneg Health Care Wallet, health records, prescriptions, the health library, emergency and nearby hospitals, help, or pages for doctors and hospitals), and link to the URLs it returns. Returns page titles, sections and URLs. It does not list individual doctors.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "A few words describing what the person needs, e.g. 'book a video consultation' or 'pay with M-Pesa'." },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "ask_user",
    description:
      "Ask the person ONE short question and offer 2 to 4 answers they can tap; they can also type their own. Use it when you need more details before you can advise safely (for example how long a symptom has lasted, how severe it is, their age, or whether they are pregnant). Your turn ends after this call and their answer comes back as the result. Never use it before telling someone to get emergency help.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        question: { type: "string", description: "The question, in the person's language." },
        options: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
          maxItems: 4,
          description: "2 to 4 short answers, in the person's language.",
        },
      },
      required: ["question", "options"],
      additionalProperties: false,
    },
  },
];

// ── Light abuse protection until sign-in exists: requests per IP per 10 minutes ──
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 40;
const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

// The conversation must be a list of user/assistant messages ending with the person's turn
function validHistory(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 200) return false;
  if (messages.at(-1).role !== "user" || messages[0].role !== "user") return false;
  return messages.every(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      (typeof m.content === "string" || Array.isArray(m.content))
  );
}

const isQuery = (input) => input && typeof input.query === "string" && input.query.trim().length > 0;
const isAsk = (input) =>
  input &&
  typeof input.question === "string" &&
  input.question.trim() &&
  Array.isArray(input.options) &&
  input.options.length >= 1 &&
  input.options.every((o) => typeof o === "string");

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const lang = hasLocale(body?.lang) ? body.lang : "en";
  const history = body?.messages;
  if (!validHistory(history)) return Response.json({ error: "bad_request" }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const limited = tooMany(ip);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          // the browser stopped reading (it pressed stop or closed the panel)
        }
      };
      const finish = () => {
        send({ type: "done" });
        controller.close();
      };

      if (limited) {
        send({ type: "error", code: "too_many" });
        return finish();
      }

      let client;
      try {
        client = new Anthropic();
      } catch {
        send({ type: "error", code: "not_configured" });
        return finish();
      }

      const convo = [...history];
      const added = []; // messages this request adds to the history, sent back at the end
      const sources = new Map();
      let wroteText = false;

      try {
        for (let loop = 0; loop < MAX_LOOPS; loop++) {
          let firstTextThisRound = true;
          const stream = client.beta.messages.stream(
            {
              model: MODEL,
              max_tokens: 32000,
              system: laraSystemPrompt(lang),
              tools: TOOLS,
              messages: convo,
              output_config: { effort: "medium" },
              cache_control: { type: "ephemeral" },
              // Saved chats replace old photos with a short note when the page reloads.
              // That changes the history, so Claude drops its saved reasoning from
              // before the change instead of rejecting the request.
              thinking: { type: "adaptive", block_binding: { prefix_mismatch_behavior: "drop_block" } },
              // If a safety check wrongly declines a health question, Anthropic retries
              // it on the model it recommends instead of failing the reply
              betas: ["server-side-fallback-2026-07-01", "thinking-binding-controls-2026-08-01"],
              fallbacks: "default",
            },
            { signal: request.signal }
          );

          stream.on("text", (text) => {
            // a blank line between what she wrote before and after using a tool
            if (firstTextThisRound && wroteText) send({ type: "text", text: "\n\n" });
            firstTextThisRound = false;
            wroteText = true;
            send({ type: "text", text });
          });

          stream.on("contentBlock", (block) => {
            if (block.type === "server_tool_use" && block.name === "web_search" && block.input?.query) {
              send({ type: "step", kind: "web", label: block.input.query });
            } else if (block.type === "server_tool_use" && block.name === "web_fetch" && block.input?.url) {
              send({ type: "step", kind: "read", label: hostOf(block.input.url) });
            } else if (block.type === "tool_use" && block.name === "search_oneg" && isQuery(block.input)) {
              send({ type: "step", kind: "oneg", label: block.input.query });
            }
          });

          const message = await stream.finalMessage();
          const turn = { role: "assistant", content: message.content };
          convo.push(turn);
          added.push(turn);

          // keep the web pages her answer quotes, to list under the reply
          for (const block of message.content) {
            for (const c of block.type === "text" ? block.citations ?? [] : []) {
              if (c.type === "web_search_result_location" && c.url && !sources.has(c.url)) {
                sources.set(c.url, { url: c.url, title: c.title || hostOf(c.url) });
              }
            }
          }

          if (message.stop_reason === "refusal") {
            send({ type: "error", code: "refused" });
            break;
          }
          if (message.stop_reason === "pause_turn") continue; // a long web search: let it carry on

          const toolUses = message.content.filter((b) => b.type === "tool_use");
          if (toolUses.length === 0) break; // she's finished
          if (message.stop_reason === "max_tokens") {
            send({ type: "error", code: "failed" });
            break;
          }

          // Run the Oneg searches now; a question waits for the person's answer
          const results = [];
          let ask = null;
          for (const use of toolUses) {
            if (use.name === "ask_user" && isAsk(use.input) && !ask) {
              ask = use;
            } else if (use.name === "search_oneg" && isQuery(use.input)) {
              results.push({ type: "tool_result", tool_use_id: use.id, content: JSON.stringify(await searchOneg(lang, use.input.query)) });
            } else {
              results.push({
                type: "tool_result",
                tool_use_id: use.id,
                is_error: true,
                content: JSON.stringify({ INVALID_INPUT: JSON.stringify(use.input) }),
              });
            }
          }

          if (ask) {
            // The person's answer is sent back with these results as the next message
            send({
              type: "ask",
              id: ask.id,
              question: ask.input.question,
              options: ask.input.options.slice(0, 4),
              pending: results,
            });
            break;
          }

          const toolTurn = { role: "user", content: results };
          convo.push(toolTurn);
          added.push(toolTurn);
        }

        if (sources.size) send({ type: "sources", items: [...sources.values()].slice(0, 6) });
        send({ type: "turn", messages: added });
      } catch (error) {
        if (request.signal.aborted) {
          // The person pressed stop: keep what was already finished, minus a last
          // tool call whose result never came (Claude rejects one left unanswered)
          const last = added.at(-1);
          if (last?.role === "assistant" && last.content.some((b) => b.type === "tool_use")) added.pop();
          send({ type: "turn", messages: added, stopped: true });
        } else if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
          send({ type: "error", code: "not_configured" });
        } else if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError) {
          send({ type: "error", code: "busy" });
        } else if (error instanceof Anthropic.APIError) {
          console.error("Lara: API error", error.status, error.message);
          send({ type: "error", code: error.status === 529 ? "busy" : "failed" });
        } else {
          console.error("Lara:", error);
          send({ type: "error", code: /api key|apiKey|credentials/i.test(String(error?.message)) ? "not_configured" : "failed" });
        }
      }
      try {
        finish();
      } catch {
        // the browser already went away
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
