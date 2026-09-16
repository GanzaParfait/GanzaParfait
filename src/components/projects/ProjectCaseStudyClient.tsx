"use client";

import Link from "next/link";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiExternalLinkLine,
  RiGithubFill,
  RiBuilding2Line,
  RiUser3Line,
  RiCalendarLine,
  RiStackLine,
  RiCodeBoxLine,
  RiCheckboxCircleLine,
  RiDownloadLine,
  RiFileCopyLine,
  RiPlayFill,
  RiShieldCheckLine,
  RiDatabase2Line,
  RiBarChartBoxLine,
  RiSettings3Line,
  RiTeamLine,
  RiFlashlightLine,
} from "react-icons/ri";
import { useMemo, useState, type ReactNode } from "react";
import { Project, projects as defaultProjects } from "@/data/site-data";
import ShareActions from "@/components/ui/ShareActions";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function PosterVideo({ src, poster, title }: { src: string; poster?: string; title: string }) {
  const [ready, setReady] = useState(false);
  if (!ready) {
    return (
      <button type="button" className="poster-video" onClick={() => setReady(true)} aria-label={`Play ${title}`}>
        {poster ? <img src={poster} alt="" /> : <span className="announcement-video-fallback" style={{ minHeight: "16rem" }} />}
        <span>
          <RiPlayFill size={26} />
        </span>
      </button>
    );
  }
  return (
    <video
      src={src}
      poster={poster}
      controls
      autoPlay
      preload="metadata"
      playsInline
      style={{ width: "100%", borderRadius: "1rem" }}
    />
  );
}

const STATUS = { live: "Live", "in-progress": "In progress", archived: "Archived" };
const CATEGORY: Record<string, string> = {
  web: "Web app",
  mobile: "Mobile",
  ai: "AI-enabled",
  saas: "Company",
  "open-source": "Open source",
  systems: "Systems",
  product: "Product",
  other: "Other",
};

const HIGHLIGHT_ICONS = [
  RiShieldCheckLine,
  RiDatabase2Line,
  RiBarChartBoxLine,
  RiSettings3Line,
  RiTeamLine,
  RiFlashlightLine,
  RiFileCopyLine,
  RiCodeBoxLine,
];

function MetaItem({
  icon,
  label,
  value,
  live,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  live?: boolean;
}) {
  return (
    <div className="case-meta-item">
      <span className="case-meta-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <dt>{label}</dt>
        <dd className={live ? "is-live" : undefined}>{value}</dd>
      </div>
    </div>
  );
}

