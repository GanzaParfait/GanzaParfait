"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { education, experience } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CustomSelect from "@/components/ui/CustomSelect";

type FilterId = "all" | "leadership" | "work" | "education" | "other";
type SortId = "latest" | "oldest";

type TimelineEntry = {
  id: string;
  kind: "experience" | "education";
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
};

function toTimeline(): TimelineEntry[] {
  const roles: TimelineEntry[] = experience.map((item) => ({
    id: item.id,
    kind: "experience",
    category: item.category,
    period: item.period,
    location: item.location,
    title: item.role,
    organization: item.organization,
    summary: item.summary,
    highlights: item.highlights,
    skills: item.skills || [],
    href: item.relatedHref || item.website,
    hrefLabel: item.relatedLabel || (item.website ? "Visit website" : undefined),
    external: Boolean(item.website && !item.relatedHref?.startsWith("/")),
    sortYear: item.sortYear,
    badge: item.category === "leadership" ? "Leadership" : item.type === "training" ? "Training" : "Work",
  }));

  const schools: TimelineEntry[] = education.map((item) => ({
    id: `edu-${item.id}`,
    kind: "education",
    category: "education",
    period: item.period,
    title: item.program,
    organization: item.institution,
    summary: item.note || item.status,
    highlights: [item.status],
    skills: ["Computer science", "Software engineering"].slice(0, item.id === "ulk" ? 1 : 2),
    sortYear: item.sortYear,
    badge: "Education",
  }));

  return [...roles, ...schools];
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "leadership", label: "Leadership" },
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
  { id: "other", label: "Other" },
];

export default function ExperiencePageView() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId>("latest");
  const all = useMemo(() => toTimeline(), []);

  const counts = useMemo(() => {
    const next: Record<FilterId, number> = { all: all.length, leadership: 0, work: 0, education: 0, other: 0 };
    for (const item of all) next[item.category] += 1;
    return next;
  }, [all]);

  const visible = useMemo(() => {
    const list = all.filter((item) => (filter === "all" ? true : item.category === filter));
    return [...list].sort((a, b) => (sort === "latest" ? b.sortYear - a.sortYear : a.sortYear - b.sortYear));
  }, [all, filter, sort]);

  const orgCount = new Set(experience.map((item) => item.organization)).size;

  return (
    <div className="experience-page">
      <section className="experience-hero" data-page-section aria-label="Experience header">
        <div className="container experience-hero-grid">
          <AnimatedSection>
            <p className="section-label">Experience</p>
            <h1>A journey of continuous building.</h1>
            <p>
              Roles, systems work, training, and education that shaped the founder, entrepreneur, and technologist
              path — kept as a record of progress, not just positions.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={80} className="experience-hero-rail" aria-hidden="true">
            <p>People Systems Ideas Impact</p>
            <span>A record of progress, not just positions.</span>
          </AnimatedSection>
        </div>
      </section>

      <section className="experience-toolbar-section" data-page-section aria-label="Filter experience">
        <div className="container experience-toolbar">
          <div className="experience-filters" role="tablist" aria-label="Experience categories">
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
          <CustomSelect
            value={sort}
            aria-label="Sort experience"
            options={[
              { value: "latest", label: "Latest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
            onChange={(value) => setSort(value as SortId)}
            className="dash-cselect"
          />
        </div>
      </section>

      <section className="experience-board-section" data-page-section aria-label="Experience timeline">
        <div className="container experience-board">
          <aside className="experience-side">
            <AnimatedSection>
              <p className="section-label">From learning to leading</p>
              <h2>Evidence behind the identity.</h2>
              <p>
                Leadership at LERONY Ltd leads the public story. Engineering, operations, training, and education stay
                as verified supporting record.
              </p>
            </AnimatedSection>
            <div className="experience-stats">
              <article>
                <RiBriefcaseLine size={18} aria-hidden="true" />
                <strong>{experience.length}+</strong>
                <span>Roles &amp; experiences</span>
              </article>
              <article>
                <RiBuilding2Line size={18} aria-hidden="true" />
                <strong>{orgCount}</strong>
                <span>Organizations</span>
              </article>
              <article>
                <RiCalendarLine size={18} aria-hidden="true" />
                <strong>2021</strong>
                <span>Journey started</span>
              </article>
              <article>
                <RiLineChartLine size={18} aria-hidden="true" />
                <strong>Ongoing</strong>
                <span>Building and learning</span>
              </article>
            </div>
            <div className="experience-side-cta">
              <p>Want the full story?</p>
              <Link href="#experience-timeline" className="btn btn-primary">
                View full timeline <RiArrowRightLine size={16} />
              </Link>
            </div>
          </aside>

          <div className="experience-timeline" id="experience-timeline">
            {visible.length ? (
              visible.map((item, index) => (
                <AnimatedSection key={item.id} delay={Math.min(index, 8) * 45}>
                  <ExperienceCard item={item} current={index === 0 && sort === "latest"} />
                </AnimatedSection>
              ))
            ) : (
              <p className="experience-empty">No entries match this filter.</p>
            )}
          </div>
        </div>
      </section>

      <section className="experience-next" data-page-section aria-label="Next chapter">
        <div className="container experience-next-grid">
          <AnimatedSection>
            <p className="section-label">Next chapter</p>
            <h2>Let&apos;s build what&apos;s next.</h2>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Start a conversation <RiArrowRightLine size={16} />
            </Link>
          </AnimatedSection>
          <AnimatedSection delay={70}>
            <Link href="/projects" className="btn btn-outline btn-lg">
              View selected work <RiArrowRightLine size={16} />
            </Link>
          </AnimatedSection>
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
      <h3>
        {item.kind === "education" ? <RiGraduationCapLine size={18} aria-hidden="true" /> : null}
        {item.title}
      </h3>
      <p className="experience-card-org">{item.organization}</p>
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
