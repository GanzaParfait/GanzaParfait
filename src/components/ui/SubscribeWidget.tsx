"use client";

import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { RiMailSendLine, RiCloseLine, RiCheckDoubleLine } from "react-icons/ri";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import {
  hasSubscribeJoined,
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
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const syncJoined = () => setJoined(hasSubscribeJoined());
    syncJoined();
    window.addEventListener(SUBSCRIBE_JOINED_EVENT, syncJoined);
    return () => window.removeEventListener(SUBSCRIBE_JOINED_EVENT, syncJoined);
  }, []);

  useEffect(() => {
    if (joined) {
      setIsVisible(false);
      return;
    }
    setIsVisible(false);
    const appear = window.setTimeout(() => setIsVisible(true), APPEAR_DELAY_MS);
    return () => window.clearTimeout(appear);
  }, [pathname, joined]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (joined || isVisible) return;
    const reopen = window.setTimeout(() => setIsVisible(true), REOPEN_AFTER_DISMISS_MS);
    return () => window.clearTimeout(reopen);
  }, [joined, isVisible]);

  useHistoryBackClose(isVisible && isMobile, handleDismiss);

  useEffect(() => {
    if (!isVisible || !isMobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isVisible, isMobile]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      await submitSubscribe(email, "widget");
      setStatus("success");
      window.setTimeout(() => {
        handleDismiss();
        setJoined(true);
      }, SUCCESS_HOLD_MS);
    } catch {
      setStatus("error");
    }
  };

  if (joined) return null;

  const sheet = isMobile;
  const layerClass = [
    "subscribe-widget-layer",
    sheet ? "is-sheet" : "is-card",
    isVisible ? "is-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={layerClass} aria-hidden={!isVisible}>
      {sheet ? (
        <button type="button" className="subscribe-widget-backdrop" aria-label="Close" onClick={handleDismiss} tabIndex={isVisible ? 0 : -1} />
      ) : null}
      <div
        className="subscribe-widget"
        role={sheet ? "dialog" : "complementary"}
        aria-labelledby={titleId}
        aria-modal={sheet && isVisible ? true : undefined}
      >
        {sheet ? <span className="subscribe-widget-handle" aria-hidden="true" /> : null}
        <button type="button" className="subscribe-widget-close" onClick={handleDismiss} aria-label="Close">
          <RiCloseLine size={20} />
        </button>

        {status === "success" ? (
          <div className="subscribe-widget-success">
            <RiCheckDoubleLine size={48} aria-hidden="true" />
            <h4 id={titleId}>You&apos;re in</h4>
            <p>Thanks for joining. I&apos;ll send a note when there is something worth sharing.</p>
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
                {status === "loading" ? "…" : "Join"}
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
