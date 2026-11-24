"use client";

// Themes, as Barista's (components/admin/ThemesDialog.tsx, itself Milo's):
// Appearance (Light, Dark or Auto) as little pictures of the app, then the theme
// colour, which paints the strong buttons and the sidebar. Both stay on this device.

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Check } from "lucide-react";
import { THEME_COLOURS, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const HEAD = "text-sm font-medium text-muted-foreground";

// Barista's ThemePreview (from Manasik): a rail of squares, a panel of lines
function Picture({ dark, className }) {
  const page = dark ? "bg-neutral-900" : "bg-neutral-100";
  const panel = dark ? "bg-black" : "bg-white";
  const ink = dark ? "bg-neutral-100" : "bg-neutral-900";
  const muted = dark ? "bg-neutral-600" : "bg-neutral-300";
  return (
    <span className={cn("flex h-20 w-full gap-1.5 overflow-hidden p-2", page, className)}>
      <span className="flex flex-col gap-1.5 pt-1">
        <span className={cn("size-3 rounded", ink)} />
        <span className={cn("size-3 rounded", muted)} />
        <span className={cn("size-3 rounded", muted)} />
      </span>
      <span className={cn("flex flex-1 flex-col gap-1.5 rounded-md p-2", panel)}>
        <span className={cn("h-1.5 w-10 rounded-full", muted)} />
        <span className="flex gap-1.5">
          <span className={cn("h-1.5 w-8 rounded-full", muted)} />
          <span className={cn("h-1.5 w-6 rounded-full", ink)} />
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", ink)} />
          <span className={cn("h-1.5 w-5 rounded-full", muted)} />
          <span className={cn("h-1.5 w-5 rounded-full", muted)} />
        </span>
      </span>
    </span>
  );
}

function ThemePreview({ theme }) {
  if (theme !== "system") return <Picture dark={theme === "dark"} />;
  return (
    <span className="relative block">
      <Picture />
      <Picture dark className="absolute inset-0 [clip-path:inset(0_0_0_50%)]" />
    </span>
  );
}

export function ThemesDialog({ open, onOpenChange, t }) {
  const { choice, setChoice, colour, setColour } = useTheme();
  const MODES = [
    { value: "light", label: t.light },
    { value: "dark", label: t.dark },
    { value: "system", label: t.auto },
  ];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        {/* Small, as Milo's, and no edge: the shadow lifts it. In dark, Milo's panel grey. */}
        <DialogPrimitive.Popup className="fixed start-1/2 top-1/2 z-50 flex w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl bg-white p-5 text-foreground shadow-2xl outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 rtl:translate-x-1/2 dark:bg-[oklch(0.222_0.004_84.4)]">
          <div className="flex flex-col gap-1">
            <DialogPrimitive.Title className="text-lg font-semibold">{t.title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">{t.description}</DialogPrimitive.Description>
          </div>

          <section className="flex flex-col gap-2.5">
            <h3 className={HEAD}>{t.appearance}</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {MODES.map((m) => {
                const on = choice === m.value;
                return (
                  <button key={m.value} type="button" onClick={() => setChoice(m.value)} aria-pressed={on} className="flex cursor-pointer flex-col items-center gap-2">
                    <span
                      className={cn(
                        "block w-full overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-background transition-shadow",
                        on ? "ring-foreground" : "ring-transparent"
                      )}
                    >
                      <ThemePreview theme={m.value} />
                    </span>
                    <span className={cn("text-sm", on ? "font-semibold" : "text-muted-foreground")}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <h3 className={HEAD}>{t.colour}</h3>
            <div className="grid grid-cols-3 gap-2">
              {THEME_COLOURS.map((c) => {
                const on = colour === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColour(c.id)}
                    aria-pressed={on}
                    className={cn(
                      // Filled, no edge: only the picked one is outlined
                      "flex h-10 cursor-pointer items-center gap-2.5 rounded-lg bg-foreground/5 px-3 text-sm ring-inset transition-colors",
                      on ? "font-medium ring-2 ring-foreground/70" : "text-foreground/75 hover:bg-foreground/8 hover:text-foreground"
                    )}
                  >
                    {/* Black is the app's own: dark in light mode, light in dark mode */}
                    <span
                      className={cn("flex size-4.5 shrink-0 items-center justify-center rounded-md", !c.hex && "bg-foreground")}
                      style={c.hex ? { background: c.hex } : undefined}
                    >
                      {on ? <Check className={cn("size-3", c.hex ? "text-white" : "text-background")} strokeWidth={3} /> : null}
                    </span>
                    {t.colours[c.id]}
                  </button>
                );
              })}
            </div>
          </section>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
