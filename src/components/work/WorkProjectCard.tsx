"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { RiArrowRightLine, RiExternalLinkLine, RiLockLine } from "react-icons/ri";
import type { Project } from "@/data/site-data";
import { selectedWorkCategory, selectedWorkTone } from "@/components/work/work-media";
import { useAdaptiveGlow } from "@/hooks/useAdaptiveGlow";

type CardExtra = { src: string; href?: string; label?: string };

function CoverImage({
  cover,
  title,
  wide,
}: {
  cover: string;
  title: string;
  wide: boolean;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 2800);
    return () => window.clearTimeout(timer);
  }, [cover]);
  const local = cover.startsWith("/") && !cover.startsWith("//");
  const remote = /^https?:\/\//i.test(cover);
  const sizes = wide
    ? "(max-width: 900px) 92vw, (max-width: 1200px) 55vw, 646px"
    : "(max-width: 900px) 92vw, (max-width: 1200px) 30vw, 360px";
  const alt = `${title} — work by Prince Parfait GANZA`;

  return (
    <>
      {ready ? null : <span className="frame-skel" aria-hidden="true" />}
      {local || remote ? (
        <Image
          src={cover}
          alt={alt}
          width={1200}
          height={750}
          sizes={sizes}
          quality={75}
          loading="lazy"
          className={`selected-shot-img${ready ? " is-ready" : ""}`}
          onLoad={() => setReady(true)}
        />
      ) : (
        <img
          src={cover}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={1200}
          height={750}
          className={ready ? "is-ready" : undefined}
          onLoad={() => setReady(true)}
        />
      )}
    </>
  );
}

export default function WorkProjectCard({
  project,
  number,
  title,
  line,
  body,
  href,
  cover,
  extras = [],
  mediaCount = 0,
  wide = false,
  flourish = "",
  locked = false,
  onPreview,
  onOpenExtra,
}: {
  project?: Project;
  number: number;
  title: string;
  line?: string;
  body: string;
  href: string;
  cover?: string;
  extras?: CardExtra[];
  mediaCount?: number;
  wide?: boolean;
  flourish?: string;
  locked?: boolean;
  onPreview?: () => void;
  onOpenExtra?: (index: number) => void;
}) {
  const category = selectedWorkCategory(project);
  const tone = selectedWorkTone(project);
  const live = project?.links?.live;
  const tech = (project?.technologies || []).filter(Boolean).slice(0, wide ? 4 : 3);
  const glow = useAdaptiveGlow(wide ? cover : undefined);
  const more = wide ? extras.filter((item) => item.src && item.src !== cover).slice(0, 2) : [];

  return (
    <article
      className={wide ? "selected-card is-wide" : "selected-card is-compact"}
      data-advance-item
      data-advance-label={title}
      data-tone={tone}
      style={wide ? ({ ["--selected-glow"]: glow } as CSSProperties) : undefined}
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
            {more.length ? (
              <div className={`selected-extra${more.length === 1 ? " is-single" : ""}`} aria-label={`More from ${title}`}>
                {more.map((item, extraIndex) => {
                  const label = item.label ? `Open ${item.label}` : `Open another image from ${title}`;
                  const shot = (
                    <>
                      <CoverImage cover={item.src} title={item.label || title} wide={false} />
                      {item.label ? <em>{item.label}</em> : null}
                    </>
                  );
                  if (item.href) {
                    return (
                      <Link key={`${item.src}-${item.href}`} href={item.href} aria-label={label}>
                        {shot}
                      </Link>
                    );
                  }
                  if (onOpenExtra) {
                    return (
                      <button key={`${item.src}-${extraIndex}`} type="button" onClick={() => onOpenExtra(extraIndex + 1)} aria-label={label}>
                        {shot}
                      </button>
                    );
                  }
                  return (
                    <Link key={`${item.src}-${extraIndex}`} href={href} aria-label={label}>
                      {shot}
                    </Link>
                  );
                })}
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
              <CoverImage cover={cover} title={title} wide={wide} />
              {mediaCount > 1 ? <em>{mediaCount}</em> : null}
              {locked ? <ProgressMark /> : null}
            </button>
          ) : (
            <Link href={href} className="selected-shot" aria-label={`Open ${title}`}>
              <CoverImage cover={cover} title={title} wide={wide} />
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
