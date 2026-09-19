"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { RiMailSendLine, RiCloseLine, RiCheckDoubleLine, RiLoader4Line } from "react-icons/ri";
import { useHistoryBackClose, dismissOnBackdrop } from "@/hooks/useHistoryBackClose";
import {
  hasSubscribeJoined,
  markSubscribeJoined,
  SUBSCRIBE_JOINED_EVENT,
  submitSubscribe,
} from "@/lib/subscribe-client";
import { WIDGET_BLURB } from "@/lib/welcome-copy";

const APPEAR_DELAY_MS = 8000;
const REOPEN_AFTER_DISMISS_MS = 2 * 60 * 1000;
const SUCCESS_HOLD_MS = 7000;
const MOBILE_MQ = "(max-width: 720px)";

export default function SubscribeWidget() {
  const pathname = usePathname();
  const titleId = useId();
  const successTimer = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [joined, setJoined] = useState(false);
  const [emailedOk, setEmailedOk] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const syncJoined = () => {
      // Keep success UI visible; markJoined is delayed until after the hold.
      if (status === "success" || status === "loading") return;
      setJoined(hasSubscribeJoined());
    };
    syncJoined();
    window.addEventListener(SUBSCRIBE_JOINED_EVENT, syncJoined);
    return () => window.removeEventListener(SUBSCRIBE_JOINED_EVENT, syncJoined);
  }, [status]);

  useEffect(() => {
    if (joined && status !== "success") {
      setIsVisible(false);
      return;
    }
    // Never restart the appear timer while submitting or showing success —
    // that was hiding the sheet the moment Join flipped status to "loading".
    if (status === "loading" || status === "success") return;

    setIsVisible(false);
    const appear = window.setTimeout(() => setIsVisible(true), APPEAR_DELAY_MS);
    return () => window.clearTimeout(appear);
  }, [pathname, joined, status]);

  const handleDismiss = useCallback(() => {
    if (successTimer.current) {
      window.clearTimeout(successTimer.current);
      successTimer.current = null;
    }
    setIsVisible(false);
    if (status === "success") {
      markSubscribeJoined();
      setJoined(true);
    }
    setStatus("idle");
  }, [status]);

  useEffect(() => {
    if (joined || isVisible || status === "success" || status === "loading") return;
    const reopen = window.setTimeout(() => setIsVisible(true), REOPEN_AFTER_DISMISS_MS);
    return () => window.clearTimeout(reopen);
  }, [joined, isVisible, status]);

  useHistoryBackClose(isVisible && isMobile && status !== "loading", handleDismiss);

  useEffect(() => {
    if (!isVisible || !isMobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isVisible, isMobile]);

  useEffect(() => {
    return () => {
      if (successTimer.current) window.clearTimeout(successTimer.current);
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    setIsVisible(true);
    try {
      // Delay localStorage mark so the success screen can hold before hide.
      const result = await submitSubscribe(email, "widget", { markJoined: false });
      setEmailedOk(result.emailed !== false && !result.mailError);
      setStatus("success");
      successTimer.current = window.setTimeout(() => {
        markSubscribeJoined();
        setJoined(true);
        setIsVisible(false);
        setStatus("idle");
        successTimer.current = null;
      }, SUCCESS_HOLD_MS);
    } catch {
      setStatus("error");
    }
  };

  if (joined && status !== "success") return null;

  const sheet = isMobile;
  const layerClass = [
    "subscribe-widget-layer",
    sheet ? "is-sheet" : "is-card",
    isVisible ? "is-open" : "",
    status === "success" ? "is-success" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={layerClass}
      aria-hidden={!isVisible}
      onMouseDown={sheet && status !== "loading" ? dismissOnBackdrop(handleDismiss) : undefined}
    >
      {sheet ? (
        <button
          type="button"
          className="subscribe-widget-backdrop"
          aria-label="Close"
          onClick={handleDismiss}
          tabIndex={isVisible ? 0 : -1}
          disabled={status === "loading"}
        />
      ) : null}
      <div
        className="subscribe-widget"
        role={sheet ? "dialog" : "complementary"}
        aria-labelledby={titleId}
        aria-modal={sheet && isVisible ? true : undefined}
        onMouseDown={sheet ? (event) => event.stopPropagation() : undefined}
      >
        {sheet ? <span className="subscribe-widget-handle" aria-hidden="true" /> : null}
        <button
          type="button"
          className="subscribe-widget-close"
          onClick={handleDismiss}
          aria-label="Close"
          disabled={status === "loading"}
        >
          <RiCloseLine size={20} />
        </button>

        {status === "success" ? (
          <div className="subscribe-widget-success" role="status">
            <RiCheckDoubleLine size={sheet ? 64 : 48} aria-hidden="true" />
            <h4 id={titleId}>You&apos;re in</h4>
            <p>
              {emailedOk
                ? "Thanks for joining. Watch for a welcome note — check spam if it is not in your inbox soon."
                : "Thanks for joining. You are on the list; the welcome email may take a moment."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="subscribe-widget-head">
              <span className="subscribe-widget-icon" aria-hidden="true">
                <RiMailSendLine size={20} />
              </span>
              <h4 id={titleId}>Stay updated</h4>
            </div>
            <p className="subscribe-widget-copy">{WIDGET_BLURB}</p>
            <div className="subscribe-widget-row">
              <label className="sr-only" htmlFor="subscribe-widget-email">
                Email address
              </label>
              <input
                id="subscribe-widget-email"
                type="email"
                autoComplete="email"
                placeholder="Your email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === "error") setStatus("idle");
                }}
                required
                disabled={status === "loading"}
              />
              <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <RiLoader4Line size={16} className="subscribe-widget-spin" aria-hidden="true" />
                    Joining…
                  </>
                ) : (
                  "Join"
                )}
              </button>
            </div>
            {status === "error" ? (
              <p className="subscribe-widget-error" role="alert">
                Something went wrong. Please try again.
              </p>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
