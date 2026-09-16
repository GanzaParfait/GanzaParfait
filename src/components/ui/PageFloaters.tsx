"use client";

import { useEffect, useState } from "react";
import { RiArrowDownLine, RiArrowUpLine } from "react-icons/ri";

function pageSections() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-page-section]"));
}

export default function PageFloaters() {
  const [scrolled, setScrolled] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const update = () => {
      const sections = pageSections();
      const last = sections[sections.length - 1];
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 48;
      const lastReached = last
        ? last.getBoundingClientRect().bottom <= window.innerHeight + 80
        : nearBottom;
      setScrolled(window.scrollY > 280);
      setAtEnd(nearBottom || lastReached);
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
    const sections = pageSections();
    const marker = window.scrollY + Math.min(120, Math.round(window.innerHeight * 0.18));
    let current = -1;
    sections.forEach((section, index) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top <= marker + 8) current = index;
    });
    const next = sections[current + 1];
    const target = next || document.querySelector("footer");
    target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className={`page-floaters${atEnd ? " is-end" : ""}${scrolled ? " has-top" : ""}`}>
      <button
        type="button"
        className="section-advance social-tip"
        data-tip={atEnd ? "End of page" : "Next section"}
        data-tip-place="above"
        aria-label={atEnd ? "You are at the end of the page" : "Scroll to the next section"}
        onClick={advance}
      >
        <RiArrowDownLine size={20} />
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
