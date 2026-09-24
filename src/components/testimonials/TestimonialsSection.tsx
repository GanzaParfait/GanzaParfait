"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiChatQuoteLine,
  RiDoubleQuotesL,
  RiExternalLinkLine,
} from "react-icons/ri";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { listListedProjects } from "@/lib/projects";
import { sortTestimonials, type PublicTestimonial } from "@/lib/testimonials";
import TestimonialFormDialog from "@/components/testimonials/TestimonialFormDialog";

type Props = {
  items?: PublicTestimonial[];
  /** Max items in the auto carousel before "Show more". */
  limit?: number;
  label?: string;
  title?: string;
  titleAccent?: string;
  subtitle?: string;
};

const CAROUSEL_CAP = 8;
const AUTO_MS = 6500;

function attribution(item: PublicTestimonial) {
  return [item.personTitle, item.organization].filter(Boolean).join(", ");
}

function badgeLabel(item: PublicTestimonial, projectName: string | null) {
  const rel = (item.relationship || "").trim();
  const project = (projectName || item.projectTitleOther || "").trim();
  if (rel && project) return `${rel} · ${project}`;
  if (rel) return rel;
  if (project) return project;
  return "Collaborator";
}

function quoteParts(item: PublicTestimonial) {
  const full = (item.shortBody || item.body || "").trim();
  if (item.shortBody?.trim() && item.body?.trim() && item.shortBody.trim() !== item.body.trim()) {
    return { lead: item.shortBody.trim(), support: item.body.trim() };
  }
  const breakAt = full.search(/[.!?]\s/);
  if (breakAt > 40 && breakAt < full.length - 20) {
    return {
      lead: full.slice(0, breakAt + 1).trim(),
      support: full.slice(breakAt + 1).trim(),
    };
  }
  return { lead: full, support: "" };
}

function usePerView() {
  const [perView, setPerView] = useState(4);
  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      if (w < 640) setPerView(1);
      else if (w < 900) setPerView(2);
      else if (w < 1180) setPerView(3);
      else setPerView(4);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  return perView;
}

