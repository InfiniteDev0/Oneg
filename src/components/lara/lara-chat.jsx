"use client";

/* Lara's panel, opened from Lara's face. Built from the Milo project's chat
   (milo-chat/index.jsx), laid out as Notion's AI chat: a header, Lara and
   "How can I help you today?", a few things to start with, and a box to type
   in. Lara can't answer yet: what you send is shown, she "thinks" (beUI's
   Agent Activity), then asks you to create an account or log in to carry on.
   Oneg changes: health starters that go to Oneg's pages, the text in four
   languages, and the rest of the app blurs behind the panel while it's open. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { BookOpen, CalendarPlus, ChevronsRight, MessageSquarePlus, Stethoscope, UserSearch } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EyeTracker } from "./eye-tracker";
import LaraButton from "./lara-button";
import { Composer } from "./composer";
import { LaraReply } from "./lara-reply";

const HEADER_ICON =
  "flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

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

export default function LaraChat({ label, t, lang }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  // the "Ask Lara" box takes the focus when the panel opens, so you can type straight away
  const inputRef = useRef(null);
  const router = useRouter();
  const to = (path) => `/${lang}${path}`;

  // Ctrl+J (⌘J on a Mac) shows and hides it from anywhere, as Milo's and Notion's
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close first, so the page a starter opens takes the focus
  const then = (path) => () => {
    setOpen(false);
    window.setTimeout(() => router.push(to(path)), 120);
  };

  const STARTERS = [
    { icon: Stethoscope, label: t.starters.symptoms, path: "/symptom-check" },
    { icon: UserSearch, label: t.starters.findDoctor, path: "/doctors" },
    { icon: CalendarPlus, label: t.starters.book, path: "/consultations" },
    { icon: BookOpen, label: t.starters.library, path: "/library" },
  ];

  // Nobody can be signed in yet, so every question gets Lara's signed-out reply
  const send = (text) =>
    setMessages((m) => [...m, { from: "you", text, id: `${m.length}-you` }, { from: "lara", id: `${m.length}-lara` }]);

  return (
    <>
      <LaraButton label={label} open={open} onOpen={() => setOpen(true)} />

      {/* modal: the rest of the app blurs behind it, and a click there puts it away */}
      <Sheet
        side="right"
        open={open}
        onOpenChange={setOpen}
        initialFocus={inputRef}
        className="border border-border bg-white dark:bg-card"
      >
        <DialogPrimitive.Title className="sr-only">Lara</DialogPrimitive.Title>

        <div className="flex h-12 shrink-0 items-center gap-2 px-3">
          <span className="flex-1 truncate text-[15px] font-medium">{t.title}</span>
          <TooltipProvider delay={300}>
            <HeaderButton label={t.newChat} render={<button type="button" onClick={() => setMessages([])} />}>
              <MessageSquarePlus className="size-[18px]" />
            </HeaderButton>
            <HeaderButton label={t.hide} keys="Ctrl+J" render={<DialogPrimitive.Close />}>
              <ChevronsRight className="size-[18px] rtl:rotate-180" />
            </HeaderButton>
          </TooltipProvider>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
          {messages.length === 0 ? (
            // pushed to the bottom, just above the box, as Notion's
            <div className="mt-auto flex flex-col gap-1 pb-2">
              <Face size={64} className="mb-3" />
              <h2 className="mb-2 text-lg font-semibold">{t.heading}</h2>
              {STARTERS.map(({ icon: Icon, label: starter, path }) => (
                <button
                  key={path}
                  type="button"
                  onClick={then(path)}
                  className="-mx-2.5 flex h-10 cursor-pointer items-center gap-3 rounded-[10px] px-2.5 text-start text-[15px] outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
                >
                  <Icon className="size-[18px] shrink-0 text-muted-foreground" />
                  {starter}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-auto flex flex-col gap-3 py-3">
              {messages.map((m) =>
                m.from === "you" ? (
                  <p key={m.id} className="ms-auto max-w-[85%] rounded-2xl bg-muted px-3.5 py-2 text-[15px] whitespace-pre-wrap">
                    {m.text}
                  </p>
                ) : (
                  <div key={m.id} className="flex items-start gap-2">
                    <Face size={24} className="rounded-md" />
                    <LaraReply t={t} lang={lang} />
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <Composer onSend={send} t={t} inputRef={inputRef} />
      </Sheet>
    </>
  );
}
