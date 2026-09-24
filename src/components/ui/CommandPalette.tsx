"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  RiArrowRightLine,
  RiBriefcaseLine,
  RiCloseLine,
  RiFileTextLine,
  RiMicLine,
  RiSearchLine,
  RiServiceLine,
  RiBookOpenLine,
  RiMapPinLine,
  RiAwardLine,
  RiFlashlightLine,
  RiMailLine,
  RiPhoneLine,
  RiUser3Line,
  RiCalendarEventLine,
} from "react-icons/ri";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import { searchSiteIndex, type SiteSearchItem } from "@/lib/site-search";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { openBookingLink } from "@/lib/booking";

const OPEN_EVENT = "pp:open-search";

export function openSiteSearch() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

function GroupIcon({ item }: { item: SiteSearchItem }) {
  if (item.action === "mailto") return <RiMailLine size={16} />;
  if (item.action === "tel") return <RiPhoneLine size={16} />;
  if (item.action === "booking" || item.id === "quick-booking") return <RiCalendarEventLine size={16} />;
  if (item.id === "quick-about") return <RiUser3Line size={16} />;
  if (item.group === "Quick") return <RiFlashlightLine size={16} />;
  if (item.group === "Work") return <RiBriefcaseLine size={16} />;
  if (item.group === "Experience") return <RiMapPinLine size={16} />;
  if (item.group === "Education") return <RiBookOpenLine size={16} />;
  if (item.group === "Certifications") return <RiAwardLine size={16} />;
  if (item.group === "Services") return <RiServiceLine size={16} />;
  if (item.group === "Writing") return <RiFileTextLine size={16} />;
  if (item.group === "Speaking") return <RiMicLine size={16} />;
  return <RiArrowRightLine size={16} />;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export default function CommandPalette() {
  const router = useRouter();
  const settings = useSiteSettings();
  const searchEnabled = settings.siteSearch?.enabled !== false;
  const placeholder = settings.siteSearch?.placeholder || "Search name, email, projects…";
  const titleId = useId();
  const inputId = useId();
  const listId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRestoreRef = useRef<HTMLElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const results = useMemo(() => searchSiteIndex(query, 12, settings), [query, settings]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useHistoryBackClose(open, close);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!searchEnabled) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (isEditableTarget(event.target) && !open) return;
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, searchEnabled]);

  useEffect(() => {
    if (!searchEnabled) return;
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [searchEnabled]);

  useEffect(() => {
    if (!open) return;
    triggerRestoreRef.current = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(t);
      triggerRestoreRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((current) => Math.max(current - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        const item = results[active];
        if (!item) return;
        event.preventDefault();
        go(item);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, close]);

  const go = (item: SiteSearchItem) => {
    const href = item.href;
    const action = item.action;
    const external = action === "external" || action === "booking" || /^https?:\/\//i.test(href);

    if (action === "mailto" || action === "tel") {
      close();
      window.setTimeout(() => {
        window.location.assign(href);
      }, 80);
      return;
    }
    if (action === "booking") {
      openBookingLink(href, "command_palette");
      close();
      return;
    }
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
      close();
      return;
    }

    close();
    window.setTimeout(() => {
      router.push(href);
    }, 80);
  };

  if (!mounted || !open || !searchEnabled) return null;

  const mod = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

  return createPortal(
    <div
      className={`cmdk-layer${isMobile ? " is-sheet" : " is-modal"}`}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div
        ref={panelRef}
        className="cmdk-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {isMobile ? <div className="cmdk-handle" aria-hidden="true" /> : null}

        <div className="cmdk-head">
          <label className="cmdk-search" htmlFor={inputId}>
            <RiSearchLine size={18} aria-hidden="true" />
            <input
              ref={inputRef}
              id={inputId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
            />
          </label>
          <button type="button" className="cmdk-close" aria-label="Close search" onClick={close}>
            <RiCloseLine size={18} />
          </button>
        </div>

        <div className="cmdk-copy">
          <h2 id={titleId}>Where would you like to go?</h2>
          {!isMobile ? (
            <p>
              Try a name, email, phone, or project. <kbd>{mod}</kbd>
              <kbd>K</kbd>
            </p>
          ) : null}
        </div>

        <ul id={listId} className="cmdk-results" role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <li className="cmdk-empty" role="option" aria-selected="false">
              No matches. Try “Prince”, “hello@”, “LERONY”, or “Contact”.
            </li>
          ) : (
            results.map((item, index) => (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  id={`${listId}-${item.id}`}
                  role="option"
                  aria-selected={index === active}
                  className={index === active ? "is-active" : undefined}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(item)}
                >
                  <span className="cmdk-icon" aria-hidden="true">
                    <GroupIcon item={item} />
                  </span>
                  <span className="cmdk-text">
                    <strong>{item.title}</strong>
                    {item.subtitle ? <em>{item.subtitle}</em> : null}
                  </span>
                  <span className="cmdk-group">{item.group}</span>
                </button>
              </li>
            ))
          )}
        </ul>

        {!isMobile ? (
          <div className="cmdk-foot" aria-hidden="true">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> navigate
            </span>
            <span>
              <kbd>↵</kbd> open
            </span>
            <span>
              <kbd>esc</kbd> close
            </span>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
