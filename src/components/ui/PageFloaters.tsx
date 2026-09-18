"use client";

import { useEffect, useState } from "react";
import { RiArrowDownLine, RiArrowUpLine } from "react-icons/ri";

type AdvanceTarget = {
  el: HTMLElement;
  kind: "item" | "section";
  label: string;
  indexLabel?: string;
};

function sectionLabel(el: HTMLElement) {
  return (
    el.dataset.sectionLabel?.trim() ||
    el.getAttribute("aria-label")?.trim() ||
    el.querySelector("h1, h2")?.textContent?.trim() ||
    "Section"
  );
}

function itemLabel(el: HTMLElement) {
  return (
    el.dataset.advanceLabel?.trim() ||
    el.querySelector("h2, h3")?.textContent?.trim() ||
    "Next"
  );
}

function pageSections() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-page-section]"));
}

function nextTarget(): AdvanceTarget | null {
  const marker = window.scrollY + Math.min(140, Math.round(window.innerHeight * 0.2));
  const preferItems = window.matchMedia("(max-width: 900px)").matches;
  const sections = pageSections();

  let currentSectionIndex = -1;
  sections.forEach((section, index) => {
    const top = section.getBoundingClientRect().top + window.scrollY;
    if (top <= marker + 8) currentSectionIndex = index;
  });

  const currentSection = currentSectionIndex >= 0 ? sections[currentSectionIndex] : null;

  if (preferItems && currentSection) {
    const items = Array.from(currentSection.querySelectorAll<HTMLElement>("[data-advance-item]"));
    const nextItem = items.find((item) => {
      const top = item.getBoundingClientRect().top + window.scrollY;
      return top > marker + 28;
    });
    if (nextItem) {
      return {
        el: nextItem,
        kind: "item",
        label: itemLabel(nextItem),
      };
    }
  }

  const nextSection = sections[currentSectionIndex + 1];
  if (nextSection) {
    const index = currentSectionIndex + 2;
    return {
      el: nextSection,
      kind: "section",
      label: sectionLabel(nextSection),
      indexLabel: String(index).padStart(2, "0"),
    };
  }

  return null;
}

export default function PageFloaters() {
  const [scrolled, setScrolled] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [cue, setCue] = useState("Next section");

  useEffect(() => {
    const update = () => {
      const sections = pageSections();
      const last = sections[sections.length - 1];
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 48;
      const lastReached = last
        ? last.getBoundingClientRect().bottom <= window.innerHeight + 80
        : nearBottom;
      const next = nextTarget();
      setScrolled(window.scrollY > 280);
      setAtEnd(nearBottom || lastReached || !next);
      if (!next) {
        setCue("End of page");
      } else if (next.kind === "item") {
        setCue(`Next · ${next.label}`);
      } else if (next.indexLabel) {
        setCue(`${next.indexLabel} / ${next.label}`);
      } else {
        setCue("Next section");
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const advance = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = nextTarget();
    const target = next?.el || document.querySelector("footer");
    target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className={`page-floaters${atEnd ? " is-end" : ""}${scrolled ? " has-top" : ""}`}>
      <button
        type="button"
        className="section-advance"
        aria-label={atEnd ? "You are at the end of the page" : `Go to ${cue}`}
        onClick={advance}
      >
        <span className="section-advance-label">{atEnd ? "End" : cue}</span>
        <RiArrowDownLine size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="back-to-top social-tip"
        data-tip="Back to top"
        data-tip-place="above"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <RiArrowUpLine size={20} />
      </button>
    </div>
  );
}
