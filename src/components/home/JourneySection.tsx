"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiBriefcaseLine,
  RiCalendarLine,
  RiCloseLine,
  RiExternalLinkLine,
  RiGroupLine,
  RiLineChartLine,
  RiMapPinLine,
  RiLinkM,
} from "react-icons/ri";
import type { HomepageContent, JourneyEntry, JourneyType } from "@/lib/homepage";
import CustomSelect from "@/components/ui/CustomSelect";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

type FilterId = "all" | JourneyType;
type SortId = "latest" | "oldest";
type DetailTab = "overview" | "contributions" | "projects" | "skills";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "education", label: "Education" },
  { id: "work", label: "Work" },
  { id: "leadership", label: "Leadership" },
  { id: "milestone", label: "Milestones" },
];

function typeLabel(type: JourneyType) {
  if (type === "leadership") return "Leadership";
  if (type === "education") return "Education";
  if (type === "milestone") return "Milestone";
  return "Work";
}

function yearTokens(year: string): string[] {
  const tokens: string[] = year.match(/\d{4}/g) || [];
  if (/present/i.test(year)) tokens.push("NOW");
  return tokens;
}

function buildYearRail(entries: JourneyEntry[]) {
  const years = new Set<string>();
  let hasNow = false;
  for (const entry of entries) {
    for (const token of yearTokens(entry.year)) {
      if (token === "NOW") hasNow = true;
      else years.add(token);
    }
  }
  const ordered = [...years].sort((a, b) => Number(a) - Number(b));
  if (hasNow || entries.some((entry) => /present/i.test(entry.year))) ordered.push("NOW");
  return ordered;
}

function entryMatchesYear(entry: JourneyEntry, year: string | null) {
  if (!year) return true;
  const tokens = yearTokens(entry.year);
  if (year === "NOW") return tokens.includes("NOW") || /present/i.test(entry.year);
  return tokens.includes(year);
}

