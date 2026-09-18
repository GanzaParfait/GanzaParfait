"use client";

import { RiArrowDownLine } from "react-icons/ri";

export default function SectionAdvance() {
  const advance = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const marker = window.scrollY + 96;
    const preferItems = window.matchMedia("(max-width: 900px)").matches;
    if (preferItems) {
      const items = Array.from(document.querySelectorAll<HTMLElement>("[data-advance-item]"));
      const nextItem = items.find((item) => item.getBoundingClientRect().top + window.scrollY > marker + 24);
      if (nextItem) {
        nextItem.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        return;
      }
    }
    const sections = Array.from(document.querySelectorAll("main section, [data-page-section]"));
    const next = sections.find((section) => section.getBoundingClientRect().top + window.scrollY > marker + 24);
    const target = next || document.querySelector("footer");
    target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      className="section-advance"
      aria-label="Scroll to the next section"
      onClick={advance}
    >
      <span className="section-advance-label">Next section</span>
      <RiArrowDownLine size={18} aria-hidden="true" />
    </button>
  );
}
