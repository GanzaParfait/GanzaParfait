"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiCalendarLine,
  RiCloseLine,
  RiFileTextLine,
  RiLink,
  RiMapPinLine,
  RiFacebookFill,
  RiLinkedinFill,
  RiPlayFill,
  RiTimeLine,
  RiTwitterXFill,
  RiWhatsappLine,
} from "react-icons/ri";
import type { SiteSettings } from "@/lib/supabase";
import { announcementMedia, fileName } from "@/lib/announcement";

export default function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const text = settings.announcementText?.trim() || "";
  const label = settings.announcementCtaLabel?.trim() || "Continue";

  if (!settings.announcementIsActive || !text) return null;

  return (
    <>
      <button type="button" className="announcement-bar" onClick={() => setOpen(true)}>
        <span>{text}</span>
        <span className="announcement-bar-cta">
          {label} <RiArrowRightLine size={14} />
        </span>
      </button>
      {open ? <AnnouncementOverlay settings={settings} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function AnnouncementOverlay({ settings, onClose }: { settings: SiteSettings; onClose: () => void }) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="announcement-layer" role="presentation" onClick={onClose}>
      <AnnouncementCard settings={settings} titleId={titleId} onClose={onClose} />
    </div>
  );
}

export function AnnouncementCard({
  settings,
  titleId,
  onClose,
  preview = false,
}: {
  settings: SiteSettings;
  titleId?: string;
  onClose?: () => void;
  preview?: boolean;
}) {
  const media = announcementMedia(settings);
  const visuals = media.filter((item) => item.type !== "document");
  const documents = media.filter((item) => item.type === "document");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const layout = settings.announcementLayout === "stack" ? "stack" : "side";
  const headline = settings.announcementHeadline?.trim() || settings.announcementText?.trim() || "Announcement";
  const detail = settings.announcementDetail?.trim() || "";
  const label = settings.announcementCtaLabel?.trim() || "Continue";
  const href = settings.announcementLink?.trim() || "";
  const secondaryLabel = settings.announcementSecondaryLabel?.trim() || "";
  const secondaryHref = settings.announcementSecondaryHref?.trim() || "";
  const interval = Math.min(Math.max(settings.announcementInterval || 5, 3), 20);
  const frame = visuals[index];
  const [share, setShare] = useState<ReturnType<typeof shareLinks>>([]);

  useEffect(() => {
    if (settings.announcementShare === false) {
      setShare([]);
      return;
    }
    setShare(shareLinks(headline));
  }, [settings.announcementShare, headline]);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [visuals.map((item) => item.url).join("|")]);

  useEffect(() => {
    if (visuals.length < 2 || paused || playing) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % visuals.length), interval * 1000);
    return () => window.clearInterval(timer);
  }, [visuals.length, paused, playing, interval]);

  return (
    <div
      className={`announcement-sheet is-${layout}${preview ? " is-preview" : ""}`}
      role={preview ? undefined : "dialog"}
      aria-modal={preview ? undefined : true}
      aria-labelledby={titleId}
      onClick={(event) => event.stopPropagation()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {onClose ? (
        <button type="button" className="announcement-close" onClick={onClose} aria-label="Close announcement">
          <RiCloseLine size={18} />
        </button>
      ) : null}
      <div className="announcement-media" aria-hidden={visuals.length === 0}>
        {frame ? (
          frame.type === "video" ? (
            playing ? (
              <video
                key={frame.url}
                className="announcement-frame"
                src={frame.url}
                poster={frame.poster || undefined}
                controls
                autoPlay
                preload="metadata"
                playsInline
              />
            ) : (
              <button type="button" className="announcement-play" onClick={() => setPlaying(true)}>
                {frame.poster ? <img src={frame.poster} alt="" /> : <span className="announcement-video-fallback" />}
                <span className="announcement-play-button" aria-hidden="true"><RiPlayFill size={28} /></span>
              </button>
            )
          ) : (
            <img src={frame.url} alt="" className="announcement-frame" />
          )
        ) : (
          <div className="announcement-video-fallback" />
        )}
        {visuals.length > 1 ? (
          <div className="announcement-dots" role="tablist" aria-label="Announcement media">
            {visuals.map((item, frameIndex) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={frameIndex === index}
                className={frameIndex === index ? "is-on" : undefined}
                onClick={() => { setIndex(frameIndex); setPlaying(false); }}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="announcement-copy">
        <p className="announcement-kicker">{settings.announcementEyebrow?.trim() || "Announcement"}</p>
        <h2 id={titleId}>{headline}</h2>
        {detail ? <p>{detail}</p> : null}
        {(settings.announcementDate || settings.announcementTime || settings.announcementPlace) ? (
          <ul className="announcement-facts">
            {settings.announcementDate ? <li><RiCalendarLine size={16} /><span>{settings.announcementDate}</span></li> : null}
            {settings.announcementTime ? <li><RiTimeLine size={16} /><span>{settings.announcementTime}</span></li> : null}
            {settings.announcementPlace ? <li><RiMapPinLine size={16} /><span>{settings.announcementPlace}</span></li> : null}
          </ul>
        ) : null}
        <div className="announcement-actions">
          {href ? <ActionLink href={href} className="btn btn-primary" onClick={onClose}>{label} <RiArrowRightLine size={16} /></ActionLink> : null}
          {secondaryLabel && secondaryHref ? (
            <ActionLink href={secondaryHref} className="btn btn-outline" onClick={onClose}>
              <RiCalendarLine size={16} /> {secondaryLabel}
            </ActionLink>
          ) : null}
        </div>
        {documents.length ? (
          <div className="announcement-docs">
            {documents.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                <RiFileTextLine size={16} /> {item.name || fileName(item.url)}
              </a>
            ))}
          </div>
        ) : null}
        {share.length || settings.announcementClosing ? (
          <div className="announcement-share">
            {share.length ? (
              <div>
                <p>Share this event</p>
                <div>
                  {share.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                        <Icon size={15} />
                      </a>
                    );
                  })}
                  <button type="button" aria-label="Copy link" onClick={() => navigator.clipboard.writeText(window.location.href.split("?")[0])}>
                    <RiLink size={16} />
                  </button>
                </div>
              </div>
            ) : <span />}
            {settings.announcementClosing ? <p className="announcement-closing">{settings.announcementClosing}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function shareLinks(title: string) {
  if (typeof window === "undefined") return [];
  const url = encodeURIComponent(window.location.href.split("?")[0]);
  const text = encodeURIComponent(title);
  return [
    { label: "LinkedIn", icon: RiLinkedinFill, href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { label: "X", icon: RiTwitterXFill, href: `https://twitter.com/intent/tweet?text=${text}&url=${url}` },
    { label: "Facebook", icon: RiFacebookFill, href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { label: "WhatsApp", icon: RiWhatsappLine, href: `https://wa.me/?text=${text}%20${url}` },
  ];
}

function ActionLink({ href, className, onClick, children }: { href: string; className: string; onClick?: () => void; children: ReactNode }) {
  if (href.startsWith("/")) {
    return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
  }
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>{children}</a>;
}
