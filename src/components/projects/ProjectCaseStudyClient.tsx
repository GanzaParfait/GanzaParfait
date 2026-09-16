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
} from "react-icons/ri";
import { useMemo, useState } from "react";
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
  const shots = (project.screenshots || []).filter((src) => src && !src.includes("placeholder"));
  const cover = project.image && !project.image.includes("placeholder") ? project.image : shots[0];
  const category =
    project.category === "other" && project.categoryNote ? project.categoryNote : CATEGORY[project.category] || project.category;
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
  const [shot, setShot] = useState(0);
  const activeShot = shots[shot] || shots[0];

  return (
    <article className="case-study" data-page-section>
      <div className="container">
        <div className="case-nav">
          <Link href="/projects">
            <RiArrowLeftLine /> Back to projects
          </Link>
          <div>
            {previous ? (
              <Link href={`/projects/${previous.id}`}>
                <RiArrowLeftLine /> Previous
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/projects/${next.id}`}>
                Next <RiArrowRightLine />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="case-hero">
          <div>
            <p className="case-pill">{category}</p>
            <h1>{project.title}</h1>
            <p>{project.tagline || project.description}</p>
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
            <figure className="case-hero-shot">
              {cover ? <img src={cover} alt="" /> : <span>{project.title}</span>}
            </figure>
            {(project.flourish || "").trim() ? (
              <p className="case-flourish" aria-hidden="true">
                {project.flourish}
              </p>
            ) : null}
          </div>
        </div>

        <dl className="case-meta">
          {project.myRole ? (
            <div>
              <RiUser3Line />
              <div>
                <dt>My role</dt>
                <dd>{project.myRole}</dd>
              </div>
            </div>
          ) : null}
          {project.period || project.year ? (
            <div>
              <RiCalendarLine />
              <div>
                <dt>Duration</dt>
                <dd>{project.period || project.year}</dd>
              </div>
            </div>
          ) : null}
          {project.organization ? (
            <div>
              <RiBuilding2Line />
              <div>
                <dt>Client</dt>
                <dd>{project.organization}</dd>
              </div>
            </div>
          ) : null}
          <div>
            <RiStackLine />
            <div>
              <dt>Category</dt>
              <dd>{category}</dd>
            </div>
          </div>
          {project.technologies?.length ? (
            <div>
              <RiCodeBoxLine />
              <div>
                <dt>Tech stack</dt>
                <dd>{project.technologies.slice(0, 4).join(", ")}</dd>
              </div>
            </div>
          ) : null}
          <div>
            <RiCheckboxCircleLine />
            <div>
              <dt>Status</dt>
              <dd className={project.status === "live" ? "is-live" : undefined}>{STATUS[project.status]}</dd>
            </div>
          </div>
        </dl>

        <div className="case-layout">
          <div>
            <div className="case-tabs" role="tablist" aria-label="Case study sections">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={tab === item.id ? "is-on" : undefined}
                  onClick={() => setTab(item.id)}
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
                        {project.highlights.map((item) => (
                          <li key={item}>
                            <RiFileCopyLine /> {item}
                          </li>
                        ))}
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
                      {project.features.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{project.solution}</p>
                  )}
                </>
              )}
              {tab === "role" && (
                <>
                  <h2>My role</h2>
                  {project.myRole ? <p>{project.myRole}</p> : null}
                  {project.whatIBuilt ? <p>{project.whatIBuilt}</p> : null}
                </>
              )}
              {tab === "stack" && (
                <>
                  <h2>Tech stack</h2>
                  <ul className="case-list">
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
              {tab === "gallery" && activeShot && (
                <>
                  <h2>Project screenshots</h2>
                  <div className="case-gallery">
                    <button
                      type="button"
                      aria-label="Previous screenshot"
                      onClick={() => setShot((current) => (current - 1 + shots.length) % shots.length)}
                    >
                      <RiArrowLeftLine />
                    </button>
                    <figure>
                      <img src={activeShot} alt="" />
                      {project.screenshotCaptions?.[shot] ? <figcaption>{project.screenshotCaptions[shot]}</figcaption> : null}
                    </figure>
                    <button
                      type="button"
                      aria-label="Next screenshot"
                      onClick={() => setShot((current) => (current + 1) % shots.length)}
                    >
                      <RiArrowRightLine />
                    </button>
                  </div>
                  {shots.length > 1 ? (
                    <div className="case-thumbs" role="tablist" aria-label="Screenshot thumbnails">
                      {shots.map((src, thumbIndex) => (
                        <button
                          key={`${src}-${thumbIndex}`}
                          type="button"
                          className={thumbIndex === shot ? "is-on" : undefined}
                          aria-label={project.screenshotCaptions?.[thumbIndex] || `Screenshot ${thumbIndex + 1}`}
                          onClick={() => setShot(thumbIndex)}
                        >
                          <img src={src} alt="" />
                        </button>
                      ))}
                    </div>
                  ) : null}
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
          <aside>
            {project.quote ? (
              <blockquote>
                <p>“{project.quote}”</p>
                {project.quoteBy ? <footer>— {project.quoteBy}</footer> : null}
              </blockquote>
            ) : null}
            <Link href="/contact" className="btn btn-primary">
              Let&apos;s discuss a similar project <RiArrowRightLine />
            </Link>
            {project.caseStudyFile ? (
              <a className="btn btn-outline" href={project.caseStudyFile}>
                <RiDownloadLine /> Download case study
              </a>
            ) : null}
            <ShareActions
              title={`${project.title} by Prince Parfait GANZA`}
              excerpt={project.description}
              campaign={`project-${project.id}`}
              content={project.id}
            />
          </aside>
        </div>
      </div>
    </article>
  );
}
