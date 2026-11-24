"use client";

// Everything Lara's panel remembers: the chats, the one that's open, and the
// reply being streamed. Each chat keeps two lists:
//   api  the exact messages Claude's API sees (only ever added to, or cut back
//        to an earlier point for Retry and Edit, never changed in the middle)
//   ui   what the panel shows: your messages, and Lara's replies with their
//        steps, questions, sources and feedback
// Chats are saved in this browser (localStorage) until sign-in and Supabase
// exist. Photos and PDFs are not saved, only a note that one was shared.

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "oneg.lara.chats.v1";
const MAX_SAVED_CHATS = 30;
// Questions a signed-out person can ask in one chat before Lara asks them to sign up
export const GUEST_FREE_QUESTIONS = 10;

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
const emptyChat = () => ({ id: newId(), title: "", createdAt: Date.now(), updatedAt: Date.now(), api: [], ui: [] });

// What gets saved: attachments become a short note (they're too big for the browser's storage)
const SHARED_NOTE = {
  image: "[The person shared a photo here earlier. It is no longer available.]",
  document: "[The person shared a PDF document here earlier. It is no longer available.]",
};
function forStorage(chat) {
  const api = chat.api.map((m) =>
    Array.isArray(m.content) && m.role === "user"
      ? { ...m, content: m.content.map((b) => (b.type === "image" || b.type === "document" ? { type: "text", text: SHARED_NOTE[b.type] } : b)) }
      : m
  );
  const ui = chat.ui.map((m) =>
    m.attachments ? { ...m, attachments: m.attachments.map(({ kind, name }) => ({ kind, name })) } : m
  );
  return { ...chat, api, ui };
}

function loadChats() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((c) => c && c.id && Array.isArray(c.api) && Array.isArray(c.ui)) : [];
  } catch {
    return [];
  }
}

function saveChats(chats) {
  const keep = chats
    .filter((c) => c.ui.length > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_SAVED_CHATS)
    .map(forStorage);
  for (let n = keep.length; n >= 0; n--) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keep.slice(0, n)));
      return;
    } catch {
      // storage full: drop the oldest chat and try again
    }
  }
}

// The text of a message the person sent, with any photo or PDF in front of it
function userContent(text, attachments) {
  if (!attachments?.length) return text;
  return [
    ...attachments.map((a) =>
      a.kind === "image"
        ? { type: "image", source: { type: "base64", media_type: a.mediaType, data: a.data } }
        : { type: "document", source: { type: "base64", media_type: "application/pdf", data: a.data }, title: a.name }
    ),
    { type: "text", text },
  ];
}