export default function TestimonialsSection({
  items,
  limit = CAROUSEL_CAP,
  label = "Client & collaborator feedback",
  title = "Words from people I've",
  titleAccent = "worked with.",
  subtitle = "Client and collaborator feedback from work, projects and training.",
}: Props) {
  const settings = useSiteSettings();
  const perView = usePerView();
  const [fetched, setFetched] = useState<PublicTestimonial[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items) return;
    let active = true;
    fetch(`/api/testimonials?limit=${Math.max(limit, 16)}`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (active) setFetched((data.items || []) as PublicTestimonial[]);
      })
      .catch(() => {
        if (active) setFetched([]);
      });
    return () => {
      active = false;
    };
  }, [items, limit]);

  const source = items ?? fetched;
  const sorted = useMemo(() => sortTestimonials(source || []), [source]);
  const capped = sorted.slice(0, Math.max(limit, CAROUSEL_CAP));
  const pool = expanded ? sorted : capped;
  const hasMore = !expanded && sorted.length > capped.length;
  const maxStart = Math.max(0, pool.length - perView);
  const start = Math.min(index, maxStart);
  const visible = expanded ? pool : pool.slice(start, start + perView);
  const projectOptions = useMemo(
    () => listListedProjects(settings.projectRecords).map((project) => ({ id: project.id, title: project.title })),
    [settings.projectRecords],
  );
  const projectTitle = (id: string | null) =>
    id ? projectOptions.find((project) => project.id === id)?.title || id : null;

  useEffect(() => {
    setIndex((current) => Math.min(current, maxStart));
  }, [maxStart, perView]);

  useEffect(() => {
    if (expanded || paused || pool.length <= perView || source === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current >= maxStart ? 0 : current + 1));
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [expanded, paused, pool.length, perView, maxStart, source]);

  const goPrev = () => setIndex((current) => (current <= 0 ? maxStart : current - 1));
  const goNext = () => setIndex((current) => (current >= maxStart ? 0 : current + 1));

  const proofAvatars = capped.slice(0, 5);
  const proofExtra = Math.max(0, capped.length - proofAvatars.length);

  return (
    <section
      className="testimonials"
      aria-labelledby="testimonials-title"
      id="testimonials"
      data-page-section
      data-section-label="References"
    >
      <div className="container">
        <div className="testimonials-head">
          <div>
            <p className="section-label">{label}</p>
            <h2 id="testimonials-title">
              {title} <span className="testimonials-accent">{titleAccent}</span>
            </h2>
            <p className="testimonials-lead">{subtitle}</p>
          </div>
          <div className="testimonials-head-actions">
            <button type="button" className="btn btn-outline testimonials-cta" onClick={() => setFormOpen(true)}>
              <RiChatQuoteLine size={16} /> Share your experience
            </button>
          </div>
        </div>

        {notice ? (
          <p className="testimonials-notice" role="status">
            {notice}
          </p>
        ) : null}

        {source === null ? (
          <div className="testimonials-viewport" aria-busy="true" aria-label="Loading testimonials">
            <div className="testimonials-track">
              {Array.from({ length: perView }).map((_, i) => (
                <div key={i} className="testimonials-card is-skeleton">
                  <div className="testimonials-card-top">
                    <div className="testimonials-skel skel-quote" />
                    <div className="testimonials-skel skel-badge" />
                  </div>
                  <div className="testimonials-skel skel-line" />
                  <div className="testimonials-skel skel-line" />
                  <div className="testimonials-skel skel-line is-short" />
                  <div className="testimonials-skel-foot">
                    <div className="testimonials-skel skel-avatar" />
                    <div className="testimonials-skel-copy">
                      <div className="testimonials-skel skel-name" />
                      <div className="testimonials-skel skel-meta" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : pool.length ? (
          <>
            <div
              className={`testimonials-viewport${expanded ? " is-expanded" : ""}`}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
              }}
            >
              <ul className={`testimonials-track${expanded ? " is-grid" : ""}`}>
                {visible.map((item) => {
                  const related = projectTitle(item.projectId) || item.projectTitleOther;
                  const parts = quoteParts(item);
                  const badge = badgeLabel(item, related);
                  return (
                    <li key={item.id} className="testimonials-card">
                      <div className="testimonials-card-top">
                        <RiDoubleQuotesL className="testimonials-quote-mark" size={28} aria-hidden="true" />
                        <span className="testimonials-badge">{badge}</span>
                      </div>
                      <blockquote>
                        <p className="testimonials-lead-quote" style={{ whiteSpace: "pre-wrap" }}>
                          {parts.lead}
                        </p>
                        {parts.support ? (
                          <p className="testimonials-support" style={{ whiteSpace: "pre-wrap" }}>
                            {parts.support}
                          </p>
                        ) : null}
                      </blockquote>
                      <figcaption className="testimonials-card-foot">
                        {item.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="testimonials-avatar" src={item.photoUrl} alt="" loading="lazy" decoding="async" />
                        ) : (
                          <span className="testimonials-avatar is-initial" aria-hidden="true">
                            {item.personName.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="testimonials-person">
                          <strong>
                            {item.profileUrl ? (
                              <a href={item.profileUrl} target="_blank" rel="noopener noreferrer nofollow">
                                {item.personName} <RiExternalLinkLine size={12} aria-hidden="true" />
                              </a>
                            ) : (
                              item.personName
                            )}
                          </strong>
                          {attribution(item) ? <span>{attribution(item)}</span> : null}
                        </span>
                        {item.projectId ? (
                          <Link className="testimonials-project" href={`/projects/${item.projectId}`}>
                            View project <RiArrowRightLine size={14} aria-hidden="true" />
                          </Link>
                        ) : related ? (
                          <span className="testimonials-relation">{related}</span>
                        ) : null}
                      </figcaption>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="testimonials-bar">
              <div className="testimonials-proof">
                <div className="testimonials-proof-avatars" aria-hidden="true">
                  {proofAvatars.map((item) =>
                    item.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={item.id} src={item.photoUrl} alt="" />
                    ) : (
                      <span key={item.id}>{item.personName.slice(0, 1).toUpperCase()}</span>
                    ),
                  )}
                  {proofExtra > 0 ? <em>+{proofExtra}</em> : null}
                </div>
                <p>
                  <strong>{Math.max(sorted.length, capped.length)}+</strong> Clients, collaborators and trainees
                </p>
              </div>

              <div className="testimonials-bar-actions">
                {!expanded && pool.length > perView ? (
                  <div className="testimonials-arrows">
                    <button type="button" className="testimonials-arrow" onClick={goPrev} aria-label="Previous testimonials">
                      <RiArrowLeftSLine size={20} />
                    </button>
                    <button type="button" className="testimonials-arrow" onClick={goNext} aria-label="Next testimonials">
                      <RiArrowRightSLine size={20} />
                    </button>
                  </div>
                ) : null}
                {hasMore ? (
                  <button type="button" className="btn btn-primary" onClick={() => setExpanded(true)}>
                    Show more <RiArrowRightLine size={16} />
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
                    Share your experience <RiArrowRightLine size={16} />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="testimonials-empty" role="status">
            <p>
              No testimonials are published yet. If we have worked together, yours can be the first —
              it will be reviewed before it goes live.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
              <RiChatQuoteLine size={16} /> Share your experience
            </button>
          </div>
        )}
      </div>

      {formOpen ? (
        <TestimonialFormDialog
          open
          onClose={() => setFormOpen(false)}
          projects={projectOptions}
          onSubmitted={(message) => {
            setFormOpen(false);
            setNotice(message);
          }}
        />
      ) : null}
    </section>
  );
}
