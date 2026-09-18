"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { RiCloseLine, RiLoader4Line } from "react-icons/ri";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import {
  cvAccessModalHeading,
  isValidEmail,
  writeCvUnlockedCookie,
  type CvAccessAction,
  type CvAccessConfig,
  type CvAccessSource,
} from "@/lib/cv-access";
import type { CvTemplateId } from "@/lib/cv";

type Props = {
  open: boolean;
  access: CvAccessConfig;
  template: CvTemplateId;
  formatLabel: string;
  action: CvAccessAction;
  source: CvAccessSource;
  onClose: () => void;
  onUnlocked: (opts: { skipped: boolean }) => void;
};

export default function CvAccessDialog({
  open,
  access,
  template,
  formatLabel,
  action,
  source,
  onClose,
  onUnlocked,
}: Props) {
  const titleId = useId();
  const descId = useId();
  const emailId = useId();
  const nameId = useId();
  const marketingId = useId();
  const hpId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const triggerRestoreRef = useRef<HTMLElement | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [marketing, setMarketing] = useState(true);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useHistoryBackClose(open, onClose);

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
    if (!open) return;
    triggerRestoreRef.current = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => emailRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(t);
      triggerRestoreRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setName("");
      setMarketing(true);
      setHoneypot("");
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open || !mounted) return null;

  const heading = cvAccessModalHeading(access, template, formatLabel);

  const submit = async (intent: "submit" | "skip") => {
    setError("");
    if (intent === "submit") {
      if (!isValidEmail(email)) {
        setError("Enter a valid email address.");
        emailRef.current?.focus();
        return;
      }
    }

    setSubmitting(true);
    try {
      const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
      const res = await fetch("/api/cv/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          email: intent === "submit" ? email.trim().toLowerCase() : undefined,
          name: intent === "submit" && access.collectName ? name.trim() : undefined,
          marketing_consent: intent === "submit" ? marketing : false,
          template,
          action,
          source,
          referrer: typeof document !== "undefined" ? document.referrer : "",
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
          company: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      writeCvUnlockedCookie(access.rememberDays);
      onUnlocked({ skipped: intent === "skip" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const form = (
    <div className="cv-access-form">
      <div className="cv-access-form-head">
        <h2 id={titleId}>{heading}</h2>
        <p id={descId}>{access.modalBody}</p>
      </div>

      <label className="cv-access-hp" htmlFor={hpId} aria-hidden="true">
        Company
        <input
          id={hpId}
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </label>

      {access.collectName ? (
        <label className="cv-access-field" htmlFor={nameId}>
          <span>Name</span>
          <input
            id={nameId}
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </label>
      ) : null}

      <label className="cv-access-field" htmlFor={emailId}>
        <span>Email address</span>
        <input
          ref={emailRef}
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          disabled={submitting}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${emailId}-error` : descId}
          required
        />
      </label>

      {error ? (
        <p id={`${emailId}-error`} className="cv-access-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        className="btn btn-primary cv-access-submit"
        disabled={submitting}
        onClick={() => void submit("submit")}
      >
        {submitting ? <RiLoader4Line size={16} className="cv-spin" /> : null}
        {access.submitLabel}
      </button>

      {access.marketingOptInAvailable ? (
        <label className="cv-access-check" htmlFor={marketingId}>
          <input
            id={marketingId}
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            disabled={submitting}
          />
          <span>{access.marketingLabel}</span>
        </label>
      ) : null}

      {access.allowSkip ? (
        <button
          type="button"
          className="cv-access-skip"
          disabled={submitting}
          onClick={() => void submit("skip")}
        >
          {access.skipLabel}
        </button>
      ) : null}

      <p className="cv-access-privacy">
        {access.privacyHelper}{" "}
        <Link href="/contact">Privacy</Link>
      </p>
    </div>
  );

  return createPortal(
    <div
      className={`cv-access-layer ${isMobile ? "is-sheet" : "is-modal"}`}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="cv-access-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        {isMobile ? <div className="cv-access-handle" aria-hidden="true" /> : null}
        <button type="button" className="cv-access-close" onClick={onClose} aria-label="Close">
          <RiCloseLine size={20} />
        </button>
        {form}
      </div>
    </div>,
    document.body
  );
}