export function useLaraChat({ lang, signedIn = false }) {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(null);
  const loaded = useRef(false);

  // Load saved chats once, after the page has rendered (localStorage is browser-only)
  useEffect(() => {
    const saved = loadChats();
    const first = emptyChat();
    setChats([first, ...saved]);
    setActiveId(first.id);
    loaded.current = true;
  }, []);

  // Save whenever a reply has finished (not on every streamed word)
  useEffect(() => {
    if (loaded.current && !busy) saveChats(chats);
  }, [chats, busy]);

  const active = chats.find((c) => c.id === activeId) ?? null;

  const updateChat = useCallback((id, change) => {
    setChats((list) => list.map((c) => (c.id === id ? { ...change(c), updatedAt: Date.now() } : c)));
  }, []);

  const updateMessage = useCallback(
    (chatId, msgId, change) =>
      updateChat(chatId, (c) => ({ ...c, ui: c.ui.map((m) => (m.id === msgId ? { ...m, ...change(m) } : m)) })),
    [updateChat]
  );

  // Ask Lara: stream her reply to the conversation `api` (which ends with the person's turn)
  const run = useCallback(
    async (chatId, api, laraId) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setBusy(true);
      const patch = (change) => updateMessage(chatId, laraId, change);

      try {
        const res = await fetch("/api/lara", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, messages: api }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line);
            if (event.type === "text") patch((m) => ({ text: (m.text ?? "") + event.text }));
            else if (event.type === "step") patch((m) => ({ steps: [...(m.steps ?? []), { kind: event.kind, label: event.label }] }));
            else if (event.type === "ask") patch(() => ({ ask: { id: event.id, question: event.question, options: event.options, pending: event.pending } }));
            else if (event.type === "sources") patch(() => ({ sources: event.items }));
            else if (event.type === "error") patch(() => ({ error: event.code }));
            else if (event.type === "turn") updateChat(chatId, (c) => ({ ...c, api: [...api, ...event.messages] }));
          }
        }
        patch((m) => ({ status: m.error ? "error" : "done", endedAt: Date.now() }));
      } catch (error) {
        if (controller.signal.aborted) {
          // Stopped: the reply so far stays on screen; Claude's history keeps only your message
          patch(() => ({ status: "stopped", endedAt: Date.now() }));
        } else {
          patch(() => ({ status: "error", error: navigator.onLine === false ? "offline" : "failed", endedAt: Date.now() }));
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setBusy(false);
      }
    },
    [lang, updateChat, updateMessage]
  );

  const laraMessage = (apiStart) => ({ id: newId(), from: "lara", status: "working", text: "", steps: [], startedAt: Date.now(), apiStart });

  // The question Lara is waiting on, if her last reply asked one
  const pendingAsk = (() => {
    const last = active?.ui.at(-1);
    return last?.from === "lara" && last.ask && !last.ask.answer ? last : null;
  })();

  const send = useCallback(
    (text, attachments = []) => {
      if (!active || busy) return;
      const chatId = active.id;
      const questions = active.ui.filter((m) => m.from === "you" && !m.isAnswer).length;

      // Her question is answered by whatever comes next, a tapped option or typed text
      if (pendingAsk) {
        const ask = pendingAsk.ask;
        const content = [...(ask.pending ?? []), { type: "tool_result", tool_use_id: ask.id, content: text }];
        const api = [...active.api, { role: "user", content }];
        const lara = laraMessage(api.length);
        updateChat(chatId, (c) => ({
          ...c,
          api,
          ui: [
            ...c.ui.map((m) => (m.id === pendingAsk.id ? { ...m, ask: { ...m.ask, answer: text } } : m)),
            { id: newId(), from: "you", text, isAnswer: true, apiIndex: api.length - 1, at: Date.now() },
            lara,
          ],
        }));
        run(chatId, api, lara.id);
        return;
      }

      const you = { id: newId(), from: "you", text, attachments, apiIndex: active.api.length, at: Date.now() };

      // Signed out and over the free limit: Lara's sign-up reply, no AI call
      if (!signedIn && questions >= GUEST_FREE_QUESTIONS) {
        updateChat(chatId, (c) => ({ ...c, ui: [...c.ui, you, { id: newId(), from: "lara", guest: true }] }));
        return;
      }

      const api = [...active.api, { role: "user", content: userContent(text, attachments) }];
      const lara = laraMessage(api.length);
      updateChat(chatId, (c) => ({
        ...c,
        title: c.title || text.slice(0, 60),
        api,
        ui: [...c.ui, you, lara],
      }));
      run(chatId, api, lara.id);
    },
    [active, busy, pendingAsk, run, signedIn, updateChat]
  );

  // Ask again from just before this reply (later messages are dropped)
  const retry = useCallback(
    (laraId) => {
      if (!active || busy) return;
      const index = active.ui.findIndex((m) => m.id === laraId);
      const old = active.ui[index];
      if (index < 0 || old.apiStart == null) return;
      const api = active.api.slice(0, old.apiStart);
      const lara = laraMessage(api.length);
      updateChat(active.id, (c) => ({ ...c, api, ui: [...c.ui.slice(0, index), lara] }));
      run(active.id, api, lara.id);
    },
    [active, busy, run, updateChat]
  );

  // Change one of your messages and ask again from there (later messages are dropped)
  const edit = useCallback(
    (youId, text) => {
      if (!active || busy) return;
      const index = active.ui.findIndex((m) => m.id === youId);
      const old = active.ui[index];
      if (index < 0 || old.isAnswer) return;
      const original = active.api[old.apiIndex]?.content;
      const kept = Array.isArray(original) ? original.filter((b) => b.type !== "text") : [];
      const content = kept.length ? [...kept, { type: "text", text }] : text;
      const api = [...active.api.slice(0, old.apiIndex), { role: "user", content }];
      const you = { ...old, id: newId(), text, at: Date.now() };
      const lara = laraMessage(api.length);
      updateChat(active.id, (c) => ({
        ...c,
        title: index === 0 ? text.slice(0, 60) : c.title,
        api,
        ui: [...c.ui.slice(0, index), you, lara],
      }));
      run(active.id, api, lara.id);
    },
    [active, busy, run, updateChat]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const setFeedback = useCallback(
    (laraId, value) => active && updateMessage(active.id, laraId, (m) => ({ feedback: m.feedback === value ? null : value })),
    [active, updateMessage]
  );

  const newChat = useCallback(() => {
    if (busy) abortRef.current?.abort();
    // reuse an empty chat instead of piling them up
    const empty = chats.find((c) => c.ui.length === 0);
    if (empty) return setActiveId(empty.id);
    const chat = emptyChat();
    setChats((list) => [chat, ...list]);
    setActiveId(chat.id);
  }, [busy, chats]);

  const openChat = useCallback(
    (id) => {
      if (busy) abortRef.current?.abort();
      setActiveId(id);
    },
    [busy]
  );

  const deleteChat = useCallback(
    (id) => {
      setChats((list) => {
        const rest = list.filter((c) => c.id !== id);
        if (id === activeId) {
          const next = rest.find((c) => c.ui.length === 0) ?? emptyChat();
          setActiveId(next.id);
          return rest.includes(next) ? rest : [next, ...rest];
        }
        return rest;
      });
    },
    [activeId]
  );

  const history = chats.filter((c) => c.ui.length > 0).sort((a, b) => b.updatedAt - a.updatedAt);

  return { chat: active, history, busy, pendingAsk, send, retry, edit, stop, setFeedback, newChat, openChat, deleteChat };
}
