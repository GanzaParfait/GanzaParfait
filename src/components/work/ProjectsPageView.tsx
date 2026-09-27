"use client";

import Link from "next/link";
import {
  RiArrowDownSLine,
  RiArrowRightLine,
  RiBuilding2Line,
  RiGlobeLine,
  RiLoader4Line,
  RiSearchLine,
  RiStackLine,
} from "react-icons/ri";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Project } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CustomSelect from "@/components/ui/CustomSelect";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { projectCover, projectImages } from "@/components/work/work-media";
import WorkProjectCard from "@/components/work/WorkProjectCard";
import { listListedProjects } from "@/lib/projects";

const PRIMARY_FILTERS = [
  { id: "all", label: "All" },
  { id: "client", label: "Client Work" },
  { id: "ventures", label: "Products & Ventures" },
  { id: "research", label: "Research & Data" },
] as const;

const MORE_FILTERS = [
  { id: "web", label: "Web Platforms" },
  { id: "systems", label: "Data Systems" },
  { id: "technology", label: "Technology" },
  { id: "product", label: "Product" },
  { id: "other", label: "Other" },
] as const;

type FilterId =
  | (typeof PRIMARY_FILTERS)[number]["id"]
  | (typeof MORE_FILTERS)[number]["id"];

type SortId = "recent" | "featured" | "az";

const BATCH = 10;
const FILTER_DELAY_MS = 500;
const AUTO_BATCHES = 3;

const ALL_FILTER_IDS = new Set<string>([...PRIMARY_FILTERS, ...MORE_FILTERS].map((item) => item.id));

function parseFilterId(value: string | null | undefined): FilterId {
  if (value && ALL_FILTER_IDS.has(value)) return value as FilterId;
  return "all";
}

function parseSortId(value: string | null | undefined): SortId {
  if (value === "featured" || value === "az") return value;
  return "recent";
}

function inferredWorkGroup(project: Project): NonNullable<Project["workGroup"]> {
  if (project.workGroup) return project.workGroup;
  if (project.id === "goa-plus" || project.id === "lerony" || project.independent || project.category === "technology") {
    return "ventures";
  }
  if (project.id === "askfield" || project.id === "caritas-systems") return "research";
  if (project.deliveredThrough === "LERONY Ltd" && project.contribution === "contributor") return "client";
  if (project.category === "systems" || project.category === "product") return "client";
  return "web";
}

function matchesType(project: Project, filter: FilterId) {
  if (filter === "all") return true;
  if (filter === "ventures" || filter === "client" || filter === "research" || filter === "web") {
    return inferredWorkGroup(project) === filter;
  }
  return project.category === filter;
}

function projectYear(project: Project) {
  if (typeof project.year === "number") return project.year;
  const match = (project.period || "").match(/(20\d{2})/);
  return match ? Number(match[1]) : 0;
}

function sortProjects(list: Project[], sort: SortId) {
  const next = [...list];
  if (sort === "az") {
    next.sort((a, b) => a.title.localeCompare(b.title));
    return next;
  }
  if (sort === "featured") {
    next.sort((a, b) => Number(b.featured) - Number(a.featured) || projectYear(b) - projectYear(a));
    return next;
  }
  next.sort((a, b) => {
    const featured = Number(b.featured) - Number(a.featured);
    if (featured) return featured;
    return projectYear(b) - projectYear(a) || a.title.localeCompare(b.title);
  });
  return next;
}

function readParams() {
  if (typeof window === "undefined") {
    return { type: "all" as FilterId, q: "", sort: "recent" as SortId, focused: false };
  }
  const params = new URLSearchParams(window.location.search);
  const type = parseFilterId(params.get("focus") || params.get("type") || params.get("category"));
  const sort = parseSortId(params.get("sort"));
  const q = params.get("q") || params.get("tech") || "";
  return {
    type,
    q,
    sort,
    focused: Boolean((type !== "all") || q.trim()),
  };
}

function writeParams(type: FilterId, q: string, sort: SortId) {
  const params = new URLSearchParams();
  if (type !== "all") params.set("focus", type);
  if (q.trim()) params.set("q", q.trim());
  if (sort !== "recent") params.set("sort", sort);
  const next = params.toString();
  const url = next ? `/projects?${next}` : "/projects";
  window.history.replaceState(null, "", url);
}

function scrollToProjectsGrid() {
  const node = document.getElementById("projects-grid");
  if (!node) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
}

function shortDescription(project: Project) {
  const text = (project.tagline || project.description || "").trim();
  if (text.length <= 110) return text;
  const cut = text.slice(0, 107);
  const boundary = cut.lastIndexOf(" ");
  return `${(boundary > 60 ? cut.slice(0, boundary) : cut).trim()}…`;
}

function isInProgress(project: Project) {
  return project.status === "in-progress" || project.status === "ongoing" || project.status === "staging";
}

export type ProjectsPageViewProps = {
  initialFocus?: string | null;
  initialQuery?: string | null;
  initialSort?: string | null;
};

