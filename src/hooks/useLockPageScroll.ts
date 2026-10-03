"use client";

import { useEffect } from "react";

const SCROLLABLE_SELECTOR = "[data-scroll-lock-allow]";

function canScroll(el: HTMLElement, deltaY: number) {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  if (overflowY !== "auto" && overflowY !== "scroll" && overflowY !== "overlay") return false;
  if (el.scrollHeight <= el.clientHeight + 1) return false;
  if (deltaY < 0 && el.scrollTop > 0) return true;
  if (deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
  return false;
}

function wheelAllowed(target: EventTarget | null, deltaY: number) {
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== document.body && node !== document.documentElement) {
    // Allow-listed regions (and any truly scrollable ancestor) may consume the wheel.
    if (node.matches(SCROLLABLE_SELECTOR) || node.closest(SCROLLABLE_SELECTOR)) {
      const scroller =
        (node.matches(SCROLLABLE_SELECTOR) ? node : null) ||
        (node.closest(SCROLLABLE_SELECTOR) as HTMLElement | null);
      if (scroller && canScroll(scroller, deltaY)) return true;
      // Keep walking — e.g. nested preview copy inside the allow-list root.
    }
    if (canScroll(node, deltaY)) return true;
    node = node.parentElement;
  }
  return false;
}

/** Side-layout announcement: wheel on the media pane scrolls the copy column. */
function redirectMediaWheel(event: WheelEvent) {
  const target = event.target instanceof HTMLElement ? event.target : null;
  const media = target?.closest(".announcement-media");
  if (!media) return false;
  const sheet = media.closest(".announcement-sheet.is-side:not(.is-preview)");
  const copy = sheet?.querySelector<HTMLElement>(".announcement-copy");
  if (!copy || copy.scrollHeight <= copy.clientHeight + 1) return false;
  copy.scrollTop += event.deltaY;
  return true;
}

/**
 * Freeze the page behind a modal and keep wheel/touch scroll inside
 * allowed scroll regions (or block it entirely when none apply).
 */
export function useLockPageScroll(locked: boolean, className = "scroll-locked") {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    };
    const gutter = Math.max(0, window.innerWidth - html.clientWidth);

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;
    html.classList.add(className);
    body.classList.add(className);

    const onWheel = (event: WheelEvent) => {
      if (redirectMediaWheel(event)) {
        event.preventDefault();
        return;
      }
      if (wheelAllowed(event.target, event.deltaY)) return;
      event.preventDefault();
    };

    const onTouchMove = (event: TouchEvent) => {
      if (wheelAllowed(event.target, 1) || wheelAllowed(event.target, -1)) return;
      event.preventDefault();
    };

    document.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.paddingRight = prev.bodyPaddingRight;
      html.classList.remove(className);
      body.classList.remove(className);
      document.removeEventListener("wheel", onWheel);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [locked, className]);
}
