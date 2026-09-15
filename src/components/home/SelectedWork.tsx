"use client";

import { useState } from "react";
import Link from "next/link";
import { RiArrowRightLine, RiBuilding2Line, RiCalendarLine, RiExternalLinkLine, RiUser3Line } from "react-icons/ri";
import { projects, type Project } from "@/data/site-data";
import { imagesForStory, type HomepageContent, type WorkStory } from "@/lib/homepage";
import MediaPreview, { type PreviewItem } from "@/components/ui/MediaPreview";

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

function mediaFor(project: Project | undefined, images: string[]): PreviewItem[] {
  const shots = images.map((src, index) => ({
    src,
    kind: "image" as const,
    caption: project?.screenshotCaptions?.[index],
  }));
  const videos = (project?.videos?.length ? project.videos : project?.video ? [project.video] : []).map((src) => ({
    src,
    kind: "video" as const,
  }));
  const seen = new Set<string>();
  return [...shots, ...videos].filter((item) => {
    if (!item.src || seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
}

export default function SelectedWork({
  work,
  records,
  embedded = false,
}: {
  work: HomepageContent["work"];
  records?: Project[];
  embedded?: boolean;
}) {
  const stories = work.stories.slice(0, 4).map((story, index) => ({
    story,
    index,
    project: matchProject(story.id, records),
  }));
  const [preview, setPreview] = useState<{ title: string; items: PreviewItem[]; start: number } | null>(null);
  const Tag = embedded ? "div" : "section";

  return (
    <Tag className={embedded ? "selected-work selected-work-embedded" : "selected-work"} id={embedded ? undefined : "work"} aria-label="Selected work">
      <div className="container">
        <header className="selected-head">
          <div>
            <p className="section-label">{work.label}</p>
            <h2>{work.title}</h2>
          </div>
          <div>
            <p>{work.intro}</p>
            <Link href="/projects" className="selected-all">{work.cta} <span aria-hidden="true"><RiArrowRightLine size={16} /></span></Link>
          </div>
        </header>
        <div className="selected-board">
          {stories.map(({ story, index, project }) => {
            const images = imagesForStory(story, records);
            const items = mediaFor(project, images);
            return (
              <ProjectPanel
                key={story.id}
                story={story}
                project={project}
                cover={images[0]}
                mediaCount={items.length}
                wide={index === 0 || index === 3}
                flourish={index === 0 ? work.flourish : ""}
                number={index + 1}
                onPreview={() => setPreview({ title: story.title, items, start: 0 })}
              />
            );
          })}
        </div>
        <div className="selected-more">
          <div>
            <p className="section-label">{work.moreLabel}</p>
            <h2>{work.moreTitle}</h2>
            <p>{work.moreBody}</p>
          </div>
          <Link href="/projects" className="btn btn-primary">{work.cta} <RiArrowRightLine size={16} /></Link>
          <ol>
            {work.rail.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </div>
      </div>
      {preview ? (
        <MediaPreview title={preview.title} items={preview.items} start={preview.start} onClose={() => setPreview(null)} />
      ) : null}
    </Tag>
  );
}

function ProjectPanel({
  story,
  project,
  cover,
  mediaCount,
  wide,
  flourish,
  number,
  onPreview,
}: {
  story: WorkStory;
  project?: Project;
  cover?: string;
  mediaCount: number;
  wide: boolean;
  flourish: string;
  number: number;
  onPreview: () => void;
}) {
  const category = project?.category === "other" && project.categoryNote
    ? project.categoryNote
    : CATEGORY[project?.category || ""] || story.tags[0];
  const body = project?.description || story.support;
  const role = project?.myRole;
  const period = project?.period;
  const client = project?.organization || story.organization;

  return (
    <article className={wide ? "selected-card is-wide" : "selected-card"}>
      <div>
        <div className="selected-kicker">
          <span>{String(number).padStart(2, "0")}</span>
          {category ? <em>{category}</em> : null}
          {project?.featured ? <em className="is-featured">Featured</em> : null}
        </div>
        <h3>{story.title}</h3>
        <p className="selected-line">{story.line}</p>
        <p>{body}</p>
        <ul>
          {role ? <li><RiUser3Line size={15} /> <span>My role</span><strong>{role}</strong></li> : null}
          {period ? <li><RiCalendarLine size={15} /> <span>Duration</span><strong>{period}</strong></li> : null}
          {client ? <li><RiBuilding2Line size={15} /> <span>Client</span><strong>{client}</strong></li> : null}
        </ul>
        <div className="selected-actions">
          <Link href={story.href} className={wide ? "btn btn-primary" : "selected-study"}>
            View case study <RiArrowRightLine size={16} />
          </Link>
          {project?.links?.live ? (
            <a href={project.links.live} className="selected-live" target="_blank" rel="noopener noreferrer">
              Live site <RiExternalLinkLine size={15} />
            </a>
          ) : null}
        </div>
      </div>
      <div className="selected-visual">
        {cover ? (
          <button type="button" className="selected-shot" onClick={onPreview} aria-label={`Preview ${story.title}`}>
            <img src={cover} alt="" />
            {mediaCount > 1 ? <em>{mediaCount}</em> : null}
          </button>
        ) : (
          <figure><span>{story.title}</span></figure>
        )}
        {flourish ? <p className="selected-flourish">{flourish}</p> : null}
      </div>
    </article>
  );
}

function matchProject(id: string, records?: Project[]) {
  const saved = records?.find((item) => item.id === id);
  const base = projects.find((item) => item.id === id);
  if (saved && base) return { ...base, ...saved, title: saved.title || base.title };
  return saved || base;
}
