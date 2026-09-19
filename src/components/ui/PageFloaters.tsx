"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { RiArrowDownLine, RiArrowUpLine, RiCloseLine, RiCompass3Line } from "react-icons/ri";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

type Chapter = {
  el: HTMLElement;
  label: string;
  indexLabel: string;
};

function sectionLabel(el: HTMLElement) {
  return (
    el.dataset.sectionLabel?.trim() ||
    el.getAttribute("aria-label")?.trim() ||
    el.querySelector("h1, h2")?.textContent?.trim() ||
    "Section"
  );
}

function pageSections() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-page-section]"));
}

function chaptersFromDom(): Chapter[] {
  return pageSections().map((el, index) => ({
    el,
    label: sectionLabel(el),
    indexLabel: String(index + 1).padStart(2, "0"),
  }));
}

function currentChapterIndex(chapters: Chapter[]) {
  if (!chapters.length) return -1;
  const marker = window.scrollY + Math.min(140, Math.round(window.innerHeight * 0.22));
  let current = 0;
  chapters.forEach((chapter, index) => {
    const top = chapter.el.getBoundingClientRect().top + window.scrollY;
    if (top <= marker + 8) current = index;
  });
  return current;
}

function nextSectionEl(chapters: Chapter[], currentIndex: number) {
  return chapters[currentIndex + 1]?.el || null;
}

export default function PageFloaters() {
  const titleId = useId();
  const [scrolled, setScrolled] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [cue, setCue] = useState("01 / Introduction");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useHistoryBackClose(sheetOpen, () => setSheetOpen(false));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const update = () => {
      const nextChapters = chaptersFromDom();
      setChapters(nextChapters);
      const currentIndex = currentChapterIndex(nextChapters);
      const current = currentIndex >= 0 ? nextChapters[currentIndex] : null;
      const last = nextChapters[nextChapters.length - 1];
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 48;
      const lastReached = last ? last.el.getBoundingClientRect().bottom <= window.innerHeight + 80 : nearBottom;
      const hasNext = Boolean(nextSectionEl(nextChapters, currentIndex));
      setScrolled(window.scrollY > 280);
      setAtEnd(nearBottom || lastReached || !hasNext);
      if (current) {
        setCue(`${current.indexLabel} / ${current.label}`);
      } else {
        setCue("Chapters");
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

  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const scrollTo = (el: Element | null) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const advance = () => {
    const list = chaptersFromDom();
    const currentIndex = currentChapterIndex(list);
    const next = nextSectionEl(list, currentIndex);
    scrollTo(next || document.querySelector("footer"));
  };

  const goChapter = (chapter: Chapter) => {
    setSheetOpen(false);
    window.requestAnimationFrame(() => scrollTo(chapter.el));
  };

  return (
    <>
      <div className={`page-floaters${atEnd ? " is-end" : ""}${scrolled ? " has-top" : ""}`}>
        <div className="section-advance-group">
          <button
            type="button"
            className="section-advance"
            aria-label={`Chapters — currently ${cue}. Open chapter navigation`}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen(true)}
          >
            <RiCompass3Line size={16} aria-hidden="true" />
            <span className="section-advance-label">{atEnd ? "End" : cue}</span>
          </button>
          <button
            type="button"
            className="section-advance-next"
            aria-label={atEnd ? "You are at the end of the page" : "Go to next section"}
            disabled={atEnd}
            onClick={advance}
          >
            <RiArrowDownLine size={18} aria-hidden="true" />
          </button>
        </div>
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

      {mounted && sheetOpen
        ? createPortal(
            <div
              className="chapter-sheet-layer"
              role="presentation"
              onMouseDown={(event) => event.target === event.currentTarget && setSheetOpen(false)}
            >
              <div
                className="chapter-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="chapter-sheet-head">
                  <div>
                    <p className="section-label">On this page</p>
                    <h2 id={titleId}>Chapters</h2>
                  </div>
                  <button
                    type="button"
                    className="chapter-sheet-close"
                    aria-label="Close chapter navigation"
                    onClick={() => setSheetOpen(false)}
                  >
                    <RiCloseLine size={18} />
                  </button>
                </div>
                <ol className="chapter-sheet-list">
                  {chapters.map((chapter, index) => {
                    const current = currentChapterIndex(chapters) === index;
                    return (
                      <li key={`${chapter.indexLabel}-${chapter.label}`}>
                        <button
                          type="button"
                          className={current ? "is-current" : undefined}
                          onClick={() => goChapter(chapter)}
                        >
                          <span className="chapter-sheet-index">{chapter.indexLabel}</span>
                          <span className="chapter-sheet-label">{chapter.label}</span>
                          {current ? <span className="chapter-sheet-now">Now</span> : null}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
