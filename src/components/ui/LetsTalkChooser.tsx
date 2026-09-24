"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  RiArrowRightUpLine,
  RiCalendarEventLine,
  RiCloseLine,
  RiMailLine,
  RiMessage3Line,
} from "react-icons/ri";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import {
  bookingOptionMeta,
  openBookingLink,
  primaryBookingOption,
} from "@/lib/booking";
import { contactEmailsFrom } from "@/lib/contact-emails";

type TalkAction = {
  kind: "message" | "book" | "mail";
  title: string;
  subtitle: string;
  href?: string;
  external?: boolean;
  onSelect?: () => void;
};

export default function LetsTalkChooser({ className }: { className?: string }) {
  const settings = useSiteSettings();
  const booking = primaryBookingOption(settings);
  const contacts = contactEmailsFrom(settings);
  const primaryMail = contacts.primary;
  const secondaryMail = contacts.secondary;
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  useHistoryBackClose(open && isMobile, close);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node) && !panelRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>("[data-lets-talk-item]");
      first?.focus();
    }, 30);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(t);
    };
  }, [open, isMobile]);

  const actions = useMemo<TalkAction[]>(() => {
    const next: TalkAction[] = [
      {
        kind: "message",
        title: "Send a message",
        subtitle: "Use the contact form",
        href: "/contact",
      },
    ];

    if (booking) {
      next.push({
        kind: "book",
        title:
          booking.durationMinutes === 30
            ? "Book a 30-minute meeting"
            : `Book a ${booking.durationMinutes}-minute meeting`,
        subtitle: booking.description || "Choose an available time on Google Calendar",
        external: true,
        onSelect: () => {
          openBookingLink(booking.url, "navbar");
          close();
        },
      });
    }

    const addresses = secondaryMail ? [primaryMail, secondaryMail] : [primaryMail];
    addresses.forEach((address, index) => {
      next.push({
        kind: "mail",
        title: index === 0 ? "Email me" : "Also email",
        href: `mailto:${address}`,
        subtitle: address,
      });
    });

    return next;
  }, [booking, close, primaryMail, secondaryMail]);

  useEffect(() => {
    setActiveIndex(0);
  }, [open, actions.length]);

  const onPanelKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, actions.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(actions.length - 1);
    }
  };

  useEffect(() => {
    if (!open) return;
    const items = panelRef.current?.querySelectorAll<HTMLElement>("[data-lets-talk-item]");
    items?.[activeIndex]?.focus();
  }, [activeIndex, open]);

  const panel = (
    <div
      ref={panelRef}
      className={isMobile ? "lets-talk-sheet" : "lets-talk-popover"}
      role="menu"
      aria-labelledby={titleId}
      onKeyDown={onPanelKeyDown}
    >
      {isMobile ? (
        <div className="lets-talk-sheet-head">
          <div className="lets-talk-handle" aria-hidden="true" />
          <div className="lets-talk-sheet-title-row">
            <h2 id={titleId}>Let&apos;s Talk</h2>
            <button type="button" className="lets-talk-close" aria-label="Close" onClick={close}>
              <RiCloseLine size={20} />
            </button>
          </div>
        </div>
      ) : (
        <p id={titleId} className="lets-talk-popover-label">
          How would you like to connect?
        </p>
      )}

      <ul className="lets-talk-actions">
        {actions.map((action, index) => {
          const icon =
            action.kind === "book" ? (
              <RiCalendarEventLine size={18} />
            ) : action.kind === "mail" ? (
              <RiMailLine size={18} />
            ) : (
              <RiMessage3Line size={18} />
            );

          const body = (
            <>
              <span className="lets-talk-action-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="lets-talk-action-copy">
                <strong>{action.title}</strong>
                <em>{action.subtitle}</em>
                {action.kind === "book" && booking ? (
                  <span className="lets-talk-action-meta">{bookingOptionMeta(booking)}</span>
                ) : null}
              </span>
              {action.external ? (
                <RiArrowRightUpLine size={16} className="lets-talk-external" aria-hidden="true" />
              ) : null}
            </>
          );

          if (action.onSelect) {
            return (
              <li key={`${action.kind}-${action.title}-${index}`} role="none">
                <button
                  type="button"
                  role="menuitem"
                  data-lets-talk-item
                  className={index === activeIndex ? "is-active" : undefined}
                  onClick={action.onSelect}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {body}
                </button>
              </li>
            );
          }

          if (action.href?.startsWith("mailto:")) {
            return (
              <li key={`${action.kind}-${action.href}`} role="none">
                <a
                  role="menuitem"
                  data-lets-talk-item
                  href={action.href}
                  className={index === activeIndex ? "is-active" : undefined}
                  onClick={close}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {body}
                </a>
              </li>
            );
          }

          return (
            <li key={`${action.kind}-${index}`} role="none">
              <Link
                role="menuitem"
                data-lets-talk-item
                href={action.href || "/contact"}
                className={index === activeIndex ? "is-active" : undefined}
                onClick={close}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {body}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className={`lets-talk${className ? ` ${className}` : ""}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="btn btn-primary nav-talk"
        style={{ fontWeight: 700, letterSpacing: "-0.01em", padding: "0.48rem 1.05rem", fontSize: "0.84rem" }}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        Let&apos;s Talk
      </button>

      {open && !isMobile ? panel : null}

      {mounted && open && isMobile
        ? createPortal(
            <div className="lets-talk-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
              {panel}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
