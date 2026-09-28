"use client";

import { useEffect, useRef, type RefObject } from "react";

type SheetDragOptions = {
  /** Skip the gesture above this viewport width. */
  maxWidth?: number;
  /**
   * Drive an existing `translateY(calc(... + var(--sheet-drag, 0px)))`
   * instead of writing `transform` directly. Use this when the sheet stays
   * mounted and its open/closed position is already a transform.
   */
  variable?: boolean;
};

const CLOSE_MS = 280;
const SNAP_MS = 340;

/**
 * Drag a mobile bottom sheet downward to dismiss it.
 * A short drag springs back up. A long drag, or a fast flick, finishes the close.
 */
export function useSheetDrag<T extends HTMLElement>(
  active: boolean,
  onClose: () => void,
  panelRef: RefObject<T | null>,
  options: SheetDragOptions = {},
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const maxWidth = options.maxWidth ?? 1024;
  const variable = options.variable ?? false;

  useEffect(() => {
    const panel = panelRef.current;
    if (!active || !panel) return;
    if (!window.matchMedia(`(max-width: ${maxWidth}px)`).matches) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let startY = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;
    let tracking = false;
    let dragging = false;
    let timer = 0;

    const scrollableAncestor = (target: EventTarget | null) => {
      let node = target instanceof HTMLElement ? target : null;
      while (node && node !== panel) {
        const style = getComputedStyle(node);
        if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 2) return node;
        node = node.parentElement;
      }
      if (panel.scrollHeight > panel.clientHeight + 2) return panel;
      return null;
    };

    const writeOffset = (value: string, animate: boolean) => {
      if (variable) {
        if (!animate) panel.classList.add("is-sheet-dragging");
        else panel.classList.remove("is-sheet-dragging");
        panel.style.setProperty("--sheet-drag", value);
        return;
      }
      panel.style.setProperty("transition", animate && !reduce ? `transform ${animate ? "0.32s" : "0s"} cubic-bezier(0.32, 0.72, 0, 1)` : "none", "important");
      panel.style.setProperty("transform", value === "0px" ? "translateY(0px)" : value.endsWith("%") ? `translateY(${value})` : `translateY(${value})`, "important");
    };

    const clearInline = () => {
      panel.classList.remove("is-sheet-dragging");
      panel.style.removeProperty("--sheet-drag");
      if (!variable) {
        panel.style.removeProperty("transform");
        panel.style.removeProperty("transition");
      }
    };

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      window.clearTimeout(timer);
      startY = event.touches[0].clientY;
      lastY = startY;
      lastT = performance.now();
      velocity = 0;
      tracking = true;
      dragging = false;
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const y = event.touches[0].clientY;
      const now = performance.now();
      velocity = (y - lastY) / Math.max(now - lastT, 16);
      lastY = y;
      lastT = now;
      const dy = y - startY;
      if (dy <= 0) {
        if (dragging) writeOffset("0px", false);
        return;
      }
      const scroller = scrollableAncestor(event.target);
      if (scroller && scroller.scrollTop > 2 && !dragging) return;
      if (!dragging && dy < 8) return;
      dragging = true;
      panel.classList.add("is-sheet-dragging");
      if (event.cancelable) event.preventDefault();
      const height = panel.getBoundingClientRect().height || 1;
      const resisted = dy < height * 0.42 ? dy : height * 0.42 + (dy - height * 0.42) * 0.55;
      writeOffset(`${Math.round(resisted)}px`, false);
    };

    const finish = () => {
      if (!tracking) return;
      const wasDragging = dragging;
      const dy = lastY - startY;
      tracking = false;
      dragging = false;
      if (!wasDragging) {
        panel.classList.remove("is-sheet-dragging");
        return;
      }
      const height = panel.getBoundingClientRect().height || 1;
      const threshold = Math.max(88, height * 0.28);
      const shouldClose = dy > threshold || (dy > 48 && velocity > 0.55);
      panel.classList.remove("is-sheet-dragging");

      if (shouldClose) {
        if (variable) {
          window.requestAnimationFrame(() => {
            panel.style.setProperty("--sheet-drag", "110%");
          });
          timer = window.setTimeout(() => onCloseRef.current(), reduce ? 0 : CLOSE_MS);
          return;
        }
        panel.style.setProperty(
          "transition",
          reduce ? "none" : "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
          "important",
        );
        panel.style.setProperty("transform", "translateY(110%)", "important");
        timer = window.setTimeout(() => onCloseRef.current(), reduce ? 0 : CLOSE_MS);
        return;
      }

      if (variable) {
        window.requestAnimationFrame(() => {
          panel.style.setProperty("--sheet-drag", "0px");
        });
        timer = window.setTimeout(() => panel.style.removeProperty("--sheet-drag"), reduce ? 0 : SNAP_MS);
        return;
      }
      panel.style.setProperty(
        "transition",
        reduce ? "none" : "transform 0.34s cubic-bezier(0.32, 0.72, 0, 1)",
        "important",
      );
      panel.style.setProperty("transform", "translateY(0px)", "important");
      timer = window.setTimeout(() => {
        panel.style.removeProperty("transform");
        panel.style.removeProperty("transition");
      }, reduce ? 0 : SNAP_MS);
    };

    panel.addEventListener("touchstart", onStart, { passive: true });
    panel.addEventListener("touchmove", onMove, { passive: false });
    panel.addEventListener("touchend", finish);
    panel.addEventListener("touchcancel", finish);
    return () => {
      window.clearTimeout(timer);
      panel.removeEventListener("touchstart", onStart);
      panel.removeEventListener("touchmove", onMove);
      panel.removeEventListener("touchend", finish);
      panel.removeEventListener("touchcancel", finish);
      clearInline();
    };
  }, [active, maxWidth, panelRef, variable]);
}
