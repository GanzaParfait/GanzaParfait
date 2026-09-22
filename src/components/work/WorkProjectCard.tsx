"use client";

import Image from "next/image";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiBuilding2Line,
  RiCalendarLine,
  RiExternalLinkLine,
  RiUser3Line,
} from "react-icons/ri";
import type { Project } from "@/data/site-data";
import { workCategoryLabel } from "@/components/work/work-media";

function CoverImage({
  cover,
  title,
  wide,
}: {
  cover: string;
  title: string;
  wide: boolean;
}) {
  const local = cover.startsWith("/") && !cover.startsWith("//");
  const remote = /^https?:\/\//i.test(cover);
  const sizes = wide
    ? "(max-width: 900px) 92vw, (max-width: 1200px) 55vw, 646px"
    : "(max-width: 900px) 92vw, (max-width: 1200px) 28vw, 320px";
  const alt = `${title} — work by Prince Parfait GANZA`;

  if (local || remote) {
    return (
      <Image
        src={cover}
        alt={alt}
        width={1200}
        height={750}
        sizes={sizes}
        loading="lazy"
        className="selected-shot-img"
      />
    );
  }

  return <img src={cover} alt={alt} loading="lazy" decoding="async" width={1200} height={750} />;
}

export default function WorkProjectCard({
  project,
  number,
  title,
  line,
  body,
  href,
  cover,
  mediaCount = 0,
  wide = false,
  flourish = "",
  onPreview,
}: {
  project?: Project;
  number: number;
  title: string;
  line?: string;
  body: string;
  href: string;
  cover?: string;
  mediaCount?: number;
  wide?: boolean;
  flourish?: string;
  onPreview?: () => void;
}) {
  const category = workCategoryLabel(project);
  const role = project?.myRole;
  const period = project?.period;
  const client = project?.organization;
  const live = project?.links?.live;

  return (
    <article
      className={wide ? "selected-card is-wide" : "selected-card"}
      data-advance-item
      data-advance-label={title}
    >
      <div className="selected-copy">
        <div className="selected-kicker">
          <span>{String(number).padStart(2, "0")}</span>
          {category ? <em>{category}</em> : null}
          {project?.featured ? <em className="is-featured">Featured</em> : null}
        </div>
        <h3>{title}</h3>
        {line ? <p className="selected-line">{line}</p> : null}
        <p className="selected-body">{body}</p>
        {(role || period || client) ? (
          <ul className={wide ? "selected-meta is-wide" : "selected-meta"}>
            {role ? (
              <li>
                <RiUser3Line size={15} aria-hidden="true" />
                <span>My role</span>
                <strong>{role}</strong>
              </li>
            ) : null}
            {period ? (
              <li>
                <RiCalendarLine size={15} aria-hidden="true" />
                <span>Duration</span>
                <strong>{period}</strong>
              </li>
            ) : null}
            {client ? (
              <li>
                <RiBuilding2Line size={15} aria-hidden="true" />
                <span>Client</span>
                <strong>{client}</strong>
              </li>
            ) : null}
          </ul>
        ) : null}
        <div className="selected-actions">
          <Link href={href} className={wide ? "btn btn-primary" : "selected-study"}>
            View case study <RiArrowRightLine size={16} />
          </Link>
          {live ? (
            <a href={live} className="selected-live" target="_blank" rel="noopener noreferrer">
              Live site <RiExternalLinkLine size={15} />
            </a>
          ) : null}
        </div>
      </div>
      <div className="selected-visual">
        {cover ? (
          onPreview ? (
            <button type="button" className="selected-shot" onClick={onPreview} aria-label={`Preview ${title}`}>
              <CoverImage cover={cover} title={title} wide={wide} />
              {mediaCount > 1 ? <em>{mediaCount}</em> : null}
            </button>
          ) : (
            <Link href={href} className="selected-shot" aria-label={`Open ${title}`}>
              <CoverImage cover={cover} title={title} wide={wide} />
              {mediaCount > 1 ? <em>{mediaCount}</em> : null}
            </Link>
          )
        ) : (
          <figure className="selected-shot is-empty">
            <span>{title}</span>
          </figure>
        )}
        {flourish ? <p className="selected-flourish">{flourish}</p> : null}
      </div>
    </article>
  );
}
