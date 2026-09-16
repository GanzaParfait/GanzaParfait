"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiCodeSSlashLine,
  RiExternalLinkLine,
  RiMapPinLine,
  RiSearchLine,
} from "react-icons/ri";
import { useMemo, useState } from "react";
import { projects as seedProjects, type Project } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { projectCover, workCategoryLabel } from "@/components/work/work-media";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "web", label: "Web Apps" },
  { id: "systems", label: "Data Systems" },
  { id: "product", label: "Platforms" },
  { id: "tools", label: "Tools" },
  { id: "saas", label: "Company" },
  { id: "other", label: "Other" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const TOOL_CATEGORIES = new Set(["mobile", "ai", "open-source"]);

const APPROACH = [
  { step: "01", title: "Understand", body: "Explore the real problem." },
  { step: "02", title: "Build", body: "Turn ideas into working systems." },
  { step: "03", title: "Improve", body: "Keep iterating with people who use the work." },
];

function mergeProjects(records?: Project[]) {
  return seedProjects.map((item) => {
    const saved = records?.find((entry) => entry.id === item.id);
    return saved ? { ...item, ...saved, title: saved.title || item.title } : item;
  });
}

function matchesFilter(project: Project, filter: FilterId) {
  if (filter === "all") return true;
  if (filter === "tools") return TOOL_CATEGORIES.has(project.category);
  return project.category === filter;
}

function tagTone(category: Project["category"]) {
  if (category === "saas") return "is-company";
  if (category === "systems") return "is-systems";
  if (category === "product") return "is-platform";
  if (category === "web") return "is-web";
  return "is-other";
}

export default function ProjectsPageView() {
  const settings = useSiteSettings();
  const list = useMemo(() => mergeProjects(settings.projectRecords), [settings.projectRecords]);
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const location = settings.location || "Kigali, Rwanda";
  const company = list.find((item) => item.id === "lerony");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return list.filter((project) => {
      if (!matchesFilter(project, filter)) return false;
      if (!needle) return true;
      return [project.title, project.description, project.organization, project.myRole, ...(project.technologies || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [filter, list, query]);

  const gridProjects = filtered.filter((item) => item.id !== "lerony" || filter !== "all");

  return (
    <div className="projects-page">
      <section className="projects-hero" data-page-section aria-label="Work header">
        <div className="container projects-hero-grid">
          <AnimatedSection>
            <p className="section-label">Work</p>
            <h1>Projects &amp; Case Studies.</h1>
            <p className="projects-hero-copy">
              Case studies of software systems built for organizations and products. Client names appear only where the
              relationship is already public.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={80} className="projects-hero-rail" aria-hidden="true">
            <p>Ideas. Systems. Real impact.</p>
            <span />
          </AnimatedSection>
        </div>
      </section>

      <section className="projects-toolbar-section" data-page-section aria-label="Filter projects">
        <div className="container projects-toolbar">
          <div className="projects-filters" role="tablist" aria-label="Project categories">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={filter === item.id ? "is-on" : undefined}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="projects-search">
            <RiSearchLine size={16} aria-hidden="true" />
            <span className="sr-only">Search projects</span>
            <input
              type="search"
              placeholder="Search project..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="projects-grid-section" data-page-section aria-label="Project list">
        <div className="container">
          {gridProjects.length ? (
            <div className="projects-grid">
              {gridProjects.map((project, index) => (
                <AnimatedSection key={project.id} delay={Math.min(index, 8) * 40}>
                  <ProjectIndexCard project={project} location={location} />
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <p className="projects-empty">No projects match this filter.</p>
          )}
        </div>
      </section>

      {company && filter === "all" && !query.trim() ? (
        <section className="projects-company" data-page-section aria-label="Featured company">
          <div className="container projects-company-grid">
            <AnimatedSection>
              <p className="section-label">Featured company</p>
              <h2>{company.title}</h2>
              <p>{company.description}</p>
              <a className="btn btn-primary" href={company.links.live || "https://lerony.com"} target="_blank" rel="noopener noreferrer">
                Visit LERONY <RiArrowRightLine size={16} />
              </a>
            </AnimatedSection>
            <AnimatedSection delay={80} className="projects-company-visual">
              {projectCover(company) ? (
                <img src={projectCover(company)} alt="" />
              ) : (
                <div className="projects-company-fallback" aria-hidden="true">
                  LERONY
                </div>
              )}
            </AnimatedSection>
          </div>
        </section>
      ) : null}

      <section className="projects-approach" data-page-section aria-label="My approach">
        <div className="container projects-approach-grid">
          <AnimatedSection>
            <p className="section-label">My approach</p>
            <h2>From problem to impact.</h2>
            <p>A practical path from a real organizational need to a system people can operate.</p>
          </AnimatedSection>
          <AnimatedSection delay={70} className="projects-approach-steps">
            {APPROACH.map((item) => (
              <article key={item.step}>
                <span>{item.step}</span>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </article>
            ))}
          </AnimatedSection>
        </div>
      </section>

      <section className="projects-cta" data-page-section aria-label="Start a conversation">
        <div className="container projects-cta-grid">
          <AnimatedSection>
            <p className="section-label">Let&apos;s work together</p>
            <h2>Have a project in mind?</h2>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Start a conversation <RiArrowRightLine size={16} />
            </Link>
          </AnimatedSection>
          <ol className="projects-cta-rail" aria-hidden="true">
            {["Ideas", "Systems", "Impact"].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

function ProjectIndexCard({ project, location }: { project: Project; location: string }) {
  const cover = projectCover(project);
  const category = workCategoryLabel(project);
  const metaLeft = project.myRole || project.organization || location;

  return (
    <article className="projects-card">
      <Link href={`/projects/${project.id}`} className="projects-card-media" aria-label={`Open ${project.title}`}>
        {cover ? <img src={cover} alt="" loading="lazy" decoding="async" /> : <span>{project.title}</span>}
      </Link>
      <div className="projects-card-body">
        <em className={`projects-card-tag ${tagTone(project.category)}`}>{category}</em>
        <h3>
          <Link href={`/projects/${project.id}`}>{project.title}</Link>
          {project.links?.live ? (
            <a href={project.links.live} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} live site`}>
              <RiExternalLinkLine size={15} />
            </a>
          ) : null}
        </h3>
        <p>{project.description}</p>
        <div className="projects-card-meta">
          <span>
            {project.organization ? <RiCodeSSlashLine size={13} /> : <RiMapPinLine size={13} />}
            {metaLeft}
          </span>
          {project.period || project.year ? <span>{project.period || project.year}</span> : null}
        </div>
      </div>
    </article>
  );
}
