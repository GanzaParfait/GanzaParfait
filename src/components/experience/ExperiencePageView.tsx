"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  RiArrowRightLine,
  RiBriefcaseLine,
  RiBuilding2Line,
  RiCalendarLine,
  RiExternalLinkLine,
  RiMapPinLine,
  RiLineChartLine,
  RiGraduationCapLine,
} from "react-icons/ri";
import {
  careerFrom,
  experienceTimelineRecords,
  type CareerRecord,
} from "@/lib/career";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CustomSelect from "@/components/ui/CustomSelect";
import { useSiteSettings } from "@/hooks/useSiteSettings";

type FilterId = "all" | "leadership" | "work" | "education" | "other";
type SortId = "latest" | "oldest";

type TimelineEntry = {
  id: string;
  kind: CareerRecord["kind"];
  category: FilterId;
  period: string;
  location?: string;
  title: string;
  organization: string;
  summary: string;
  highlights: string[];
  skills: string[];
  href?: string;
  hrefLabel?: string;
  external?: boolean;
  sortYear: number;
  badge: string;
  logo?: string;
};

function recordToEntry(item: CareerRecord): TimelineEntry {
  const category: FilterId =
    item.category === "leadership" || item.category === "work" || item.category === "education" || item.category === "other"
      ? item.category
      : "other";

  let badge = "Work";
  if (item.kind === "education") badge = "Education";
  else if (item.kind === "certification") badge = "Certificate";
  else if (item.category === "leadership") badge = "Leadership";
  else if (item.roleType === "training") badge = "Training";

  const href = item.verifyUrl || item.relatedHref || item.website;
  const external = Boolean(
    item.verifyUrl || (item.website && !item.relatedHref?.startsWith("/")) || item.relatedHref?.startsWith("http"),
  );

  return {
    id: item.id,
    kind: item.kind,
    category,
    period: item.period,
    location: item.location,
    title: item.title,
    organization: item.organization,
    summary: item.summary || item.description,
    highlights: item.highlights || [],
    skills: item.skills || [],
    href,
    hrefLabel: item.relatedLabel || (item.verifyUrl ? "Verify certificate" : item.website ? "Visit website" : undefined),
    external,
    sortYear: item.sortYear,
    badge,
    logo: item.logo,
  };
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "leadership", label: "Leadership" },
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
  { id: "other", label: "Other" },
];

function matchesYear(item: TimelineEntry, year: string | null) {
  if (!year || year === "All") return true;
  const tokens = item.period.match(/\d{4}/g) || [String(item.sortYear)];
  if (year === "NOW") return /present/i.test(item.period);
  return tokens.includes(year) || String(item.sortYear) === year;
}

