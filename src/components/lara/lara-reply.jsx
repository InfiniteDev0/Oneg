"use client";

// Lara's reply to someone who isn't signed in. First beUI's Agent Activity
// shows her working through three steps (shimmering "Thinking…", then each step
// ticking off), folds into "Thought for 3s", and then her message fades in:
// who she is, that she's noted the question, and underlined links to create an
// account or log in to carry on. No medical answer is given before sign-in.

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AgentActivity } from "@/components/agents/agent-activity";
import { EASE_OUT } from "@/lib/ease";

// when each step appears, when the last one ticks, when the run is done (ms)
const STEP_AT = [0, 800, 1600];
const SETTLE_AT = 2400;
const DONE_AT = 2900;

// Puts links into a translated sentence like "{signup} or {login} so we can…",
// so each language keeps its own word order.
function withLinks(template, links) {
  return template.split(/(\{\w+\})/g).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1];
    return key && links[key] ? <span key={i}>{links[key]}</span> : part;
  });
}

const LINK = "font-medium text-primary underline underline-offset-4 hover:decoration-2";

export function LaraReply({ t, lang }) {
  const reduce = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(reduce ? STEP_AT.length : 1);
  const [settled, setSettled] = useState(reduce);
  const [complete, setComplete] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    const timers = [
      ...STEP_AT.slice(1).map((at, i) => window.setTimeout(() => setVisible(i + 2), at)),
      window.setTimeout(() => setSettled(true), SETTLE_AT),
      window.setTimeout(() => setComplete(true), DONE_AT),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [reduce]);

  const items = t.steps.slice(0, visible).map((label, i) => ({
    id: `step-${i}`,
    type: "step",
    label,
    status: settled || i < visible - 1 ? "complete" : "active",
  }));

  const g = t.guest;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <AgentActivity
        items={items}
        contentType="step"
        status={complete ? "complete" : "working"}
        duration={DONE_AT / 1000}
        collapseOnComplete={!reduce}
        maxHeight={160}
        labels={t.activity}
      />

      <AnimatePresence>
        {complete && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="space-y-2 text-[15px] leading-relaxed text-foreground/85"
          >
            <p>{g.greeting}</p>
            <p>
              {g.noted}{" "}
              {withLinks(g.cta, {
                signup: (
                  <Link href={`/${lang}/auth?mode=signup`} className={LINK}>
                    {g.signup}
                  </Link>
                ),
                login: (
                  <Link href={`/${lang}/auth`} className={LINK}>
                    {g.login}
                  </Link>
                ),
              })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
