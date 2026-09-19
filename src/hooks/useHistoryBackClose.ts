"use client";

import { useEffect, useId, useRef, type MouseEvent } from "react";

const STATE_KEY = "__pp_modal";

type StackEntry = {
  id: string;
  close: () => void;
};

const stack: StackEntry[] = [];
let listening = false;
let ignorePops = 0;

function ensureListeners() {
  if (listening || typeof window === "undefined") return;
  listening = true;

  window.addEventListener("popstate", () => {
    if (ignorePops > 0) {
      ignorePops -= 1;
      return;
    }
    const top = stack.pop();
    top?.close();
  });

  // Escape closes only the topmost registered overlay (nested modals stay open underneath).
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || stack.length === 0) return;
    if (event.defaultPrevented) return;
    event.preventDefault();
    stack[stack.length - 1]?.close();
  });
}

/**
 * When a modal/sheet is open, phone/browser Back and Escape close it instead of leaving the page.
 * Supports nested modals via a shared history stack.
 */
export function useHistoryBackClose(open: boolean, onClose: () => void) {
  const id = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    ensureListeners();
    const entry: StackEntry = {
      id,
      close: () => onCloseRef.current(),
    };
    stack.push(entry);
    window.history.pushState({ ...(window.history.state as object), [STATE_KEY]: id }, "");

    return () => {
      const index = stack.lastIndexOf(entry);
      if (index >= 0) stack.splice(index, 1);

      const state = window.history.state as { [STATE_KEY]?: string } | null;
      if (state?.[STATE_KEY] === id) {
        ignorePops += 1;
        window.history.back();
      }
    };
  }, [open, id]);
}

/** Close when the dimmed backdrop itself is pressed (not the sheet). */
export function dismissOnBackdrop<T extends HTMLElement>(onClose: () => void) {
  return (event: MouseEvent<T>) => {
    if (event.target === event.currentTarget) onClose();
  };
}
