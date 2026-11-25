"use client";

// Lara in the note editor. The slash menu (/lara, /summarise, /flashcards…) and the selection
// menu (Explain, Simplify, Summarise) call laraWrite(editor, action); this sits inside the editor
// and does the rest:
//   - /lara opens a small box at the cursor to ask her anything (Enter sends, Esc closes)
//   - while she writes, a chip at that spot says so, with Stop
//   - what she writes goes into the note there (after the selection, for the selection actions),
//     as ordinary note content you can edit, undo or delete
// She writes from the note itself (/api/lara/write); her chat, with web search, is for the rest.

import { useEffect, useRef, useState } from "react";
import { gooeyToast } from "goey-toast";
import { Loader2, Square, X } from "lucide-react";

const LARA_WRITE = "oneg:lara-write";

/** Ask Lara to write into this editor: action is ask | summarise | questions | flashcards | continue | explain | simplify | recap. */
export function laraWrite(editor, action) {
  window.dispatchEvent(new CustomEvent(LARA_WRITE, { detail: { editor, action } }));
}

const ERRORS = {
  not_configured: "Lara isn’t connected yet (no API key on the server).",
  too_many: "Lara’s had a lot of requests. Try again in a minute.",
  refused: "Lara can’t help with that one.",
  empty_note: "Write a little first, then ask Lara.",
  failed: "Lara couldn’t write that. Try again.",
};

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

export function LaraWriter({ editor }) {
  // { action, at, top, left, selection } — the box (ask) or the chip (writing)
  const [ask, setAsk] = useState(null);
  const [busy, setBusy] = useState(null);
  const [question, setQuestion] = useState("");
  const abort = useRef(null);
  const input = useRef(null);

  // where on screen a position in the note is
  const spot = (pos) => {
    try {
      const c = editor.view.coordsAtPos(pos);
      return { top: c.bottom + 6, left: c.left };
    } catch {
      return { top: 120, left: 120 };
    }
  };

  const write = async ({ action, at, prompt, selection }) => {
    const controller = new AbortController();
    abort.current = controller;
    setBusy({ action, ...spot(at) });
    try {
      const res = await fetch("/api/lara/write", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          action,
          prompt,
          selection,
          note: editor.getText({ blockSeparator: "\n" }),
          lang: document.documentElement.lang || "en",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.html) throw new Error(data.error || "failed");
      if (editor.isDestroyed) return;
      // into the note at that spot, as ordinary content
      editor.chain().focus().insertContentAt(Math.min(at, editor.state.doc.content.size), data.html).run();
      if (data.cut) gooeyToast("Lara stopped early — that was a long one.");
    } catch (error) {
      if (controller.signal.aborted) return;
      gooeyToast.error(ERRORS[error.message] ?? ERRORS.failed);
    } finally {
      if (abort.current === controller) abort.current = null;
      setBusy(null);
    }
  };

  useEffect(() => {
    if (!editor) return;
    const onWrite = (e) => {
      if (e.detail?.editor !== editor || abort.current) return;
      const { action } = e.detail;
      const { state } = editor;
      const { from, to, $to } = state.selection;
      if (action === "ask") {
        setQuestion("");
        setAsk({ at: from, ...spot(from) });
        return;
      }
      if (["explain", "simplify", "recap"].includes(action)) {
        const selection = state.doc.textBetween(from, to, "\n");
        // after the block the selection ends in, so the original stays as it was
        const after = $to.depth > 0 ? $to.after($to.depth) : to;
        write({ action, at: after, selection });
        return;
      }
      write({ action, at: from });
    };
    window.addEventListener(LARA_WRITE, onWrite);
    return () => window.removeEventListener(LARA_WRITE, onWrite);
    // spot and write read the editor at call time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    if (ask) requestAnimationFrame(() => input.current?.focus());
  }, [ask]);

  const send = () => {
    const prompt = question.trim();
    if (!prompt || !ask) return;
    const at = ask.at;
    setAsk(null);
    write({ action: "ask", at, prompt });
  };

  return (
    <>
      {ask && (
        <div
          className="fixed z-50 flex w-[min(28rem,calc(100vw-2rem))] items-center gap-2 rounded-xl border border-border bg-popover p-1.5 ps-3 text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
          style={{ top: ask.top, left: Math.min(ask.left, window.innerWidth - 460) }}
        >
          <LaraFace />
          <input
            ref={input}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setAsk(null);
                editor.commands.focus();
              }
            }}
            placeholder="Ask Lara to write something into your note…"
            aria-label="Ask Lara"
            className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => {
              setAsk(null);
              editor.commands.focus();
            }}
            aria-label="Close"
            className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {busy && (
        <div
          role="status"
          className="fixed z-50 flex items-center gap-2 rounded-full border border-border bg-popover py-1 ps-2 pe-1 text-sm text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
          style={{ top: busy.top, left: Math.min(busy.left, window.innerWidth - 220) }}
        >
          <LaraFace />
          <span className="text-muted-foreground">Lara is writing…</span>
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          <button
            type="button"
            onClick={() => abort.current?.abort()}
            aria-label="Stop"
            title="Stop"
            className="grid size-6 cursor-pointer place-items-center rounded-full transition-colors hover:bg-muted"
          >
            <Square className="size-3 fill-current" />
          </button>
        </div>
      )}
    </>
  );
}
