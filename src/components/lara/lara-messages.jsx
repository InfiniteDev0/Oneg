"use client";

// The messages in Lara's panel.
// - Your messages: a bubble, with Copy and Edit under it on hover (like ChatGPT's).
// - Lara's replies: what she's doing while she works (beUI's Reasoning Text, then
//   Agent Activity listing her searches), her answer, the options when she asks
//   you something, the web pages she used, and a bar under the answer: Copy,
//   Good / Bad response, Read aloud, Share, and "…" with the time and Retry.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  Check,
  Copy,
  FileText,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Share,
  Square,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from "lucide-react";
import { AgentActivity } from "@/components/agents/agent-activity";
import { ReasoningText } from "@/components/agents/loading-states/reasoning-text";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LaraReply } from "./lara-reply";

const ICON_BUTTON =
  "flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

const SPEECH_LANG = { en: "en-GB", sw: "sw-KE", so: "so-SO", ar: "ar-SA" };

// Plain text for copying, sharing and reading aloud (no Markdown symbols)
const plain = (markdown = "") =>
  markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

function IconAction({ label, onClick, disabled, active, children }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<button type="button" onClick={onClick} disabled={disabled} />}
        aria-label={label}
        aria-pressed={active}
        className={cn(ICON_BUTTON, active && "text-foreground")}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (e.g. not a secure page): nothing to do
    }
  };
  return [copied, copy];
}

// Lara's Markdown: links to Oneg pages stay in the app, web links open a new tab
function Markdown({ children }) {
  return (
    <div className="oneg-lara-md text-[15px] leading-relaxed text-foreground/90">
      <ReactMarkdown
        components={{
          a: ({ href = "", children: label }) =>
            href.startsWith("/") ? (
              <Link href={href} className="font-medium text-primary underline underline-offset-4 hover:decoration-2">
                {label}
              </Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4 hover:decoration-2">
                {label}
              </a>
            ),
          h1: "p",
          h2: "p",
          h3: "p",
          h4: "p",
          img: () => null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/* ── Your messages ───────────────────────────────────────────── */

export function UserMessage({ message, t, busy, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const [copied, copy] = useCopy();
  const a = t.actions;

  if (editing) {
    return (
      <div className="ms-auto w-full max-w-[92%] rounded-2xl bg-muted p-3">
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (draft.trim()) {
                setEditing(false);
                onEdit(draft.trim());
              }
            } else if (e.key === "Escape") setEditing(false);
          }}
          rows={Math.min(8, Math.max(2, draft.split("\n").length))}
          className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none"
        />
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)} className="h-8 cursor-pointer rounded-full px-3 text-sm hover:bg-background/60">
            {a.cancel}
          </button>
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => {
              setEditing(false);
              onEdit(draft.trim());
            }}
            className="h-8 cursor-pointer rounded-full bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"
          >
            {a.save}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group/msg ms-auto flex max-w-[85%] flex-col items-end gap-1">
      {message.attachments?.length > 0 && (
        <div className="flex flex-wrap justify-end gap-1.5">
          {message.attachments.map((file, i) =>
            file.kind === "image" && file.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={file.preview} alt={file.name} className="size-20 rounded-xl object-cover" />
            ) : (
              <span key={i} className="flex h-9 max-w-48 items-center gap-1.5 rounded-xl bg-muted px-2.5 text-xs text-muted-foreground">
                <FileText className="size-4 shrink-0" />
                <span className="truncate">{file.name}</span>
              </span>
            )
          )}
        </div>
      )}
      <p className="rounded-2xl bg-muted px-3.5 py-2 text-[15px] whitespace-pre-wrap">{message.text}</p>
      <div className="flex opacity-0 transition-opacity group-hover/msg:opacity-100 focus-within:opacity-100">
        <IconAction label={copied ? a.copied : a.copy} onClick={() => copy(message.text)}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </IconAction>
        {!message.isAnswer && (
          <IconAction
            label={a.edit}
            disabled={busy}
            onClick={() => {
              setDraft(message.text);
              setEditing(true);
            }}
          >
            <Pencil className="size-4" />
          </IconAction>
        )}
      </div>
    </div>
  );
}

/* ── Lara's replies ──────────────────────────────────────────── */

