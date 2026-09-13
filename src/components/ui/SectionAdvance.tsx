"use client";

import { RiArrowDownLine } from "react-icons/ri";

export default function SectionAdvance() {
  const advance = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const marker = window.scrollY + 96;
    const sections = Array.from(document.querySelectorAll("main section"));
    const next = sections.find((section) => section.getBoundingClientRect().top + window.scrollY > marker + 24);
    const target = next || document.querySelector("footer");
    target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      className="section-advance social-tip"
      data-tip="Next section"
      data-tip-place="above"
      aria-label="Scroll to the next section"
      onClick={advance}
    >
      <RiArrowDownLine size={20} />
    </button>
  );
}
