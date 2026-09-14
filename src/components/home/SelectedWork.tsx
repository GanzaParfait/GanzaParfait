"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiArrowRightLine, RiBuilding2Line, RiCalendarLine, RiCloseLine, RiExternalLinkLine, RiUser3Line } from "react-icons/ri";
import { projects, type Project } from "@/data/site-data";
import { imagesForStory, type HomepageContent, type WorkStory } from "@/lib/homepage";

export default function SelectedWork({
  work,
  records,
  embedded = false,
}: {
  work: HomepageContent["work"];
  records?: Project[];
  embedded?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const stories = work.stories.slice(0, 4);
  const Tag = embedded ? "div" : "section";

  useEffect(() => {
    if (!preview) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

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
            <Link href="/projects">{work.cta} <RiArrowRightLine size={16} /></Link>
          </div>
        </header>
        <div className="selected-board">
          {stories.map((story, index) => (
            <ProjectPanel
              key={story.id}
              story={story}
              project={matchProject(story.id, records)}
              images={imagesForStory(story, records)}
              wide={index === 0 || index === 3}
              flourish={index === 0 ? work.flourish : ""}
              number={index + 1}
              featured={index === 0}
              onPreview={setPreview}
            />
          ))}
        </div>
        <div className="selected-more">
          <div>
            <p className="section-label">{work.moreLabel}</p>
            <h2>{work.moreTitle}</h2>
            <p>{work.moreBody}</p>
          </div>
          <Link href="/projects" className="btn btn-primary">{work.cta} <RiArrowRightLine size={16} /></Link>
          <ol>
            <li>Ideas</li>
            <li>Systems</li>
            <li>Impact</li>
          </ol>
        </div>
      </div>
      {preview ? (
        <div className="image-preview" role="dialog" aria-modal="true" aria-label="Image preview" onClick={() => setPreview(null)}>
          <button type="button" aria-label="Close preview" onClick={() => setPreview(null)}><RiCloseLine size={22} /></button>
          <img src={preview} alt="" onClick={(event) => event.stopPropagation()} />
        </div>
      ) : null}
    </Tag>
  );
}

function ProjectPanel({
  story,
  project,
  images,
  wide,
  flourish,
  number,
  featured,
  onPreview,
}: {
  story: WorkStory;
  project?: Project;
  images: string[];
  wide: boolean;
  flourish: string;
  number: number;
  featured: boolean;
  onPreview: (src: string) => void;
}) {
  const cover = images[0];
  const role = story.role || project?.myRole;
  const period = story.period || project?.period;
  const client = story.client || (wide ? project?.organization || story.organization : "");
  return (
    <article className={wide ? "selected-card is-wide" : "selected-card"}>
      <div>
        <div className="selected-kicker">
          <span>{String(number).padStart(2, "0")}</span>
          {story.tags[0] ? <em>{story.tags[0]}</em> : null}
          {featured ? <em className="is-featured">Featured</em> : null}
        </div>
        <h3>{story.title}</h3>
        <p className="selected-line">{story.line}</p>
        {wide ? <p>{story.support}</p> : null}
        <ul>
          {role ? <li><RiUser3Line size={15} /> <span>My role</span><strong>{role}</strong></li> : null}
          {period ? <li><RiCalendarLine size={15} /> <span>Duration</span><strong>{period}</strong></li> : null}
          {client ? <li><RiBuilding2Line size={15} /> <span>Client</span><strong>{client}</strong></li> : null}
        </ul>
        <div className="selected-actions">
          <Link href={story.href} className="btn btn-primary">View case study <RiArrowRightLine size={16} /></Link>
          {project?.links?.live ? (
            <a href={project.links.live} className="btn btn-outline" target="_blank" rel="noopener noreferrer">Live site <RiExternalLinkLine size={15} /></a>
          ) : null}
        </div>
      </div>
      <div className="selected-visual">
        <figure>
          {cover ? (
            <button type="button" onClick={() => onPreview(cover)} aria-label={`Open ${story.title} preview`}>
              <img src={cover} alt="" />
            </button>
          ) : <span>{story.title}</span>}
        </figure>
        {flourish ? (
          <p className="selected-flourish">
            <span>{flourish}</span>
          </p>
        ) : null}
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