function ActionBar({ message, t, lang, busy, onRetry, onFeedback }) {
  const [copied, copy] = useCopy();
  const [speaking, setSpeaking] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const a = t.actions;
  const text = plain(message.text);

  useEffect(() => () => speaking && window.speechSynthesis?.cancel(), [speaking]);

  const readAloud = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG[lang] ?? "en-GB";
    utterance.onend = utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
    setSpeaking(true);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Lara · Oneg", text });
        return;
      } catch {
        // the person closed the share sheet
        return;
      }
    }
    copy(text);
  };

  const time = new Intl.DateTimeFormat(lang, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(
    message.endedAt ?? message.startedAt ?? Date.now()
  );

  return (
    <div className="-ms-1.5 mt-1 flex items-center">
      {text && (
        <IconAction label={copied ? a.copied : a.copy} onClick={() => copy(text)}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </IconAction>
      )}
      {text && (
        <>
          <IconAction label={message.feedback === "good" ? a.thanks : a.good} active={message.feedback === "good"} onClick={() => onFeedback("good")}>
            <ThumbsUp className={cn("size-4", message.feedback === "good" && "fill-current")} />
          </IconAction>
          <IconAction label={message.feedback === "bad" ? a.thanks : a.bad} active={message.feedback === "bad"} onClick={() => onFeedback("bad")}>
            <ThumbsDown className={cn("size-4", message.feedback === "bad" && "fill-current")} />
          </IconAction>
          <IconAction label={speaking ? a.stopReading : a.read} active={speaking} onClick={readAloud}>
            {speaking ? <Square className="size-3.5 fill-current" /> : <Volume2 className="size-4" />}
          </IconAction>
          <IconAction label={a.share} onClick={share}>
            <Share className="size-4" />
          </IconAction>
        </>
      )}
      <MorphPopover open={moreOpen} onOpenChange={setMoreOpen}>
        <MorphPopoverTrigger>
          <button type="button" aria-label={a.more} className={ICON_BUTTON}>
            <MoreHorizontal className="size-4" />
          </button>
        </MorphPopoverTrigger>
        <MorphPopoverContent side="bottom" align="start" sideOffset={6} radius={14} className="w-52 p-1.5">
          <p className="px-2.5 pt-1.5 pb-1 text-xs text-muted-foreground">{time}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setMoreOpen(false);
              onRetry();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted disabled:opacity-50"
          >
            <RotateCcw className="size-4 text-muted-foreground" />
            {a.retry}
          </button>
        </MorphPopoverContent>
      </MorphPopover>
    </div>
  );
}

export function LaraMessage({ message, t, lang, busy, isLast, face, onRetry, onFeedback, onAnswer }) {
  if (message.guest) {
    return (
      <div className="flex items-start gap-2">
        {face}
        <LaraReply t={t} lang={lang} />
      </div>
    );
  }

  const working = message.status === "working";
  const steps = message.steps ?? [];
  const items = steps.map((s, i) => ({
    id: `${i}`,
    type: "step",
    label: (t.step[s.kind] ?? "{label}").replace("{label}", s.label),
    status: working && i === steps.length - 1 && !message.text ? "active" : "complete",
  }));
  const seconds = ((message.endedAt ?? Date.now()) - (message.startedAt ?? Date.now())) / 1000;
  const ask = message.ask;

  return (
    <div className="flex items-start gap-2">
      {face}
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
        {working && !message.text && steps.length === 0 && (
          <ReasoningText phrases={t.thinkingPhrases} variant="cascade" interval={1600} className="text-sm text-muted-foreground" />
        )}

        {steps.length > 0 && (
          <AgentActivity
            items={items}
            contentType="step"
            status={working && !message.text ? "working" : "complete"}
            duration={Math.max(1, Math.round(seconds))}
            collapseOnComplete
            maxHeight={160}
            labels={t.activity}
          />
        )}

        {message.text && <Markdown>{message.text}</Markdown>}

        {ask && (
          <div className="flex flex-col gap-2">
            <p className="text-[15px] font-medium">{ask.question}</p>
            <div className="flex flex-wrap gap-1.5">
              {ask.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={!!ask.answer || busy || !isLast}
                  onClick={() => onAnswer(option)}
                  className={cn(
                    "min-h-9 cursor-pointer rounded-full border border-border px-3.5 py-1.5 text-start text-sm transition-colors hover:border-primary/60 hover:bg-primary/10 disabled:cursor-default disabled:hover:border-border disabled:hover:bg-transparent",
                    ask.answer === option && "border-primary/60 bg-primary/10 text-foreground disabled:hover:border-primary/60 disabled:hover:bg-primary/10",
                    ask.answer && ask.answer !== option && "opacity-50"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            {!ask.answer && isLast && <p className="text-xs text-muted-foreground">{t.ask.other}</p>}
          </div>
        )}

        {message.error && <p className="text-sm text-destructive">{t.errors[message.error] ?? t.errors.failed}</p>}
        {message.status === "stopped" && <p className="text-sm text-muted-foreground">{t.actions.stopped}</p>}

        {message.sources?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">{t.sources}:</span>
            {message.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.title}
                className="max-w-44 truncate rounded-full bg-muted px-2.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                {(() => {
                  try {
                    return new URL(s.url).hostname.replace(/^www\./, "");
                  } catch {
                    return s.title;
                  }
                })()}
              </a>
            ))}
          </div>
        )}

        {!working && (
          <ActionBar message={message} t={t} lang={lang} busy={busy} onRetry={onRetry} onFeedback={onFeedback} />
        )}
      </div>
    </div>
  );
}
