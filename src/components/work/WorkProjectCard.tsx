"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { RiArrowRightLine, RiExternalLinkLine, RiLockLine } from "react-icons/ri";
import type { Project } from "@/data/site-data";
import ResilientCover from "@/components/work/ResilientCover";
import { selectedWorkCategory, selectedWorkTone } from "@/components/work/work-media";
import { useAdaptiveGlow } from "@/hooks/useAdaptiveGlow";

export default function WorkProjectCard({
  project,
  number,
  title,
  line,
  body,
  href,
  cover,
  related = [],
  mediaCount = 0,
  wide = false,
  flourish = "",
  locked = false,
  stackIndex = 0,
  onPreview,
}: {
  project?: Project;
  number: number;
  title: string;
  line?: string;
  body: string;
  href: string;
  cover?: string;
  /** Two pictures shown under the wide-card case-study action. */
  related?: { src: string; title?: string; href: string }[];
  mediaCount?: number;
  wide?: boolean;
  flourish?: string;
  locked?: boolean;
  stackIndex?: number;
  onPreview?: () => void;
}) {
  const category = selectedWorkCategory(project);
  const tone = selectedWorkTone(project);
  const live = project?.links?.live;
  const tech = (project?.technologies || []).filter(Boolean).slice(0, wide ? 4 : 3);
  const glow = useAdaptiveGlow(wide ? cover : undefined);

  return (
    <article
      className={wide ? "selected-card is-wide" : "selected-card is-compact"}
      data-advance-item
      data-advance-label={title}
      data-tone={tone}
      style={
        {
          ["--stack-i"]: stackIndex,
          ...(wide ? { ["--selected-glow"]: glow } : {}),
        } as CSSProperties
      }
    >
      <div className="selected-copy">
        <div className="selected-kicker">
          <span>{String(number).padStart(2, "0")}</span>
          {category ? (
            <em data-tone={tone}>{category}</em>
          ) : null}
          {!wide && project?.featured ? <em className="is-featured">Featured</em> : null}
        </div>
        <h3>{title}</h3>
        {line ? <p className="selected-line">{line}</p> : null}
        <p className="selected-body">{body}</p>
        {wide ? (
          <>
            {tech.length ? (
              <ul className="selected-tech" aria-label="Technologies">
                {tech.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <div className="selected-actions">
              <Link href={href} className="btn btn-primary">
                View case study <RiArrowRightLine size={16} />
              </Link>
              {live ? (
                <a href={live} className="selected-live" target="_blank" rel="noopener noreferrer">
                  Live site <RiExternalLinkLine size={15} />
                </a>
              ) : null}
            </div>
            {related.length ? (
              <div className="selected-related-row">
                {related.slice(0, 2).map((item) => (
                  <Link key={item.src} href={item.href} className="selected-related">
                    <span className="selected-related-shot">
                      <ResilientCover src={item.src} alt={`${item.title || title} — work by Prince Parfait GANZA`} />
                    </span>
                    {item.title ? <span className="selected-related-name">{item.title}</span> : null}
                  </Link>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="selected-card-foot">
            {tech.length ? (
              <ul className="selected-tech" aria-label="Technologies">
                {tech.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <span />
            )}
            <Link href={href} className="selected-study">
              View project <RiArrowRightLine size={14} />
            </Link>
          </div>
        )}
      </div>
      <div className="selected-visual">
        {cover ? (
          onPreview ? (
            <button type="button" className="selected-shot" onClick={onPreview} aria-label={`Preview ${title}`}>
              <ResilientCover
                src={cover}
                alt={`${title} — work by Prince Parfait GANZA`}
                wide={wide}
                priority={wide}
              />
              {mediaCount > 1 ? <em>{mediaCount}</em> : null}
              {locked ? <ProgressMark /> : null}
            </button>
          ) : (
            <Link href={href} className="selected-shot" aria-label={`Open ${title}`}>
              <ResilientCover
                src={cover}
                alt={`${title} — work by Prince Parfait GANZA`}
                wide={wide}
                priority={wide}
              />
              {mediaCount > 1 ? <em>{mediaCount}</em> : null}
              {locked ? <ProgressMark /> : null}
            </Link>
          )
        ) : (
          <figure className="selected-shot is-empty">
            <span>{title}</span>
            {locked ? <ProgressMark /> : null}
          </figure>
        )}
        {flourish ? <p className="selected-flourish">{flourish}</p> : null}
      </div>
    </article>
  );
}

function ProgressMark() {
  return (
    <span className="projects-card-lock">
      <RiLockLine size={22} aria-hidden="true" />
      In Progress
    </span>
  );
}