export default function ProjectsPageView({
  initialFocus = null,
  initialQuery = null,
  initialSort = null,
}: ProjectsPageViewProps) {
  const settings = useSiteSettings();
  const list = useMemo(() => listListedProjects(settings.projectRecords), [settings.projectRecords]);

  const boot = useMemo(() => {
    const type = parseFilterId(initialFocus);
    const q = (initialQuery || "").trim();
    const sort = parseSortId(initialSort);
    return {
      type,
      q,
      sort,
      focused: Boolean(type !== "all" || q),
    };
  }, [initialFocus, initialQuery, initialSort]);

  const [filter, setFilter] = useState<FilterId>(boot.type);
  const [query, setQuery] = useState(boot.q);
  const [queryInput, setQueryInput] = useState(boot.q);
  const [sort, setSort] = useState<SortId>(boot.sort);
  const [moreOpen, setMoreOpen] = useState(false);
  const [filtering, setFiltering] = useState(boot.focused);
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const [autoBatches, setAutoBatches] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const filterTimer = useRef<number | null>(null);
  const searchTimer = useRef<number | null>(null);
  const skipUrlWrite = useRef(true);

  const runWithLoader = useCallback((action: () => void, scroll = false) => {
    setFiltering(true);
    if (filterTimer.current) window.clearTimeout(filterTimer.current);
    filterTimer.current = window.setTimeout(() => {
      action();
      setFiltering(false);
      filterTimer.current = null;
      if (scroll) {
        window.setTimeout(() => scrollToProjectsGrid(), 40);
      }
    }, FILTER_DELAY_MS);
  }, []);

  useEffect(() => {
    skipUrlWrite.current = false;
    if (!boot.focused) return;

    setFiltering(true);
    const timer = window.setTimeout(() => {
      setFiltering(false);
      window.setTimeout(() => scrollToProjectsGrid(), 40);
    }, FILTER_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [boot.focused]);

  useEffect(() => {
    return () => {
      if (filterTimer.current) window.clearTimeout(filterTimer.current);
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, []);

  useEffect(() => {
    if (skipUrlWrite.current) return;
    writeParams(filter, query, sort);
    setVisibleCount(BATCH);
    setAutoBatches(0);
  }, [filter, query, sort]);

  useEffect(() => {
    const onPop = () => {
      const next = readParams();
      runWithLoader(() => {
        setFilter(next.type);
        setQuery(next.q);
        setQueryInput(next.q);
        setSort(next.sort);
      }, next.focused);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [runWithLoader]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [moreOpen]);

  const onSearchChange = (value: string) => {
    setQueryInput(value);
    setFiltering(true);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setQuery(value);
      setFiltering(false);
      searchTimer.current = null;
    }, FILTER_DELAY_MS);
  };

  const selectFilter = (next: FilterId) => {
    runWithLoader(() => {
      setFilter(next);
      setMoreOpen(false);
    }, next !== "all");
  };

  const selectSort = (next: SortId) => {
    runWithLoader(() => setSort(next));
  };

  const archiveList = useMemo(
    () => list.filter((item) => item.id !== "lerony"),
    [list],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = archiveList.filter((project) => {
      if (!matchesType(project, filter)) return false;
      if (!needle) return true;
      const techHit = (project.technologies || []).some((item) => item.toLowerCase() === needle);
      if (techHit) return true;
      return [project.title, project.description, project.organization, project.myRole, project.domain, project.tagline, ...(project.technologies || []), ...(project.capabilities || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    return sortProjects(matched, sort);
  }, [archiveList, filter, query, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const showLoadMore = hasMore && autoBatches >= AUTO_BATCHES;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(filtered.length, count + BATCH));
    setAutoBatches((count) => count + 1);
  }, [filtered.length]);

  useEffect(() => {
    if (!hasMore || showLoadMore || filtering) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, showLoadMore, loadMore, visible.length, filtering]);

  const stats = useMemo(() => {
    const count = archiveList.length;
    const orgs = new Set(
      archiveList.map((item) => (item.organization || "").trim()).filter(Boolean),
    ).size;
    return {
      projects: count,
      organizations: orgs,
    };
  }, [archiveList]);

  const moreActive = MORE_FILTERS.some((item) => item.id === filter);
  const clearFilters = () => {
    runWithLoader(() => {
      setFilter("all");
      setQuery("");
      setQueryInput("");
      setSort("recent");
      setMoreOpen(false);
    });
  };

  return (
    <div className="projects-page">
      <section className="projects-hero" data-page-section aria-label="Work header">
        <div className="container projects-hero-grid">
          <AnimatedSection className="projects-hero-main">
            <p className="section-label">Work</p>
            <h1>Projects &amp; Case Studies.</h1>
            <p className="projects-hero-copy">
              Software systems, products, platforms, research and data work, and organizational solutions built for real
              operational needs.
            </p>
            <ul className="projects-hero-stats">
              <li>
                <RiStackLine size={16} aria-hidden="true" />
                <span>
                  <strong>{stats.projects}+</strong> Projects &amp; systems
                </span>
              </li>
              <li>
                <RiBuilding2Line size={16} aria-hidden="true" />
                <span>
                  <strong>{Math.max(stats.organizations, 1)}</strong> Organizations &amp; ventures
                </span>
              </li>
              <li>
                <RiGlobeLine size={16} aria-hidden="true" />
                <span>
                  <strong>Rwanda +</strong> international work
                </span>
              </li>
            </ul>
          </AnimatedSection>
          <AnimatedSection delay={80} className="projects-hero-aside" aria-hidden="true">
            <div className="projects-hero-map" />
            <p>
              Ideas. Systems.
              <br />
              <em>Real impact.</em>
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section
        className={`projects-toolbar-section${filtering ? " is-loading" : ""}`}
        data-page-section
        aria-label="Filter projects"
      >
        <div className={`container projects-toolbar${filtering ? " is-loading" : ""}`}>
          <div className="projects-filters" role="tablist" aria-label="Project categories">
            <div className="projects-filters-track">
              {PRIMARY_FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.id}
                  className={filter === item.id ? "is-on" : undefined}
                  disabled={filtering}
                  onClick={() => selectFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="projects-more-wrap" ref={moreRef}>
              <button
                type="button"
                className={moreActive || moreOpen ? "is-on" : undefined}
                aria-expanded={moreOpen}
                aria-haspopup="listbox"
                disabled={filtering}
                onClick={() => setMoreOpen((open) => !open)}
              >
                More filters <RiArrowDownSLine size={16} aria-hidden="true" />
              </button>
              {moreOpen ? (
                <div className="projects-more-menu" role="listbox" aria-label="More filters">
                  {MORE_FILTERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={filter === item.id}
                      className={filter === item.id ? "is-on" : undefined}
                      disabled={filtering}
                      onClick={() => selectFilter(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="projects-toolbar-tools">
            <label className="projects-search">
              <RiSearchLine size={16} aria-hidden="true" />
              <span className="sr-only">Search projects</span>
              <input
                type="search"
                placeholder="Search projects..."
                value={queryInput}
                onChange={(event) => onSearchChange(event.target.value)}
              />
              {filtering ? <RiLoader4Line className="projects-search-spin" size={16} aria-label="Filtering" /> : null}
            </label>
            <div className="journey-sort projects-sort">
              <span className="sr-only">Sort projects</span>
              <CustomSelect
                value={sort}
                aria-label="Sort projects"
                searchable={false}
                options={[
                  { value: "recent", label: "Most recent" },
                  { value: "featured", label: "Featured first" },
                  { value: "az", label: "A–Z" },
                ]}
                onChange={(value) => selectSort(value as SortId)}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className={`projects-grid-section${filtering ? " is-loading" : ""}`}
        id="projects-grid"
        data-page-section
        aria-label="Project list"
        aria-busy={filtering}
      >
        <div className="container">
          {visible.length ? (
            <>
              <div className="selected-stage projects-archive">
                <div className="selected-featured">
                  <ArchiveCard project={visible[0]} number={1} wide />
                </div>
                {visible.length > 1 ? (
                  <div className="selected-rest">
                    {visible.slice(1).map((project, index) => (
                      <ArchiveCard
                        key={project.id}
                        project={project}
                        number={index + 2}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              {hasMore ? (
                <div className="projects-load" ref={sentinelRef}>
                  {showLoadMore ? (
                    <button type="button" className="btn btn-outline" onClick={loadMore} disabled={filtering}>
                      Load more projects
                    </button>
                  ) : (
                    <div className="projects-skel-row" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                </div>
              ) : null}
            </>
          ) : filtering ? (
            <div className="projects-loading" role="status" aria-live="polite">
              <RiLoader4Line className="projects-search-spin" size={22} aria-hidden="true" />
              <span>Updating projects…</span>
            </div>
          ) : (
            <div className="projects-empty" role="status">
              <p>No projects match these filters.</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="projects-cta" data-page-section aria-label="Start a conversation">
        <div className="container projects-cta-grid">
          <div className="projects-cta-copy">
            <p className="section-label">Let&apos;s work together</p>
            <h2>Have a project in mind?</h2>
          </div>
          <div className="projects-cta-actions">
            <Link href="/contact" className="btn btn-primary">
              Start a conversation <RiArrowRightLine size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArchiveCard({
  project,
  number,
  wide = false,
}: {
  project: Project;
  number: number;
  wide?: boolean;
}) {
  const cover = projectCover(project);
  const images = projectImages(project);
  const line = project.tagline && project.tagline !== project.description ? project.tagline : undefined;

  return (
    <WorkProjectCard
      project={project}
      number={number}
      title={project.title}
      line={wide ? line : undefined}
      body={wide ? project.description : shortDescription(project)}
      href={`/projects/${project.id}`}
      cover={cover || project.image || ""}
      extras={wide ? images.filter((src) => src !== (cover || project.image)).slice(0, 2).map((src) => ({ src })) : undefined}
      mediaCount={images.length}
      wide={wide}
      locked={isInProgress(project)}
    />
  );
}
