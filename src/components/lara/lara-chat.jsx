"use client";

// Lara's panel, opened from Lara's face (or Ctrl+J). Laid out like Notion's AI
// chat: a header with the chat's name (click it for previous chats), New chat,
// "…" (copy link, and Sidebar / Floating / Full screen), and Hide. Then the
// conversation, and beUI's Prompt Input with Milo's glowing border, where "+"
// adds a photo or a PDF. Lara is Claude, through /api/lara (see that route).
// In Sidebar and Full screen the rest of the app blurs behind the panel; the
// Floating window leaves the page usable. Inside the signed-in app, Full screen
// is ClickUp Brain's: Lara takes the main panel itself (the app hands her that
// spot as `inlineTarget`), with the box, suggestions under it and recent chats.
// Something can also hand her a place of its own (OPEN_LARA with `dock`): the
// search page does, and she takes its right pane, at that size, until she's put
// away (then `onClose` lets it show itself again) or UNDOCK_LARA sends her off.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  BookOpen,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronsRight,
  FileText,
  ImagePlus,
  Link2,
  Maximize2,
  MessageCircle,
  MessageSquarePlus,
  MoreHorizontal,
  PanelRight,
  PictureInPicture2,
  Stethoscope,
  Trash2,
  UserSearch,
  X,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { PromptInput } from "@/components/agents/prompt-input";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { cn } from "@/lib/utils";
import { EyeTracker } from "./eye-tracker";
import LaraButton from "./lara-button";
import { LaraMessage, UserMessage } from "./lara-messages";
import { useLaraChat } from "./use-lara-chat";

const HEADER_ICON =
  "flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
const MENU_ROW =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted";

const VIEW_KEY = "oneg.lara.view";
const VIEWS = { sidebar: "right", floating: "corner", fullscreen: "full" };

