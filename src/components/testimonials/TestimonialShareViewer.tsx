"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiExternalLinkLine,
  RiLink,
  RiLoader4Line,
  RiMapPinLine,
  RiShareForwardLine,
} from "react-icons/ri";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import { useSheetDrag } from "@/hooks/useSheetDrag";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { listListedProjects } from "@/lib/projects";
import {
  shouldAutoOpenTestimonial,
  testimonialSharePath,
  type PublicTestimonial,
} from "@/lib/testimonials";

function attribution(item: PublicTestimonial) {
  return [item.personTitle, item.organization].filter(Boolean).join(" · ");
}

function relationshipPill(value: string | null) {
  const raw = (value || "").split(/[·|•]/)[0]?.trim();
  if (!raw) return "";
  return raw.length > 28 ? `${raw.slice(0, 26).trim()}…` : raw;
}

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  submitted: {
    title: "Received",
    body: "Thank you. This note has been received and is still being reviewed, so it is not public yet.",
  },
  confirmed: {
    title: "Confirmed",
    body: "This note has been confirmed. It will be visible here once it is published.",
  },
  draft: {
    title: "Not public yet",
    body: "This note is still being prepared and is not available to read.",
  },
  declined: {
    title: "Not available",
    body: "This note is not available to share.",
  },
  unavailable: {
    title: "Not public",
    body: "This note is not public yet.",
  },
  missing: {
    title: "Link not found",
    body: "This link does not match a note we can show.",
  },
};

export default function TestimonialShareViewer() {
  const titleId = useId();
  const settings = useSiteSettings();
  const [item, setItem] = useState<PublicTestimonial | null>(null);
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setLoading(false);
    setItem(null);
    setNotice("");
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("testimonial");
      url.searchParams.delete("t");
      url.searchParams.delete("tm");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    } catch {
      /* ignore */
    }
  }, []);

  useHistoryBackClose(open, close);
  useSheetDrag(open && isMobile, close, panelRef);

  useEffect(() => {
    const sync = () => setIsMobile(window.matchMedia("(max-width: 720px)").matches);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    let active = true;
    const target = shouldAutoOpenTestimonial(window.location.search);
    if (!target) return;
    setOpen(true);
    setLoading(true);
    setItem(null);
    setNotice("");
    const params = new URLSearchParams();
    if (target.token) params.set("token", target.token);
    if (target.id) params.set("tm", target.id);
    const load = async () => {
      try {
        const res = await fetch(`/api/testimonials?${params.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (data.item) {
          setItem(data.item as PublicTestimonial);
          setNotice("");
          return;
        }
        setItem(null);
        setNotice(String(data.state || "unavailable"));
      } catch {
        if (!active) return;
        setItem(null);
        setNotice("unavailable");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("tm-share-open");
    return () => {
      document.body.style.overflow = previous;
      document.body.classList.remove("tm-share-open");
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const statusCopy = notice ? STATUS_COPY[notice] || STATUS_COPY.unavailable : null;
  const projects = listListedProjects(settings.projectRecords);
  const project = item?.projectId ? projects.find((entry) => entry.id === item.projectId) : null;
  const shareHref =
    typeof window !== "undefined" && item
      ? `${window.location.origin}${item.shareToken ? testimonialSharePath(item.shareToken) : `/?tm=${item.id}`}`
      : "";
  const pill = item ? relationshipPill(item.relationship) : "";
  const projectBlurb = project?.description ? project.description.replace(/\s+/g, " ").trim() : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareHref || window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: item ? `${item.personName} on working with Prince Parfait GANZA` : "Prince Parfait GANZA",
        text: item ? item.shortBody || item.body.slice(0, 140) : statusCopy?.body,
        url: shareHref || window.location.href,
      });
    } catch {
      /* cancelled */
    }
  };

  return createPortal(
    <div
      className={`tm-share-layer ${isMobile ? "is-sheet" : "is-drawer"}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div ref={panelRef} className="tm-share-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-busy={loading}>
        {isMobile ? <div className="tm-dialog-handle" aria-hidden="true" /> : (
          <button type="button" className="tm-dialog-close" onClick={close} aria-label="Close">
            <RiCloseLine size={20} />
          </button>
        )}

        {loading ? (
          <div className="tm-share-loading" role="status">
            <RiLoader4Line className="tm-share-spin" size={28} aria-hidden="true" />
            <span className="sr-only">Loading testimonial</span>
          </div>
        ) : item ? (
          <>
            <p className="tm-share-kicker">
              <span aria-hidden="true" /> Testimonial
            </p>
            <div className="tm-share-quote">
              <span className="tm-share-mark" aria-hidden="true">&ldquo;</span>
              <blockquote id={titleId}>{item.body}</blockquote>
            </div>
            <div className="tm-share-person">
              {item.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photoUrl} alt="" />
              ) : (
                <span className="tm-share-avatar" aria-hidden="true">
                  {item.personName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="tm-share-identity">
                <strong className="tm-share-name">
                  {item.profileUrl ? (
                    <a href={item.profileUrl} target="_blank" rel="noopener noreferrer nofollow">
                      {item.personName}
                    </a>
                  ) : (
                    <span>{item.personName}</span>
                  )}
                  {item.profileUrl ? (
                    <a
                      className="tm-share-ext"
                      href={item.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      aria-label={`${item.personName} profile`}
                    >
                      <RiExternalLinkLine size={13} aria-hidden="true" />
                    </a>
                  ) : null}
                  <RiCheckboxCircleFill className="tm-share-verified" size={15} aria-label="Verified" />
                </strong>
                {attribution(item) ? <span>{attribution(item)}</span> : null}
                {item.location ? (
                  <span className="tm-share-place">
                    <RiMapPinLine size={13} aria-hidden="true" /> {item.location}
                  </span>
                ) : null}
              </div>
              {pill ? <span className="tm-share-pill">{pill}</span> : null}
            </div>
            {project ? (
              <div className="tm-share-related">
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.image} alt="" />
                ) : (
                  <span className="tm-share-related-fallback" aria-hidden="true">
                    {project.title.slice(0, 1)}
                  </span>
                )}
                <div>
                  <p>Related project</p>
                  <strong>
                    {project.title} <RiArrowRightLine size={16} aria-hidden="true" />
                  </strong>
                  {projectBlurb ? <span>{projectBlurb}</span> : null}
                </div>
              </div>
            ) : item.projectTitleOther ? (
              <p className="tm-share-other">Related work: {item.projectTitleOther}</p>
            ) : null}
            <div className="tm-share-foot">
              <div className="tm-share-foot-start">
                {project ? (
                  <Link className="btn btn-outline btn-sm tm-share-project" href={`/projects/${project.id}`}>
                    <RiExternalLinkLine size={15} aria-hidden="true" /> View project details
                  </Link>
                ) : null}
              </div>
              <span className="tm-share-rule" aria-hidden="true" />
              <div className="tm-share-foot-end">
                <button type="button" className="tm-share-text" onClick={() => void nativeShare()}>
                  <RiShareForwardLine size={16} aria-hidden="true" /> Share testimonial
                </button>
                <button type="button" className="tm-share-text" onClick={() => void copyLink()}>
                  <RiLink size={16} aria-hidden="true" /> {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="tm-share-status">
            <p className="section-label">{statusCopy?.title}</p>
            <p id={titleId}>{statusCopy?.body}</p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
