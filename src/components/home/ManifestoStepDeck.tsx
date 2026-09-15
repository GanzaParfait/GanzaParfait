"use client";

import { useEffect, useRef, useState } from "react";
import { RiBarChartBoxLine, RiLightbulbFlashLine, RiSettings3Line } from "react-icons/ri";
import type { HomePoint } from "@/lib/homepage";

const ICONS = [RiLightbulbFlashLine, RiSettings3Line, RiBarChartBoxLine];

export default function ManifestoStepDeck({ points }: { points: HomePoint[] }) {
  const root = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(motion.matches);
    apply();
    motion.addEventListener("change", apply);
    return () => motion.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const list = root.current;
    if (!list || reduced) return;
    const cards = [...list.querySelectorAll<HTMLElement>("[data-deck-card]")];
    if (!cards.length) return;

    const update = () => {
      const anchor = window.innerHeight * 0.34;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const top = card.getBoundingClientRect().top;
        const dist = Math.abs(top - anchor);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      setActive(best);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [points.length, reduced]);

  return (
    <ol className={reduced ? "manifesto-deck is-flat" : "manifesto-deck"} ref={root}>
      {points.map((point, index) => {
        const Icon = ICONS[index % ICONS.length];
        const offset = index - active;
        const state = offset < 0 ? "is-passed" : offset === 0 ? "is-active" : "is-next";
        return (
          <li key={`${point.title}-${index}`} data-deck-card style={{ ["--deck-i" as string]: String(index) }}>
            <article className={`manifesto-card ${state}`} style={{ ["--deck-offset" as string]: String(offset) }}>
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span><Icon size={18} /></span>
              </div>
              <strong>{point.title}</strong>
              <p>{point.body}</p>
              {point.tag ? <small>{point.tag}</small> : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
