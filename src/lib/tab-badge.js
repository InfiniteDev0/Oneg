"use client";

// Barista's tab badge (features/notifications/tab-badge.ts), in JavaScript: the
// browser tab says there's something waiting, as ClickUp's does — "(3) Oneg" in
// the title, and a red dot on the icon — while the bell has unread notifications.

import { useEffect } from "react";

const COUNT_PREFIX = /^\(\d+\+?\)\s*/;
// our dotted icon's tag, and the mark on the page's own while it's set aside
const OURS = "data-tab-badge";
const SET_ASIDE = "data-tab-badge-rel";

function applyTitle(count) {
  const base = document.title.replace(COUNT_PREFIX, "");
  const next = count > 0 ? `(${count > 99 ? "99+" : count}) ${base}` : base;
  if (document.title !== next) document.title = next;
}

// the app's icon with a red dot in its top-right corner, the icon cut away in a
// thin ring round it so the dot floats with a gap
async function dottedIcon(href) {
  const image = new Image();
  image.src = href;
  try {
    await image.decode();
  } catch {
    return null;
  }
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(image, 0, 0, size, size);
  const [x, y] = [size - 22, 22];
  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  context.arc(x, y, 26, 0, Math.PI * 2);
  context.fill();
  context.globalCompositeOperation = "source-over";
  context.beginPath();
  context.arc(x, y, 18, 0, Math.PI * 2);
  context.fillStyle = "#ef4444";
  context.fill();
  return canvas.toDataURL("image/png");
}

/** Keeps the tab's title and icon saying how many notifications are unread. */
export function useTabBadge(count, enabled = true) {
  // the count in front of the title — and again whenever a page sets its own
  useEffect(() => {
    if (!enabled) return;
    const observer = new MutationObserver(() => {
      observer.disconnect();
      applyTitle(count);
      watch();
    });
    const watch = () => observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    applyTitle(count);
    watch();
    return () => {
      observer.disconnect();
      applyTitle(0);
    };
  }, [count, enabled]);

  // the red dot on the icon; Next owns the page's own icon tag and puts it back,
  // so that one is set aside and ours goes last in the head, kept there by a watch
  useEffect(() => {
    if (!enabled || count === 0) return;
    const first =
      document.querySelector(`link[rel~="icon"][type="image/svg+xml"]:not([${OURS}])`) ?? document.querySelector(`link[rel~="icon"]:not([${OURS}])`);
    if (!first) return;
    let live = true;
    let observer = null;

    dottedIcon(first.href).then((dotted) => {
      if (!live || !dotted) return;
      const apply = () => {
        for (const link of document.querySelectorAll(`link[rel~="icon"]:not([${OURS}])`)) {
          link.setAttribute(SET_ASIDE, link.getAttribute("rel") ?? "icon");
          link.setAttribute("rel", "x-icon-set-aside");
        }
        let ours = document.head.querySelector(`link[${OURS}]`);
        if (!ours) {
          ours = document.createElement("link");
          ours.setAttribute(OURS, "");
          ours.rel = "icon";
          ours.type = "image/png";
          document.head.appendChild(ours);
        }
        if (ours.href !== dotted) ours.href = dotted;
      };
      apply();
      const watch = () => observer?.observe(document.head, { subtree: true, childList: true, attributes: true, attributeFilter: ["rel"] });
      observer = new MutationObserver(() => {
        if (document.querySelector(`link[rel~="icon"]:not([${OURS}])`) || !document.head.querySelector(`link[${OURS}]`)) {
          observer?.disconnect();
          apply();
          watch();
        }
      });
      watch();
    });

    return () => {
      live = false;
      observer?.disconnect();
      document.head.querySelector(`link[${OURS}]`)?.remove();
      for (const link of document.querySelectorAll(`link[${SET_ASIDE}]`)) {
        link.setAttribute("rel", link.getAttribute(SET_ASIDE) ?? "icon");
        link.removeAttribute(SET_ASIDE);
      }
    };
  }, [count, enabled]);
}