export default function ProjectCaseStudyClient({ project: seed }: { project: Project }) {
  const settings = useSiteSettings();
  const project = useMemo(() => {
    const saved = settings.projectRecords?.find((item) => item.id === seed.id);
    return saved
      ? { ...seed, ...saved, title: saved.title || seed.title, description: saved.description || seed.description }
      : seed;
  }, [seed, settings.projectRecords]);

  const list = useMemo(
    () => defaultProjects.map((item) => settings.projectRecords?.find((savedItem) => savedItem.id === item.id) || item),
    [settings.projectRecords],
  );
  const index = list.findIndex((item) => item.id === project.id);
  const previous = index > 0 ? list[index - 1] : null;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;
  const shots = (project.screenshots?.length ? project.screenshots : project.image ? [project.image] : []).filter(
    (src) => src && !src.includes("placeholder"),
  );
  const cover = project.image && !project.image.includes("placeholder") ? project.image : shots[0];
  const category =
    project.category === "other" && project.categoryNote ? project.categoryNote : CATEGORY[project.category] || project.category;
  const flourish = (project.flourish || "").trim() || "Data People Impact";
  const tabs = [
    { id: "overview", label: "Overview", show: Boolean(project.longDescription || project.description || project.context || project.highlights?.length) },
    { id: "features", label: "Features", show: Boolean(project.features?.length || project.solution) },
    { id: "role", label: "My Role", show: Boolean(project.myRole || project.whatIBuilt) },
    { id: "stack", label: "Tech Stack", show: Boolean(project.technologies?.length) },
    { id: "results", label: "Results", show: Boolean(project.outcome || project.result) },
    { id: "gallery", label: "Gallery", show: shots.length > 0 },
    { id: "challenges", label: "Challenges", show: Boolean(project.challenge || project.problem) },
    { id: "learned", label: "What I Learned", show: Boolean(project.learned) },
  ].filter((tab) => tab.show);
  const [tab, setTab] = useState(tabs[0]?.id || "overview");
  const [shotStart, setShotStart] = useState(0);
  const visibleShots = Math.min(4, shots.length);
  const shotWindow = shots.slice(shotStart, shotStart + visibleShots);

  const shiftGallery = (delta: number) => {
    if (shots.length <= visibleShots) return;
    setShotStart((current) => {
      const nextIndex = current + delta;
      if (nextIndex < 0) return Math.max(0, shots.length - visibleShots);
      if (nextIndex > shots.length - visibleShots) return 0;
      return nextIndex;
    });
  };

  return (
    <article className="case-study">
      <div className="container">
        <div className="case-nav" data-page-section>
          <Link href="/projects" className="case-nav-link">
            <RiArrowLeftLine size={16} /> Back to projects
          </Link>
          <div className="case-nav-peers">
            {previous ? (
              <Link href={`/projects/${previous.id}`} className="case-nav-link">
                <RiArrowLeftLine size={16} /> Previous
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/projects/${next.id}`} className="case-nav-link">
                Next <RiArrowRightLine size={16} />
              </Link>
            ) : null}
          </div>
        </div>

        <header className="case-hero" data-page-section>
          <div className="case-hero-copy">
            <p className="case-pill">{category}</p>
            <h1>{project.title}</h1>
            <p className="case-hero-lead">{project.tagline || project.description}</p>
            <div className="case-actions">
              {project.links?.live ? (
                <a className="btn btn-primary" href={project.links.live} target="_blank" rel="noopener noreferrer">
                  Visit live site <RiExternalLinkLine size={16} />
                </a>
              ) : null}
              {project.links?.github ? (
                <a className="btn btn-outline" href={project.links.github} target="_blank" rel="noopener noreferrer">
                  <RiGithubFill size={16} /> View source code
                </a>
              ) : null}
            </div>
          </div>
          <div className="case-hero-visual">
            <div className="case-hero-glow" aria-hidden="true" />
            <figure className="case-hero-shot">
              {cover ? <img src={cover} alt="" /> : <span>{project.title}</span>}
            </figure>
            <p className="case-flourish" aria-hidden="true">
              {flourish}
            </p>
          </div>
        </header>

        <dl className="case-meta" data-page-section>
          {project.myRole ? (
            <MetaItem icon={<RiUser3Line size={18} />} label="My role" value={project.myRole} />
          ) : null}
          {project.period || project.year ? (
            <MetaItem icon={<RiCalendarLine size={18} />} label="Duration" value={String(project.period || project.year)} />
          ) : null}
          {project.organization ? (
            <MetaItem icon={<RiBuilding2Line size={18} />} label="Client" value={project.organization} />
          ) : null}
          <MetaItem icon={<RiStackLine size={18} />} label="Category" value={category} />
          {project.technologies?.length ? (
            <MetaItem
              icon={<RiCodeBoxLine size={18} />}
              label="Tech stack"
              value={project.technologies.slice(0, 4).join(", ")}
            />
          ) : null}
          <MetaItem
            icon={<RiCheckboxCircleLine size={18} />}
            label="Status"
            value={STATUS[project.status]}
            live={project.status === "live"}
          />
        </dl>

        <div className="case-layout" data-page-section>
          <div className="case-main">
            <div className="case-tabs" role="tablist" aria-label="Case study sections">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={tab === item.id ? "is-on" : undefined}
                  onClick={() => {
                    setTab(item.id);
                    if (item.id === "gallery") {
                      window.requestAnimationFrame(() => {
                        document.getElementById("case-shots")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      });
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="case-panel" role="tabpanel">
              {tab === "overview" && (
                <>
                  <h2>Project overview</h2>
                  <p>{project.longDescription || project.context || project.description}</p>
                  {project.highlights?.length ? (
                    <div className="case-highlights">
                      <h3>Key highlights</h3>
                      <ul>
                        {project.highlights.map((item, highlightIndex) => {
                          const Icon = HIGHLIGHT_ICONS[highlightIndex % HIGHLIGHT_ICONS.length];
                          return (
                            <li key={item}>
                              <span className="case-highlight-icon" aria-hidden="true">
                                <Icon size={16} />
                              </span>
                              <span>{item}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </>
              )}
              {tab === "features" && (
                <>
                  <h2>Features</h2>
                  {project.features?.length ? (
                    <ul className="case-list">
                      {project.features.map((item, featureIndex) => {
                        const Icon = HIGHLIGHT_ICONS[featureIndex % HIGHLIGHT_ICONS.length];
                        return (
                          <li key={item}>
                            <span className="case-highlight-icon" aria-hidden="true">
                              <Icon size={16} />
                            </span>
                            <span>{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p>{project.solution}</p>
                  )}
                </>
              )}
              {tab === "role" && (
                <>
                  <h2>My role</h2>
                  {project.myRole ? <p className="case-role-title">{project.myRole}</p> : null}
                  {project.whatIBuilt ? <p>{project.whatIBuilt}</p> : null}
                </>
              )}
              {tab === "stack" && (
                <>
                  <h2>Tech stack</h2>
                  <ul className="case-tech">
                    {project.technologies.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
              {tab === "results" && (
                <>
                  <h2>Results</h2>
                  <p>{project.outcome || project.result}</p>
                </>
              )}
              {tab === "gallery" && shots.length > 0 && (
                <>
                  <h2>Project screenshots</h2>
                  <p className="case-gallery-note">The screenshot gallery is shown below this section.</p>
                </>
              )}
              {tab === "challenges" && (
                <>
                  <h2>Challenges</h2>
                  <p>{project.challenge || project.problem}</p>
                </>
              )}
              {tab === "learned" && (
                <>
                  <h2>What I learned</h2>
                  <p>{project.learned}</p>
                </>
              )}
            </div>

            {(project.videos?.length ? project.videos : project.video ? [project.video] : []).map((src) => (
              <div className="case-video" key={src}>
                <PosterVideo src={src} poster={project.videoPoster || cover} title={project.title} />
              </div>
            ))}
          </div>

          <aside className="case-aside">
            <div className="case-aside-card">
              {project.organization ? <p className="case-aside-org">{project.organization}</p> : null}
              {project.quote ? (
                <blockquote>
                  <p>“{project.quote}”</p>
                  {project.quoteBy ? <footer>— {project.quoteBy}</footer> : null}
                </blockquote>
              ) : (
                <p className="case-aside-fallback">
                  Built as documented work for {project.organization || "this engagement"}. Discuss a similar system when you are ready.
                </p>
              )}
              <Link href="/contact" className="btn btn-primary">
                Let&apos;s discuss a similar project <RiArrowRightLine size={16} />
              </Link>
              {project.caseStudyFile ? (
                <a className="btn btn-outline" href={project.caseStudyFile}>
                  <RiDownloadLine size={16} /> Download case study (PDF)
                </a>
              ) : null}
            </div>
            <ShareActions
              title={`${project.title} by Prince Parfait GANZA`}
              excerpt={project.description}
              campaign={`project-${project.id}`}
              content={project.id}
            />
          </aside>
        </div>

        {shots.length > 0 ? (
          <section className="case-shots" id="case-shots" data-page-section aria-label="Project screenshots">
            <div className="case-shots-head">
              <h2>Project screenshots</h2>
              {shots.length > visibleShots ? (
                <div className="case-shots-nav">
                  <button type="button" aria-label="Previous screenshots" onClick={() => shiftGallery(-1)}>
                    <RiArrowLeftLine size={16} />
                  </button>
                  <button type="button" aria-label="Next screenshots" onClick={() => shiftGallery(1)}>
                    <RiArrowRightLine size={16} />
                  </button>
                </div>
              ) : null}
            </div>
            <div className="case-shots-track">
              {shotWindow.map((src, windowIndex) => {
                const absolute = shotStart + windowIndex;
                return (
                  <figure key={`${src}-${absolute}`}>
                    <img src={src} alt="" loading="lazy" decoding="async" />
                    <figcaption>{project.screenshotCaptions?.[absolute] || `View ${absolute + 1}`}</figcaption>
                  </figure>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
