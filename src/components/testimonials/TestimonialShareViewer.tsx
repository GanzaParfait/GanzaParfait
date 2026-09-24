"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  RiChatQuoteLine,
  RiCloseLine,
  RiExternalLinkLine,
  RiLink,
  RiShareForwardLine,
} from "react-icons/ri";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
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

export default function TestimonialShareViewer() {
  const titleId = useId();
  const settings = useSiteSettings();
  const [item, setItem] = useState<PublicTestimonial | null>(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setItem(null);
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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const target = shouldAutoOpenTestimonial(window.location.search);
      if (!target) return;
      const params = new URLSearchParams();
      if (target.token) params.set("token", target.token);
      if (target.id) params.set("tm", target.id);
      try {
        const res = await fetch(`/api/testimonials?${params.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (!active || !res.ok || !data.item) return;
        setItem(data.item as PublicTestimonial);
        setOpen(true);
      } catch {
        /* ignore */
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
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !item || typeof document === "undefined") return null;

  const projects = listListedProjects(settings.projectRecords);
  const project = item.projectId ? projects.find((p) => p.id === item.projectId) : null;
  const shareHref =
    typeof window !== "undefined"
      ? `${window.location.origin}${item.shareToken ? testimonialSharePath(item.shareToken) : `/?tm=${item.id}`}`
      : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareHref);
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
        title: `${item.personName} on working with Prince Parfait GANZA`,
        text: item.shortBody || item.body.slice(0, 140),
        url: shareHref,
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
      <div className="tm-share-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        {isMobile ? <div className="tm-dialog-handle" aria-hidden="true" /> : null}
        <button type="button" className="tm-dialog-close" onClick={close} aria-label="Close">
          <RiCloseLine size={20} />
        </button>

        <div className="tm-share-quote" aria-hidden="true">
          <RiChatQuoteLine size={22} />
        </div>

        <blockquote id={titleId}>{item.body}</blockquote>

        <div className="tm-share-person">
          {item.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.photoUrl} alt="" />
          ) : (
            <span className="tm-share-avatar" aria-hidden="true">
              {item.personName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
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
            {item.location ? <span>{item.location}</span> : null}
          </div>
        </div>

        {project ? (
          <p>
            <Link href={`/projects/${project.id}`}>View related project →</Link>
          </p>
        ) : item.projectTitleOther ? (
          <p className="tm-locked-project">Related work: {item.projectTitleOther}</p>
        ) : null}

        <div className="tm-share-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => void nativeShare()}>
            <RiShareForwardLine size={15} /> Share
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => void copyLink()}>
            <RiLink size={15} /> {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
