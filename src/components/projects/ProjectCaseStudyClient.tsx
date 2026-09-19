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
import { type Project } from "@/data/site-data";
import ShareActions from "@/components/ui/ShareActions";
import MediaPreview, { type PreviewItem } from "@/components/ui/MediaPreview";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { isVideoUrl, mergeProjectCatalog } from "@/lib/projects";

function PosterVideo({ src, poster, title }: { src: string; poster?: string; title: string }) {
  const [ready, setReady] = useState(false);
  if (!ready) {
    return (
      <button type="button" className="poster-video" onClick={() => setReady(true)} aria-label={`Play ${title}`}>
        {poster ? <img src={poster} alt="" /> : <span className="announcement-video-fallback" style={{ minHeight: "12rem" }} />}
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
      className="case-media-video"
    />
  );
}

const STATUS = { live: "Live", "in-progress": "In progress", archived: "Archived" };
const CATEGORY: Record<string, string> = {
  web: "Web app",
  mobile: "Mobile",
  ai: "AI-enabled",
  saas: "Company",
  technology: "Technology & Innovation",
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

type MediaItem = { type: "image" | "video"; src: string; caption: string };

export default function ProjectCaseStudyClient({ project: seed }: { project: Project }) {
  const settings = useSiteSettings();
  const project = useMemo(() => {
    const saved = settings.projectRecords?.find((item) => item.id === seed.id);
    return saved
      ? { ...seed, ...saved, title: saved.title || seed.title, description: saved.description || seed.description }
      : seed;
  }, [seed, settings.projectRecords]);

  const list = useMemo(() => mergeProjectCatalog(settings.projectRecords), [settings.projectRecords]);
  const index = list.findIndex((item) => item.id === project.id);
  const previous = index > 0 ? list[index - 1] : null;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;

  const cover = project.image && !project.image.includes("placeholder") ? project.image : undefined;
  const category =
    project.category === "other" && project.categoryNote ? project.categoryNote : CATEGORY[project.category] || project.category;
  const flourish = (project.flourish || "").trim() || "Data People Impact";

  const mediaItems = useMemo<MediaItem[]>(() => {
    const pinned = (project.pinnedMedia || []).filter((src) => src && !src.includes("placeholder"));
    const shots = (project.screenshots?.length ? project.screenshots : cover ? [cover] : []).filter(
      (src) => src && !src.includes("placeholder"),
    );
    const orderedImages = [...pinned.filter((src) => !isVideoUrl(src)), ...shots].filter(
      (src, index, all) => all.indexOf(src) === index,
    );
    const images: MediaItem[] = orderedImages.map((src, absolute) => ({
      type: "image",
      src,
      caption: project.screenshotCaptions?.[absolute] || `View ${absolute + 1}`,
    }));
    const pinnedVideos = pinned.filter(isVideoUrl);
    const videos = [
      ...pinnedVideos,
      ...(project.videos?.length ? project.videos : project.video ? [project.video] : []),
    ].filter((src, index, all) => src && all.indexOf(src) === index);
    const videoItems: MediaItem[] = videos.map((src, videoIndex) => ({
      type: "video",
      src,
      caption: `Video ${videoIndex + 1}`,
    }));
    return [...images, ...videoItems];
  }, [cover, project.pinnedMedia, project.screenshotCaptions, project.screenshots, project.video, project.videos]);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      show: Boolean(project.longDescription || project.description || project.context || project.highlights?.length),
    },
    { id: "challenges", label: "Challenge", show: Boolean(project.challenge || project.problem) },
    { id: "role", label: "My role", show: Boolean(project.myRole || project.whatIBuilt) },
    { id: "features", label: "Process", show: Boolean(project.features?.length || project.solution) },
    { id: "stack", label: "Architecture", show: Boolean(project.technologies?.length || project.capabilities?.length || project.websiteTechnologies?.length) },
    { id: "media", label: "Screens", show: mediaItems.length > 0 },
    { id: "results", label: "Outcome", show: Boolean(project.outcome || project.result) },
    { id: "learned", label: "Lessons", show: Boolean(project.learned) },
  ].filter((tab) => tab.show);
  const [tab, setTab] = useState(tabs[0]?.id || "overview");
  const [shotStart, setShotStart] = useState(0);
  const [previewStart, setPreviewStart] = useState<number | null>(null);
  const visibleShots = Math.min(4, mediaItems.length);
  const shotWindow = mediaItems.slice(shotStart, shotStart + visibleShots);
  const previewItems = useMemo<PreviewItem[]>(
    () =>
      mediaItems.map((item) => ({
        src: item.src,
        kind: item.type,
        caption: item.caption,
      })),
    [mediaItems],
  );

  const openPreview = (absoluteIndex: number) => {
    setPreviewStart(absoluteIndex);
  };

  const shiftGallery = (delta: number) => {
    if (mediaItems.length <= visibleShots) return;
    setShotStart((current) => {
      const nextIndex = current + delta;
      if (nextIndex < 0) return Math.max(0, mediaItems.length - visibleShots);
      if (nextIndex > mediaItems.length - visibleShots) return 0;
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
            <button
              type="button"
              className="case-hero-shot"
              onClick={() => openPreview(0)}
              aria-label={`View ${project.title} media`}
              disabled={!mediaItems.length && !cover}
            >
              {cover ? <img src={cover} alt="" /> : <span>{project.title}</span>}
            </button>
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
                    if (item.id === "media") {
                      window.requestAnimationFrame(() => {
                        document.getElementById("case-media")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                  <p>{project.longDescription || project.description}</p>
                  {project.context ? (
                    <div className="case-context">
                      <h3>Context</h3>
                      <p>{project.context}</p>
                    </div>
                  ) : null}
                  {project.highlights?.length ? (
                    <div className="case-highlights">
                      <h3>Key decisions</h3>
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
                  <h2>Process &amp; solution</h2>
                  {project.solution ? <p>{project.solution}</p> : null}
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
                  ) : null}
                </>
              )}
              {tab === "role" && (
                <>
                  <h2>My responsibility</h2>
                  {project.myRole ? <p className="case-role-title">{project.myRole}</p> : null}
                  {project.whatIBuilt ? <p>{project.whatIBuilt}</p> : null}
                </>
              )}
              {tab === "stack" && (
                <>
                  {project.capabilities?.length ? (
                    <>
                      <h2>Capabilities</h2>
                      <ul className="case-tech">
                        {project.capabilities.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  <h2>{project.capabilities?.length ? "Website technology" : "Architecture & technology"}</h2>
                  <ul className="case-tech">
                    {(project.websiteTechnologies?.length ? project.websiteTechnologies : project.technologies).map(
                      (item) => (
                        <li key={item}>{item}</li>
                      ),
                    )}
                  </ul>
                </>
              )}
              {tab === "results" && (
                <>
                  <h2>Outcome</h2>
                  <p>{project.outcome || project.result}</p>
                </>
              )}
              {tab === "media" && mediaItems.length > 0 && (
                <>
                  <h2>Screens &amp; media</h2>
                  <p className="case-gallery-note">Screenshots and videos for this case study are shown below.</p>
                </>
              )}
              {tab === "challenges" && (
                <>
                  <h2>Challenge</h2>
                  <p>{project.challenge || project.problem}</p>
                </>
              )}
              {tab === "learned" && (
                <>
                  <h2>Lessons</h2>
                  <p>{project.learned}</p>
                </>
              )}
            </div>
          </div>

          <aside className="case-aside">
            <div className="case-aside-card">
              {project.logo ? (
                <div className="case-aside-logo">
                  <img src={project.logo} alt={`${project.organization || project.title} logo`} />
                </div>
              ) : project.organization ? (
                <p className="case-aside-org">{project.organization}</p>
              ) : null}
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
              <ShareActions
                inline
                title={`${project.title} by Prince Parfait GANZA`}
                excerpt={project.description}
                campaign={`project-${project.id}`}
                content={project.id}
              />
            </div>
          </aside>
        </div>

        {mediaItems.length > 0 ? (
          <section className="case-shots" id="case-media" data-page-section aria-label="Project media">
            <div className="case-shots-head">
              <h2>Project media</h2>
              {mediaItems.length > visibleShots ? (
                <div className="case-shots-nav">
                  <button type="button" aria-label="Previous media" onClick={() => shiftGallery(-1)}>
                    <RiArrowLeftLine size={16} />
                  </button>
                  <button type="button" aria-label="Next media" onClick={() => shiftGallery(1)}>
                    <RiArrowRightLine size={16} />
                  </button>
                </div>
              ) : null}
            </div>
            <div className="case-shots-track">
              {shotWindow.map((item, windowIndex) => {
                const absolute = shotStart + windowIndex;
                const video = item.type === "video" || isVideoUrl(item.src);
                return (
                  <figure key={`${item.src}-${absolute}`} className={video ? "is-video" : undefined}>
                    {video ? (
                      <PosterVideo src={item.src} poster={project.videoPoster || cover} title={`${project.title} ${item.caption}`} />
                    ) : (
                      <button
                        type="button"
                        className="case-media-open"
                        onClick={() => openPreview(absolute)}
                        aria-label={`Open ${item.caption}`}
                      >
                        <img src={item.src} alt="" loading="lazy" decoding="async" />
                      </button>
                    )}
                    <figcaption>{item.caption}</figcaption>
                  </figure>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      {previewStart !== null && previewItems.length ? (
        <MediaPreview
          title={project.title}
          items={previewItems}
          start={previewStart}
          onClose={() => setPreviewStart(null)}
        />
      ) : null}
    </article>
  );
}