export default function JourneySection({
  journey,
  embedded = false,
}: {
  journey: HomepageContent["journey"];
  embedded?: boolean;
}) {
  const [progress, setProgress] = useState(embedded ? 1 : 0);
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId>("latest");
  const [yearFocus, setYearFocus] = useState<string | null>(null);
  const [yearHover, setYearHover] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  useHistoryBackClose(Boolean(activeId), () => setActiveId(null));
  const Tag = embedded ? "div" : "section";
  const entries = journey.entries || [];
  const yearRail = useMemo(() => buildYearRail(entries), [entries]);
  const activeYear = yearHover || yearFocus;

  const counts = useMemo(() => {
    const next: Record<FilterId, number> = {
      all: entries.length,
      education: 0,
      work: 0,
      leadership: 0,
      milestone: 0,
    };
    for (const entry of entries) next[entry.type] += 1;
    return next;
  }, [entries]);

  const visible = useMemo(() => {
    const filtered = (filter === "all" ? entries : entries.filter((entry) => entry.type === filter)).filter((entry) =>
      entryMatchesYear(entry, yearFocus),
    );
    return [...filtered].sort((a, b) => {
      const aIndex = entries.findIndex((item) => item.id === a.id);
      const bIndex = entries.findIndex((item) => item.id === b.id);
      return sort === "latest" ? aIndex - bIndex : bIndex - aIndex;
    });
  }, [entries, filter, sort, yearFocus]);

  const yearPreview = useMemo(() => {
    if (!activeYear) return null;
    return entries.find((entry) => entryMatchesYear(entry, activeYear)) || null;
  }, [entries, activeYear]);

  const active = entries.find((entry) => entry.id === activeId) || null;

  useEffect(() => {
    if (embedded) {
      setProgress(1);
      return;
    }
    const node = document.getElementById("journey");
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
  }, [embedded]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const openDetails = (entry: JourneyEntry) => {
    if (!entry.showDetails || entry.detailsBlocked) return;
    setDetailTab("overview");
    setActiveId(entry.id);
  };

  return (
    <>
      <Tag className={embedded ? "journey journey-embedded" : "journey"} id={embedded ? undefined : "journey"} aria-label="Journey" data-page-section={embedded ? undefined : true} data-section-label={embedded ? undefined : "Journey"}>
        <div className="container journey-stage">
          <div className="journey-intro">
            <p className="section-label">{journey.label}</p>
            <h2>{journey.title}</h2>
            {journey.note ? <p className="journey-note">{journey.note}</p> : null}

            {journey.display.showStats && journey.stats.length ? (
              <ul className="journey-stats">
                {journey.stats.map((stat) => (
                  <li key={`${stat.value}-${stat.label}`}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {journey.display.showMoreCard ? (
              <aside className="journey-more">
                <div className="journey-more-copy">
                  <strong>{journey.moreTitle}</strong>
                  <p>{journey.moreBody}</p>
                  <Link href="/experience#experience-timeline" className="btn btn-primary btn-sm">
                    {journey.moreCta || "Open full timeline"} <RiArrowRightLine size={14} />
                  </Link>
                </div>
                <div className="journey-more-preview" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </aside>
            ) : null}
          </div>

          <div className="journey-panel">
            {yearRail.length > 1 ? (
              <div
                className="journey-rail"
                role="group"
                aria-label="Timeline years"
                onMouseLeave={() => setYearHover(null)}
              >
                <div className="journey-rail-row">
                  <p className="journey-rail-label">Years</p>
                  <ul className="journey-rail-years">
                    {yearRail.map((year) => {
                      const preview = entries.find((entry) => entryMatchesYear(entry, year));
                      const selected = yearFocus === year || yearHover === year;
                      return (
                        <li key={year}>
                          <button
                            type="button"
                            className={selected ? "is-on" : undefined}
                            aria-pressed={yearFocus === year}
                            aria-label={
                              preview
                                ? `${year}: ${preview.title} at ${preview.organization}`
                                : `Show ${year}`
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
                  </ul>
                  {yearFocus ? (
                    <button type="button" className="journey-rail-clear" onClick={() => setYearFocus(null)}>
                      All
                    </button>
                  ) : null}
                </div>
                {yearPreview ? (
                  <p className="journey-rail-preview">
                    <strong>{yearPreview.title}</strong>
                    <em>{yearPreview.organization}</em>
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="journey-toolbar">
              {journey.display.showFilters ? (
                <div className="journey-filters" role="tablist" aria-label="Timeline filters">
                  {FILTERS.filter((item) => item.id === "all" || counts[item.id] > 0).map((item) => (
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
              ) : null}
              {journey.display.showSort ? (
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
              ) : null}
            </div>

            <ol className="journey-list">
              <span className="journey-line" style={{ transform: `scaleY(${progress})` }} aria-hidden="true" />
              {visible.map((item, index) => {
                const canOpen = item.showDetails && !item.detailsBlocked;
                return (
                  <li key={item.id} className={index === 0 ? "is-current" : undefined}>
                    <div className="journey-item-top">
                      <p className="journey-year">{item.year}</p>
                      <span className={`journey-tag is-${item.type}`}>{typeLabel(item.type)}</span>
                    </div>
                    <div className="journey-item-head">
                      <div>
                        <h3>{item.title}</h3>
                        <p className="journey-org">{item.organization}</p>
                      </div>
                      {item.logo ? (
                        <span className="journey-item-logo">
                          <Image src={item.logo} alt={`${item.organization} logo`} width={40} height={40} />
                        </span>
                      ) : null}
                    </div>
                    <p>{item.description}</p>
                    {canOpen ? (
                      <button type="button" className="journey-details" onClick={() => openDetails(item)}>
                        View details <RiArrowRightLine size={14} />
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ol>

            {!journey.display.showMoreCard ? (
              <div className="journey-foot">
                <Link href="/experience#experience-timeline" className="btn btn-outline btn-sm">
                  {journey.moreCta || "Open full timeline"} <RiArrowRightLine size={14} />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </Tag>

      {active ? (
        <div className="journey-drawer-layer" role="presentation" onClick={() => setActiveId(null)}>
          <aside
            className="journey-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="journey-drawer-top">
              <div className="journey-drawer-tags">
                <span className={`journey-tag is-${active.type}`}>{typeLabel(active.type)}</span>
                <span className="journey-drawer-period">{active.year}</span>
              </div>
              <button type="button" className="journey-drawer-close" aria-label="Close details" onClick={() => setActiveId(null)}>
                <RiCloseLine size={18} />
              </button>
            </div>

            <div className="journey-drawer-head">
              <div>
                <h3>{active.title}</h3>
                <p className="journey-drawer-org">
                  {active.organization}
                  {active.location ? (
                    <>
                      {" | "}
                      <RiMapPinLine size={13} /> {active.location}
                    </>
                  ) : null}
                  {active.status ? ` · ${active.status}` : null}
                </p>
              </div>
              {active.website ? (
                <a className="journey-drawer-logo" href={active.website} target="_blank" rel="noopener noreferrer">
                  {active.logo ? (
                    <Image src={active.logo} alt={`${active.organization} logo`} width={56} height={56} />
                  ) : (
                    active.organization.split(" ")[0]
                  )}
                </a>
              ) : (
                <span className="journey-drawer-logo">
                  {active.logo ? (
                    <Image src={active.logo} alt={`${active.organization} logo`} width={56} height={56} />
                  ) : (
                    active.organization.split(" ")[0]
                  )}
                </span>
              )}
            </div>

            <div className="journey-drawer-facts">
              {active.status ? (
                <div>
                  <RiLineChartLine size={16} />
                  <strong>{active.status}</strong>
                  <span>Status</span>
                </div>
              ) : null}
              {active.location ? (
                <div>
                  <RiMapPinLine size={16} />
                  <strong>{active.location.split(",")[0]}</strong>
                  <span>Location</span>
                </div>
              ) : null}
              <div>
                <RiBriefcaseLine size={16} />
                <strong>{typeLabel(active.type)}</strong>
                <span>Type</span>
              </div>
              <div>
                <RiCalendarLine size={16} />
                <strong>{active.year}</strong>
                <span>Duration</span>
              </div>
            </div>

            <div className="journey-drawer-tabs" role="tablist">
              {(
                [
                  ["overview", "Overview"],
                  ["contributions", "Key Contributions"],
                  ["projects", "Projects"],
                  ["skills", "Skills & Tools"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={detailTab === id}
                  className={detailTab === id ? "is-on" : undefined}
                  onClick={() => setDetailTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="journey-drawer-body">
              <div className="journey-drawer-main">
                {detailTab === "overview" ? (
                  <>
                    {active.summary ? (
                      <section>
                        <h4>About</h4>
                        <p>{active.summary}</p>
                      </section>
                    ) : null}
                    {active.highlights?.length ? (
                      <section>
                        <h4>My role</h4>
                        <ul>
                          {active.highlights.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </section>
                    ) : null}
                    <section>
                      <h4>Impact</h4>
                      <p>{active.description}</p>
                    </section>
                  </>
                ) : null}
                {detailTab === "contributions" ? (
                  <section>
                    <h4>Key contributions</h4>
                    {active.highlights?.length ? (
                      <ul>
                        {active.highlights.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No additional contribution list is published for this entry yet.</p>
                    )}
                  </section>
                ) : null}
                {detailTab === "projects" ? (
                  <section>
                    <h4>Related work</h4>
                    <p>Open the related projects path for verified systems connected to this period.</p>
                    <Link href={active.relatedHref || "/projects"} className="btn btn-outline btn-sm">
                      View related projects <RiArrowRightLine size={14} />
                    </Link>
                  </section>
                ) : null}
                {detailTab === "skills" ? (
                  <section>
                    <h4>Skills & tools</h4>
                    <p>
                      {active.industry
                        ? `Focus area: ${active.industry}. Skills stay tied to documented work rather than a generic stack list.`
                        : "Skills stay tied to documented work rather than a generic stack list."}
                    </p>
                  </section>
                ) : null}
              </div>

              <aside className="journey-drawer-meta">
                <div>
                  <RiCalendarLine size={15} />
                  <div>
                    <span>Duration</span>
                    <strong>{active.year}</strong>
                  </div>
                </div>
                <div>
                  <RiBriefcaseLine size={15} />
                  <div>
                    <span>Type</span>
                    <strong>{typeLabel(active.type)}</strong>
                  </div>
                </div>
                {active.location ? (
                  <div>
                    <RiMapPinLine size={15} />
                    <div>
                      <span>Location</span>
                      <strong>{active.location}</strong>
                    </div>
                  </div>
                ) : null}
                {active.website ? (
                  <div>
                    <RiLinkM size={15} />
                    <div>
                      <span>Website</span>
                      <strong>
                        <a href={active.website} target="_blank" rel="noopener noreferrer">
                          {active.website.replace(/^https?:\/\//, "")} <RiExternalLinkLine size={12} />
                        </a>
                      </strong>
                    </div>
                  </div>
                ) : null}
                {active.industry ? (
                  <div>
                    <RiLineChartLine size={15} />
                    <div>
                      <span>Industry</span>
                      <strong>{active.industry}</strong>
                    </div>
                  </div>
                ) : null}
                {active.team ? (
                  <div>
                    <RiGroupLine size={15} />
                    <div>
                      <span>Team</span>
                      <strong>{active.team}</strong>
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>

            <div className="journey-drawer-foot">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveId(null)}>
                <RiArrowLeftLine size={14} /> Back to timeline
              </button>
              <Link href={active.relatedHref || "/experience"} className="btn btn-primary btn-sm">
                View related projects <RiArrowRightLine size={14} />
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