function scrollToTimeline() {
  const node = document.getElementById("experience-timeline");
  if (!node) return;
  const nav = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--public-nav-offset") || "64",
  );
  const top = node.getBoundingClientRect().top + window.scrollY - (Number.isFinite(nav) ? nav + 12 : 76);
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export default function ExperiencePageView() {
  const settings = useSiteSettings();
  const career = useMemo(() => careerFrom(settings), [settings]);
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId>("latest");
  const [yearFocus, setYearFocus] = useState<string | null>(null);
  const [yearHover, setYearHover] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const all = useMemo(
    () => experienceTimelineRecords(career).map(recordToEntry),
    [career],
  );

  const yearRail = useMemo(() => {
    const years = new Set<string>();
    let hasNow = false;
    for (const item of all) {
      const tokens = item.period.match(/\d{4}/g) || [String(item.sortYear)];
      if (/present/i.test(item.period)) hasNow = true;
      for (const token of tokens) years.add(token);
    }
    const ordered = [...years].sort((a, b) => Number(a) - Number(b));
    if (hasNow) ordered.push("NOW");
    return ordered;
  }, [all]);

  const activeYear = yearHover || yearFocus;

  const counts = useMemo(() => {
    const next: Record<FilterId, number> = { all: all.length, leadership: 0, work: 0, education: 0, other: 0 };
    for (const item of all) next[item.category] += 1;
    return next;
  }, [all]);

  const visible = useMemo(() => {
    const list = all
      .filter((item) => (filter === "all" ? true : item.category === filter))
      .filter((item) => matchesYear(item, yearFocus));
    return [...list].sort((a, b) => (sort === "latest" ? b.sortYear - a.sortYear : a.sortYear - b.sortYear));
  }, [all, filter, sort, yearFocus]);

  const yearPreview = useMemo(() => {
    if (!activeYear || activeYear === "All") return null;
    return all.find((item) => matchesYear(item, activeYear)) || null;
  }, [all, activeYear]);

  const roleCount = career.records.filter((item) => item.kind === "role").length;
  const orgCount = new Set(career.records.map((item) => item.organization)).size;

  useEffect(() => {
    const node = document.getElementById("experience-board");
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.35;
      const seen = Math.min(Math.max(-rect.top + window.innerHeight * 0.2, 0), Math.max(total, 1));
      setProgress(total <= 0 ? 1 : seen / total);
    };
    update();
    if (reduce) {
      setProgress(1);
      return;
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [visible.length, filter, sort, yearFocus]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#experience-timeline") return;
    const frame = window.requestAnimationFrame(() => scrollToTimeline());
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const { page, stats } = career;

  return (
    <div className="experience-page">
      <section className="experience-hero" data-page-section aria-label="Experience header">
        <div className="container experience-hero-grid">
          <AnimatedSection>
            <p className="section-label">{page.label}</p>
            <h1>{page.title}</h1>
            <p>{page.body}</p>
          </AnimatedSection>
          <AnimatedSection delay={80} className="experience-hero-aside" aria-label="Experience principles">
            <p className="experience-hero-aside-line">
              {page.asideLine.split("·").map((part, index) => (
                <span key={part.trim()}>
                  {index > 0 ? (
                    <i className="experience-hero-aside-dot" aria-hidden="true">
                      ·
                    </i>
                  ) : null}
                  <strong>{part.trim()}</strong>
                </span>
              ))}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="experience-toolbar-section" data-page-section aria-label="Filter experience">
        <div className="container experience-toolbar-stack">
          {yearRail.length > 1 ? (
            <div
              className="journey-rail experience-year-rail"
              role="group"
              aria-label="Timeline years"
              onMouseLeave={() => setYearHover(null)}
            >
              <div className="journey-rail-row">
                <p className="journey-rail-label">Years</p>
                <ul className="journey-rail-years">
                  {yearRail.map((year) => {
                    const preview = all.find((entry) => matchesYear(entry, year));
                    const selected = yearFocus === year || yearHover === year;
                    return (
                      <li key={year}>
                        <button
                          type="button"
                          className={selected ? "is-on" : undefined}
                          aria-pressed={yearFocus === year}
                          aria-label={
                            preview ? `${year}: ${preview.title} at ${preview.organization}` : `Show ${year}`
                          }
                          onClick={() => setYearFocus((current) => (current === year ? null : year))}
                          onMouseEnter={() => {
                            if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                              setYearHover(year);
                            }
                          }}
                          onFocus={() => setYearHover(year)}
                          onBlur={() => setYearHover(null)}
                        >
                          {year}
                        </button>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      type="button"
                      className={yearFocus === null ? "is-on" : undefined}
                      aria-pressed={yearFocus === null}
                      onClick={() => setYearFocus(null)}
                    >
                      All
                    </button>
                  </li>
                </ul>
              </div>
              {yearPreview ? (
                <p className="journey-rail-preview experience-year-preview">
                  <strong>{yearPreview.title}</strong>
                  <em>{yearPreview.organization}</em>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="journey-toolbar experience-toolbar">
            <div className="journey-filters experience-filters" role="tablist" aria-label="Experience categories">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.id}
                  className={filter === item.id ? "is-on" : undefined}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label} ({counts[item.id]})
                </button>
              ))}
            </div>
            <label className="journey-sort">
              <span className="sr-only">Sort</span>
              <CustomSelect
                aria-label="Sort"
                value={sort}
                options={[
                  { value: "latest", label: "Latest first" },
                  { value: "oldest", label: "Oldest first" },
                ]}
                onChange={(value) => setSort(value as SortId)}
              />
            </label>
          </div>
        </div>
      </section>

      <section
        className="experience-board-section"
        id="experience-board"
        data-page-section
        aria-label="Experience timeline"
      >
        <div className="container experience-board">
          <aside className="experience-side">
            <AnimatedSection className="experience-side-intro">
              <p className="section-label">{page.sideLabel}</p>
              <h2>{page.sideTitle}</h2>
              <p className="experience-side-copy">{page.sideBody}</p>
            </AnimatedSection>
            <div className="experience-stats">
              {(stats.length
                ? stats
                : [
                    { value: `${roleCount}+`, label: "Roles & experiences" },
                    { value: String(orgCount), label: "Organizations" },
                    { value: "2021", label: "Journey started" },
                    { value: "Ongoing", label: "Building and learning" },
                  ]
              ).map((stat, index) => {
                const Icon =
                  index === 0
                    ? RiBriefcaseLine
                    : index === 1
                      ? RiBuilding2Line
                      : index === 2
                        ? RiCalendarLine
                        : RiLineChartLine;
                return (
                  <article key={`${stat.value}-${stat.label}`}>
                    <Icon size={18} aria-hidden="true" />
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </article>
                );
              })}
            </div>
            <div className="experience-side-cta">
              <p>Want the full story?</p>
              <a
                href="#experience-timeline"
                className="btn btn-primary"
                onClick={(event) => {
                  event.preventDefault();
                  const url = `${window.location.pathname}${window.location.search}#experience-timeline`;
                  window.history.replaceState(null, "", url);
                  scrollToTimeline();
                }}
              >
                {page.sideCta} <RiArrowRightLine size={14} />
              </a>
            </div>
          </aside>

          <ol className="journey-list experience-timeline" id="experience-timeline">
            <span className="journey-line" style={{ transform: `scaleY(${progress})` }} aria-hidden="true" />
            {visible.length ? (
              visible.map((item, index) => (
                <li key={item.id} className={index === 0 && sort === "latest" ? "is-current" : undefined}>
                  <ExperienceCard item={item} current={index === 0 && sort === "latest"} />
                </li>
              ))
            ) : (
              <li className="experience-empty-wrap">
                <p className="experience-empty">No entries match this filter.</p>
              </li>
            )}
          </ol>
        </div>
      </section>

      <section className="experience-next" data-page-section aria-label="Next chapter">
        <div className="container experience-next-grid">
          <div className="experience-next-copy">
            <p className="section-label">Next chapter</p>
            <h2>Let&apos;s build what&apos;s next.</h2>
          </div>
          <div className="experience-next-actions">
            <Link href="/contact" className="btn btn-primary experience-next-primary">
              Start a conversation <RiArrowRightLine size={14} />
            </Link>
            <div className="experience-next-secondary">
              <Link href="/projects" className="btn btn-outline">
                View selected work <RiArrowRightLine size={14} />
              </Link>
              <Link href="/cv?source=experience" className="btn btn-ghost">
                Download CV <RiArrowRightLine size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ExperienceCard({ item, current }: { item: TimelineEntry; current?: boolean }) {
  return (
    <article className={`experience-card${current ? " is-current" : ""}`}>
      <div className="experience-card-top">
        <p>{item.period}</p>
        <em className={`experience-card-badge is-${item.category}`}>{item.badge}</em>
        {item.location ? (
          <span>
            <RiMapPinLine size={13} /> {item.location}
          </span>
        ) : (
          <span />
        )}
      </div>
      <div className="experience-card-head">
        <div className="experience-card-titles">
          <h3>
            {item.kind === "education" || item.kind === "certification" ? (
              <RiGraduationCapLine size={18} aria-hidden="true" />
            ) : null}
            {item.title}
          </h3>
          <p className="experience-card-org">{item.organization}</p>
        </div>
        {item.logo ? (
          <span className="experience-card-logo">
            <Image src={item.logo} alt={`${item.organization} logo`} width={56} height={56} />
          </span>
        ) : null}
      </div>
      <p className="experience-card-summary">{item.summary}</p>
      {item.highlights.length ? (
        <ul>
          {item.highlights.slice(0, 4).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      {item.skills.length ? (
        <div className="experience-card-skills">
          {item.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      ) : null}
      {item.href ? (
        item.external ? (
          <a href={item.href} className="experience-card-link" target="_blank" rel="noopener noreferrer">
            {item.hrefLabel || "View details"} <RiExternalLinkLine size={14} />
          </a>
        ) : (
          <Link href={item.href} className="experience-card-link">
            {item.hrefLabel || "View details"} <RiArrowRightLine size={14} />
          </Link>
        )
      ) : null}
    </article>
  );
}