const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_PDF = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// a header button with its name, and its keys when it has some, as Notion's
function HeaderButton({ label, keys, render, children }) {
  return (
    <Tooltip>
      <TooltipTrigger render={render} aria-label={label} className={HEADER_ICON}>
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className="flex items-center gap-2">
        {label}
        {keys && <span className="opacity-60">{keys}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

// Lara's face on her black chip (.oneg-lara-face in globals.css); the eyes follow the pointer
function Face({ size, className }) {
  return (
    <span className={cn("oneg-lara-face", className)} style={{ width: size, height: size }}>
      <EyeTracker size={size} follow={25} eyeScale={1.5} within="body" decorative label="Lara" />
    </span>
  );
}

// "5m", "3h", "61d": how long ago a chat was last used, as Notion shows it
function ago(time) {
  const minutes = Math.max(1, Math.round((Date.now() - time) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`;
}

function ChatList({ history, activeId, t, onOpen, onDelete, className }) {
  if (!history.length) return <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">{t.history.empty}</p>;
  return (
    <ul className={cn("flex flex-col", className)}>
      {history.map((c) => (
        <li key={c.id} className="group/row relative">
          <button type="button" onClick={() => onOpen(c.id)} className={cn(MENU_ROW, "pe-16", c.id === activeId && "bg-muted")}>
            <MessageCircle className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{c.title || t.history.untitled}</span>
          </button>
          <span className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground group-hover/row:opacity-0">
            {ago(c.updatedAt)}
          </span>
          <button
            type="button"
            aria-label={t.history.delete}
            onClick={() => onDelete(c.id)}
            className="absolute end-1.5 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground focus-visible:opacity-100 group-hover/row:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

// Anything can open Lara (the app's "Ask Lara" pill, the AI rail button, search):
// window.dispatchEvent(new CustomEvent(OPEN_LARA, { detail: { ask: "optional question" } }))
export const OPEN_LARA = "oneg:open-lara";
// With { detail: { dock: element, onClose } } she opens inside that element.
// This puts a docked Lara away (its place is going):
export const UNDOCK_LARA = "oneg:undock-lara";

export default function LaraChat({ label, t, lang, button = true, inlineTarget = null, onFullChange }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("sidebar");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [attachError, setAttachError] = useState(null);
  const composerRef = useRef(null);
  const fileRef = useRef(null);
  const scrollRef = useRef(null);
  const lara = useLaraChat({ lang });
  const { chat, history, busy } = lara;
  // a place someone handed her (the search page's right pane), and what to tell them when she leaves it
  const [dock, setDock] = useState(null);
  const dockClose = useRef(null);
  const docked = !!dock;
  const full = view === "fullscreen" && !docked;
  // Full screen in the app: in the main panel, not over the whole window
  const inline = full && !!inlineTarget;
  // in a place of the page (not a sheet over it)
  const inPanel = inline || docked;

  // Full screen in the app lives in the address (?lara), so a refresh brings
  // her back; the app hears of it too (its sidebar lights AI)
  const urlRead = useRef(false);
  useEffect(() => {
    if (!inlineTarget) return;
    if (!urlRead.current) {
      urlRead.current = true;
      if (new URLSearchParams(window.location.search).has("lara")) {
        setView("fullscreen");
        setOpen(true);
        return;
      }
    }
    const url = new URL(window.location.href);
    const want = open && inline;
    if (url.searchParams.has("lara") === want) return;
    if (want) url.searchParams.set("lara", "");
    else url.searchParams.delete("lara");
    window.history.replaceState(null, "", `${url.pathname}${url.search.replace(/=(?=&|$)/g, "")}${url.hash}`);
  }, [open, inline, inlineTarget]);
  useEffect(() => {
    onFullChange?.(open && inline);
  }, [open, inline, onFullChange]);
  // leave the dock, telling whoever lent it
  const undock = () => {
    const tell = dockClose.current;
    dockClose.current = null;
    setDock(null);
    tell?.();
  };

  // remember the chosen view; open straight away when the link ends in #lara
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (VIEWS[saved]) setView(saved);
    } catch {
      // storage blocked: use the sidebar
    }
    if (window.location.hash === "#lara") setOpen(true);
  }, []);

  const chooseView = (next) => {
    setView(next);
    setMoreOpen(false);
    // docked, picking a view takes her out to it
    if (dock) undock();
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // storage blocked: the view just isn't remembered
    }
  };

  // Ctrl+J shows and hides the panel; Ctrl+Shift+; starts a new chat (as Notion's)
  const newChat = lara.newChat;
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      if (!e.shiftKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.shiftKey && e.code === "Semicolon") {
        e.preventDefault();
        newChat();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [newChat]);

  // Opened from elsewhere, maybe with a question to ask straight away
  const sendRef = useRef(lara.send);
  useEffect(() => {
    sendRef.current = lara.send;
  });
  useEffect(() => {
    const onOpen = (e) => {
      if (e.detail?.dock) {
        setDock(e.detail.dock);
        dockClose.current = e.detail.onClose ?? null;
      } else {
        // opened the usual way: out of any dock
        undock();
      }
      setOpen(true);
      const ask = e.detail?.ask?.trim();
      if (ask) window.setTimeout(() => sendRef.current(ask), 0);
    };
    // her place is going: put away, no one to tell
    const onUndock = () => {
      dockClose.current = null;
      setDock(null);
      setOpen(false);
    };
    window.addEventListener(OPEN_LARA, onOpen);
    window.addEventListener(UNDOCK_LARA, onUndock);
    return () => {
      window.removeEventListener(OPEN_LARA, onOpen);
      window.removeEventListener(UNDOCK_LARA, onUndock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // put away while docked (✕, Esc, Ctrl+J): the dock's owner shows itself again
  useEffect(() => {
    if (!open && dock) undock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dock]);

  // In the panel: going to another page puts her away, as does Escape (when no
  // menu of hers is open); opened, the box takes the typing
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (inPanel) setOpen(false);
  }, [pathname, inPanel]);
  useEffect(() => {
    if (!inPanel || !open) return;
    composerRef.current?.querySelector("textarea")?.focus();
    const onKey = (e) => {
      if (e.key !== "Escape" || e.defaultPrevented || document.querySelector("[data-morph-popover-portal]")) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inPanel, open]);

  // keep the newest words in view while Lara writes
  const lastText = chat?.ui.at(-1)?.text;
  const count = chat?.ui.length;
  useEffect(() => {
    const el = scrollRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight;
  }, [lastText, count]);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat?.id, open]);

  const STARTERS = [
    { key: "symptoms", icon: Stethoscope, label: t.starters.symptoms },
    { key: "findDoctor", icon: UserSearch, label: t.starters.findDoctor },
    { key: "book", icon: CalendarPlus, label: t.starters.book },
    { key: "library", icon: BookOpen, label: t.starters.library },
  ];

  // ── Photos and PDFs ──
  const pickFile = (kind) => {
    const input = fileRef.current;
    if (!input) return;
    input.accept = kind === "image" ? IMAGE_TYPES.join(",") : "application/pdf";
    input.click();
  };

  const onFiles = (files) => {
    setAttachError(null);
    for (const file of files) {
      const isImage = IMAGE_TYPES.includes(file.type);
      const isPdf = file.type === "application/pdf";
      if (!isImage && !isPdf) {
        setAttachError(t.attach.wrongType);
        continue;
      }
      if (file.size > (isImage ? MAX_IMAGE : MAX_PDF)) {
        setAttachError(t.attach.tooBig);
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        setAttachments((list) =>
          [
            ...list,
            {
              id: `${file.name}-${file.size}-${Date.now()}`,
              kind: isImage ? "image" : "document",
              name: file.name,
              mediaType: file.type,
              data: dataUrl.slice(dataUrl.indexOf(",") + 1),
              preview: isImage ? dataUrl : null,
            },
          ].slice(0, 4)
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = (text) => {
    lara.send(text, lara.pendingAsk ? [] : attachments);
    setAttachments([]);
    setAttachError(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#lara`);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1500);
    } catch {
      // clipboard blocked
    }
  };

  const empty = !chat || chat.ui.length === 0;

  const composer = (
    <div ref={composerRef} className={cn("shrink-0 px-3 pt-1 pb-2", full && "mx-auto w-full max-w-3xl px-4")}>
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {attachments.map((a) => (
            <span key={a.id} className="relative">
              {a.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.preview} alt={a.name} className="size-14 rounded-xl object-cover" />
              ) : (
                <span className="flex h-14 max-w-44 items-center gap-1.5 rounded-xl bg-muted px-3 text-xs text-muted-foreground">
                  <FileText className="size-4 shrink-0" />
                  <span className="truncate">{a.name}</span>
                </span>
              )}
              <button
                type="button"
                aria-label={t.attach.remove}
                onClick={() => setAttachments((list) => list.filter((x) => x.id !== a.id))}
                className="absolute -end-1.5 -top-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-foreground text-background"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {attachError && <p className="mb-2 text-xs text-destructive">{attachError}</p>}

      <div className="relative rounded-2xl">
        {/* Milo's glowing border (Aceternity), always on, turning to face the pointer */}
        <GlowingEffect variant="lara" spread={40} glow disabled={false} alwaysOn proximity={64} inactiveZone={0.01} borderWidth={2} />
        <PromptInput
          onSubmit={submit}
          loading={busy}
          onStop={lara.stop}
          minRows={full ? 3 : 2}
          actions={
            lara.pendingAsk
              ? []
              : [
                  { value: "image", label: t.attach.image, description: t.attach.imageDesc, icon: <ImagePlus /> },
                  { value: "document", label: t.attach.file, description: t.attach.fileDesc, icon: <FileText /> },
                ]
          }
          onAction={pickFile}
          labels={{ placeholder: t.placeholder, label: t.placeholder, addToPrompt: t.attach.add, send: t.send, stop: t.actions.stop }}
          className="bg-background/40"
        />
      </div>
      <input
        ref={fileRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />
      <p className="px-2 pt-2 text-center text-[11px] leading-4 text-muted-foreground">{t.disclaimer}</p>
    </div>
  );

  // The panel itself: header, then the conversation (or, before you've asked
  // anything, Lara's welcome) and the box. In the Sheet, or in the main panel.
  const panel = (
      <>
        {/* ── Header ── */}
        <div className="flex h-12 shrink-0 items-center gap-1 px-3">
          <MorphPopover open={historyOpen} onOpenChange={setHistoryOpen}>
            <MorphPopoverTrigger>
              <button type="button" className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:bg-muted">
                <span className="truncate text-[15px] font-medium">{chat?.title || t.title}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </MorphPopoverTrigger>
            <MorphPopoverContent side="bottom" align="start" sideOffset={6} radius={14} className="w-80 p-1.5">
              <p className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">{t.history.title}</p>
              <ChatList
                history={history}
                activeId={chat?.id}
                t={t}
                className="max-h-80 overflow-y-auto"
                onOpen={(id) => {
                  lara.openChat(id);
                  setHistoryOpen(false);
                }}
                onDelete={lara.deleteChat}
              />
            </MorphPopoverContent>
          </MorphPopover>

          <span className="flex-1" />

          <TooltipProvider delay={300}>
            <HeaderButton label={t.newChat} keys={t.newChatKeys} render={<button type="button" onClick={lara.newChat} />}>
              <MessageSquarePlus className="size-[18px]" />
            </HeaderButton>
          </TooltipProvider>

          <MorphPopover open={moreOpen} onOpenChange={setMoreOpen}>
            <MorphPopoverTrigger>
              <button type="button" aria-label={t.actions.more} className={HEADER_ICON}>
                <MoreHorizontal className="size-[18px]" />
              </button>
            </MorphPopoverTrigger>
            <MorphPopoverContent side="bottom" align="end" sideOffset={6} radius={14} className="w-56 p-1.5">
              <button type="button" onClick={copyLink} className={MENU_ROW}>
                {linkCopied ? <Check className="size-4 text-muted-foreground" /> : <Link2 className="size-4 text-muted-foreground" />}
                {linkCopied ? t.menu.linkCopied : t.menu.copyLink}
              </button>
              <div className="mx-2.5 my-1 h-px bg-border" />
              {[
                { key: "sidebar", icon: PanelRight, label: t.menu.sidebar },
                { key: "floating", icon: PictureInPicture2, label: t.menu.floating },
                { key: "fullscreen", icon: Maximize2, label: t.menu.fullscreen },
              ].map(({ key, icon: Icon, label: name }) => (
                <button key={key} type="button" onClick={() => chooseView(key)} className={MENU_ROW}>
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="flex-1">{name}</span>
                  {view === key && <Check className="size-4" />}
                </button>
              ))}
            </MorphPopoverContent>
          </MorphPopover>

          <TooltipProvider delay={300}>
            <HeaderButton
              label={t.hide}
              keys="Ctrl+J"
              render={inPanel ? <button type="button" onClick={() => setOpen(false)} /> : <DialogPrimitive.Close />}
            >
              {inPanel ? <X className="size-[18px]" /> : <ChevronsRight className="size-[18px] rtl:rotate-180" />}
            </HeaderButton>
          </TooltipProvider>
        </div>

        {/* ── Conversation ── */}
        {empty && full ? (
          // Full screen, nothing asked yet: Lara, the box, and your recent chats
          <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 pt-[12vh] pb-6">
            <Face size={72} className="mb-4 rounded-[18px]" />
            <h2 className="mb-6 text-2xl font-semibold">{t.heading}</h2>
            <div className="w-full max-w-3xl">{composer}</div>
            <div className="mt-4 grid w-full max-w-3xl grid-cols-2 gap-2.5 px-4 sm:grid-cols-4">
              {STARTERS.map(({ key, icon: Icon, label: starter }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => submit(starter)}
                  className="flex min-w-0 cursor-pointer flex-col items-start gap-1 rounded-xl border border-border bg-foreground/[0.03] p-3.5 text-start outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="mb-1.5 size-[18px] shrink-0 text-muted-foreground" />
                  <span className="w-full truncate text-sm font-semibold">{starter}</span>
                  <span className="w-full truncate text-sm text-muted-foreground">{t.starterHints?.[key]}</span>
                </button>
              ))}
            </div>
            {history.length > 0 && (
              <div className="mt-10 w-full max-w-3xl px-1.5">
                <p className="mb-2 px-2.5 text-sm text-muted-foreground">{t.history.recent}</p>
                <ChatList history={history} activeId={chat?.id} t={t} onOpen={lara.openChat} onDelete={lara.deleteChat} />
              </div>
            )}
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
              {empty ? (
                // pushed to the bottom, just above the box, as Notion's
                <div className="mt-auto flex flex-col gap-1 pb-2">
                  <Face size={64} className="mb-3" />
                  <h2 className="mb-2 text-lg font-semibold">{t.heading}</h2>
                  {STARTERS.map(({ icon: Icon, label: starter }) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => submit(starter)}
                      className="-mx-2.5 flex h-10 cursor-pointer items-center gap-3 rounded-[10px] px-2.5 text-start text-[15px] outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
                    >
                      <Icon className="size-[18px] shrink-0 text-muted-foreground" />
                      {starter}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={cn("mt-auto flex flex-col gap-4 py-3", full && "mx-auto w-full max-w-3xl")}>
                  <TooltipProvider delay={400}>
                    {chat.ui.map((m, i) =>
                      m.from === "you" ? (
                        <UserMessage key={m.id} message={m} t={t} busy={busy} onEdit={(text) => lara.edit(m.id, text)} />
                      ) : (
                        <LaraMessage
                          key={m.id}
                          message={m}
                          t={t}
                          lang={lang}
                          busy={busy}
                          isLast={i === chat.ui.length - 1}
                          face={<Face size={24} className="mt-0.5 rounded-md" />}
                          onRetry={() => lara.retry(m.id)}
                          onFeedback={(value) => lara.setFeedback(m.id, value)}
                          onAnswer={(option) => submit(option)}
                        />
                      )
                    )}
                  </TooltipProvider>
                </div>
              )}
            </div>
            {composer}
          </>
        )}
      </>
  );

  return (
    <>
      {button && <LaraButton label={label} open={open} onOpen={() => setOpen(true)} />}

      {docked ? (
        open &&
        createPortal(
          <section aria-label="Lara" className="flex min-h-0 flex-1 flex-col duration-150 animate-in fade-in-0">
            {panel}
          </section>,
          dock
        )
      ) : inline ? (
        open &&
        createPortal(
          <section
            aria-label="Lara"
            className="flex size-full flex-col overflow-hidden rounded-lg border border-border bg-canvas duration-150 animate-in fade-in-0"
          >
            {panel}
          </section>,
          inlineTarget
        )
      ) : (
      <Sheet
        side={VIEWS[view]}
        floating={view === "floating"}
        open={open}
        onOpenChange={(next, details) => {
          // a click in one of the panel's own menus (drawn outside it) isn't a click outside
          if (!next && details?.event?.target?.closest?.("[data-morph-popover-portal]")) {
            details.cancel?.();
            return;
          }
          setOpen(next);
        }}
        initialFocus={() => composerRef.current?.querySelector("textarea") ?? true}
        className="border border-border bg-white dark:bg-card"
      >
        <DialogPrimitive.Title className="sr-only">Lara</DialogPrimitive.Title>
        {panel}
      </Sheet>
      )}
    </>
  );
}
