"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";

// NOTE: this image belongs to Intercom and is loaded from their servers.
// Replace it with Oneg's own artwork before launch.
const BANNER_IMAGE =
  "https://cdn.sanity.io/images/4bgok82s/monorepo-static-assets/39fa22b0eef6c2f9c1cb0bce0f9725e4fe7174d9-1170x102.webp";

// Closing: the text fades and lifts a little while the banner's height folds
// to zero, so the navbar glides up into its place instead of jumping.
export default function AnnouncementBar({ text, linkLabel, href, closeLabel }) {
  const [open, setOpen] = useState(true);
  const reduce = useReducedMotion() ?? false;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="banner"
          initial={false}
          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.35, ease: EASE_OUT }}
          className="overflow-hidden"
        >
          <motion.div
            exit={reduce ? undefined : { y: -6 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="relative flex min-h-9 items-center justify-center bg-[#e9ecee] bg-cover bg-center px-10 py-1.5 text-center text-sm leading-snug text-[#10232b]"
            style={{ backgroundImage: `url(${BANNER_IMAGE})` }}
          >
            <p>
              {text}{" "}
              <Link
                href={href}
                className="whitespace-nowrap underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                {linkLabel}
              </Link>
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-black/10"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
