"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  activeIntroGreetings,
  introExperienceFrom,
  markIntroSeen,
  resolveGreetingDirection,
  shouldShowIntro,
  type IntroExperience,
  type IntroGreeting,
} from "@/lib/intro-experience";
import { useSiteSettings } from "@/hooks/useSiteSettings";

type Props = {
  /** Isolated preview (dashboard) — never marks visitor as seen */
  force?: boolean;
  previewConfig?: IntroExperience;
  onComplete?: () => void;
};

export default function SiteIntroOverlay({ force = false, previewConfig, onComplete }: Props) {
  const liveSettings = useSiteSettings();
  const config = useMemo(
    () => previewConfig || introExperienceFrom(liveSettings),
    [previewConfig, liveSettings]
  );

  const greetings = useMemo(() => activeIntroGreetings(config), [config]);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "reveal" | "done">("enter");
  const timers = useRef<number[]>([]);
  const finished = useRef(false);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    clearTimers();
    setPhase("done");
    setActive(false);
    if (!force) markIntroSeen(config);
    onComplete?.();
  }, [config, force, onComplete]);

  useEffect(() => {
    finished.current = false;
    let cancelled = false;

    try {
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!force && !shouldShowIntro(config, { pathname: window.location.pathname })) {
        setActive(false);
        return;
      }

      if (!greetings.length) {
        setActive(false);
        return;
      }

      setActive(true);
      setIndex(0);

      if (reduced) {
        setPhase("hold");
        const t = window.setTimeout(() => {
          if (!cancelled) finish();
        }, 450);
        timers.current.push(t);
        return () => {
          cancelled = true;
          clearTimers();
        };
      }

      const total = config.totalDurationMs;
      const n = greetings.length;
      const slot = total / n;
      const enterMs = Math.min(180, slot * 0.28);
      const exitMs = Math.min(160, slot * 0.24);
      const holdMs = Math.max(80, slot - enterMs - exitMs);

      const runGreeting = (i: number) => {
        if (cancelled) return;
        setIndex(i);
        setPhase("enter");
        const t1 = window.setTimeout(() => {
          if (cancelled) return;
          setPhase("hold");
          const t2 = window.setTimeout(() => {
            if (cancelled) return;
            setPhase("exit");
            const t3 = window.setTimeout(() => {
              if (cancelled) return;
              if (i + 1 < n) runGreeting(i + 1);
              else {
                setPhase("reveal");
                const t4 = window.setTimeout(() => {
                  if (!cancelled) finish();
                }, 280);
                timers.current.push(t4);
              }
            }, exitMs);
            timers.current.push(t3);
          }, holdMs);
          timers.current.push(t2);
        }, enterMs);
        timers.current.push(t1);
      };

      runGreeting(0);
    } catch {
      setActive(false);
      onComplete?.();
    }

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [config, finish, force, greetings, onComplete]);

  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);

  if (!active || phase === "done" || !greetings.length) return null;

  const current: IntroGreeting = greetings[Math.min(index, greetings.length - 1)];
  const dir = resolveGreetingDirection(current);
  const transitionClass =
    config.transition === "fade"
      ? "is-fade"
      : config.transition === "slide"
        ? "is-slide"
        : "is-fade-slide";

  return (
    <div
      className={`site-intro ${transitionClass} is-${phase}`}
      style={{ background: config.background, color: config.textColor }}
      role="presentation"
      aria-hidden="true"
    >
      <p
        key={`${current.id}-${index}-${phase === "enter" ? "in" : "out"}`}
        className="site-intro-greeting"
        lang={current.locale || undefined}
        dir={dir}
      >
        {current.text}
      </p>
      {force ? (
        <button type="button" className="site-intro-skip" onClick={finish}>
          Close preview
        </button>
      ) : null}
    </div>
  );
}
