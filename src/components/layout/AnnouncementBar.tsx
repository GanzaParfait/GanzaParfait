"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  RiArrowDownSLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiCloseLine,
  RiFileTextLine,
  RiGroupLine,
  RiLink,
  RiMapPinLine,
  RiFacebookFill,
  RiLinkedinFill,
  RiPlayFill,
  RiTimeLine,
  RiTwitterXFill,
  RiWhatsappLine,
  RiCheckLine,
} from "react-icons/ri";
import type { AnnouncementSharePlatform, SiteSettings } from "@/lib/supabase";
import {
  announcementMedia,
  announcementSharePath,
  announcementSharePlatforms,
  fileName,
  shouldAutoOpenAnnouncement,
} from "@/lib/announcement";
import { buildShareUrl, SHARE_PRESETS } from "@/lib/utm";

export default function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const text = settings.announcementText?.trim() || "";
  const position = settings.announcementBarPosition === "bottom" ? "bottom" : "top";

  useEffect(() => {
    if (!settings.announcementIsActive || !text) return;
    if (typeof window === "undefined") return;
    if (shouldAutoOpenAnnouncement(window.location.search)) {
      setOpen(true);
    }
  }, [settings.announcementIsActive, text]);

  if (!settings.announcementIsActive || !text) return null;

  return (
    <>
      <button
        type="button"
        className={`announcement-bar is-${position}`}
        onClick={() => setOpen(true)}
      >
        <span>{text}</span>
        <span className="announcement-bar-cta">
          Continue <RiArrowRightLine size={14} />
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
  const [copied, setCopied] = useState(false);
  const layout = settings.announcementLayout === "stack" ? "stack" : "side";
  const headline = settings.announcementHeadline?.trim() || settings.announcementText?.trim() || "Announcement";
  const detail = settings.announcementDetail?.trim() || "";
  const label = settings.announcementCtaLabel?.trim() || "Continue";
  const href = settings.announcementLink?.trim() || "";
  const secondaryLabel = settings.announcementSecondaryLabel?.trim() || "";
  const secondaryHref = settings.announcementSecondaryHref?.trim() || "";
  const interval = Math.min(Math.max(settings.announcementInterval || 5, 3), 20);
  const frame = visuals[index];
  const platforms = settings.announcementShare === false ? [] : announcementSharePlatforms(settings);
  const mediaKicker = settings.announcementMediaKicker?.trim() || "";
  const mediaTitle = settings.announcementMediaTitle?.trim() || "";
  const audience = settings.announcementAudience?.trim() || "";
  const dateShort = shortDateLabel(settings.announcementDate);
  const placeShort = shortPlaceLabel(settings.announcementPlace);

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

  const copyAnnouncementLink = async () => {
    if (typeof window === "undefined") return;
    const base = `${window.location.origin}${announcementSharePath(window.location.pathname)}`;
    const url = buildShareUrl(base, SHARE_PRESETS.copy("announcement", "open_announcement"));
    const withFlag = new URL(url);
    withFlag.searchParams.set("announce", "1");
    await navigator.clipboard.writeText(withFlag.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareHref = (platform: Exclude<AnnouncementSharePlatform, "link">) => {
    if (typeof window === "undefined") return "#";
    const base = `${window.location.origin}${announcementSharePath(window.location.pathname)}`;
    const preset =
      platform === "linkedin"
        ? SHARE_PRESETS.linkedin("announcement", "share")
        : platform === "twitter"
          ? SHARE_PRESETS.twitter("announcement", "share")
          : platform === "facebook"
            ? SHARE_PRESETS.facebook("announcement", "share")
            : SHARE_PRESETS.whatsapp("announcement", "share");
    const shared = buildShareUrl(base, preset);
    const flagged = new URL(shared);
    flagged.searchParams.set("announce", "1");
    const encoded = encodeURIComponent(flagged.toString());
    const text = encodeURIComponent(headline);
    if (platform === "linkedin") return `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
    if (platform === "twitter") return `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`;
    if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    return `https://wa.me/?text=${text}%20${encoded}`;
  };

  const dateFact = splitFact(settings.announcementDate);
  const timeFact = splitFact(settings.announcementTime);
  const placeFact = splitFact(settings.announcementPlace);

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
                <span className="announcement-play-button" aria-hidden="true">
                  <RiPlayFill size={32} />
                </span>
              </button>
            )
          ) : (
            <img src={frame.url} alt="" className="announcement-frame" />
          )
        ) : (
          <div className="announcement-video-fallback" />
        )}

        {(mediaKicker || mediaTitle) && !playing ? (
          <div className="announcement-media-copy">
            {mediaKicker ? <p className="announcement-media-kicker">{mediaKicker}</p> : null}
            {mediaTitle ? <p className="announcement-media-title">{accentMediaTitle(mediaTitle)}</p> : null}
          </div>
        ) : null}

        {(dateShort || placeShort || audience) && !playing ? (
          <div className="announcement-media-meta">
            {dateShort ? (
              <span>
                <RiCalendarLine size={13} aria-hidden="true" /> {dateShort}
              </span>
            ) : null}
            {placeShort ? (
              <span>
                <RiMapPinLine size={13} aria-hidden="true" /> {placeShort}
              </span>
            ) : null}
            {audience ? (
              <span>
                <RiGroupLine size={13} aria-hidden="true" /> {audience}
              </span>
            ) : null}
          </div>
        ) : null}

        {visuals.length > 1 ? (
          <div className="announcement-dots" role="tablist" aria-label="Announcement media">
            {visuals.map((item, frameIndex) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={frameIndex === index}
                className={frameIndex === index ? "is-on" : undefined}
                onClick={() => {
                  setIndex(frameIndex);
                  setPlaying(false);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="announcement-copy">
        <p className="announcement-kicker">{settings.announcementEyebrow?.trim() || "Announcement"}</p>
        <h2 id={titleId}>{headline}</h2>
        {detail ? <p className="announcement-detail">{detail}</p> : null}
        {dateFact.primary || timeFact.primary || placeFact.primary ? (
          <ul className="announcement-facts">
            {dateFact.primary ? (
              <li>
                <span className="announcement-fact-icon" aria-hidden="true">
                  <RiCalendarLine size={15} />
                </span>
                <span>
                  <strong>{dateFact.primary}</strong>
                  {dateFact.secondary ? <em>{dateFact.secondary}</em> : null}
                </span>
              </li>
            ) : null}
            {timeFact.primary ? (
              <li>
                <span className="announcement-fact-icon" aria-hidden="true">
                  <RiTimeLine size={15} />
                </span>
                <span>
                  <strong>{timeFact.primary}</strong>
                  {timeFact.secondary ? <em>{timeFact.secondary}</em> : null}
                </span>
              </li>
            ) : null}
            {placeFact.primary ? (
              <li>
                <span className="announcement-fact-icon" aria-hidden="true">
                  <RiMapPinLine size={15} />
                </span>
                <span>
                  <strong>{placeFact.primary}</strong>
                  {placeFact.secondary ? <em>{placeFact.secondary}</em> : null}
                </span>
              </li>
            ) : null}
          </ul>
        ) : null}
        <div className="announcement-actions">
          {href ? (
            <ActionLink href={href} className="btn btn-primary" onClick={onClose}>
              {label} <RiArrowRightLine size={15} />
            </ActionLink>
          ) : null}
          {secondaryLabel ? (
            secondaryHref ? (
              <ActionLink href={secondaryHref} className="btn btn-outline" onClick={onClose}>
                <RiCalendarLine size={15} /> {secondaryLabel} <RiArrowDownSLine size={15} />
              </ActionLink>
            ) : (
              <span className="btn btn-outline announcement-secondary-static">
                <RiCalendarLine size={15} /> {secondaryLabel} <RiArrowDownSLine size={15} />
              </span>
            )
          ) : null}
        </div>
        {documents.length ? (
          <div className="announcement-docs">
            {documents.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                <RiFileTextLine size={15} /> {item.name || fileName(item.url)}
              </a>
            ))}
          </div>
        ) : null}
        {platforms.length || settings.announcementClosing ? (
          <div className="announcement-share">
            {platforms.length ? (
              <div>
                <p>Share this event</p>
                <div>
                  {platforms.map((platform) => {
                    if (platform === "link") {
                      return (
                        <button key="link" type="button" aria-label={copied ? "Copied" : "Copy link"} onClick={() => void copyAnnouncementLink()}>
                          {copied ? <RiCheckLine size={15} /> : <RiLink size={15} />}
                        </button>
                      );
                    }
                    const Icon =
                      platform === "linkedin"
                        ? RiLinkedinFill
                        : platform === "twitter"
                          ? RiTwitterXFill
                          : platform === "facebook"
                            ? RiFacebookFill
                            : RiWhatsappLine;
                    return (
                      <a key={platform} href={shareHref(platform)} target="_blank" rel="noopener noreferrer" aria-label={platform}>
                        <Icon size={15} />
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : (
              <span />
            )}
            {settings.announcementClosing ? <p className="announcement-closing">{settings.announcementClosing}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function accentMediaTitle(title: string) {
  const match = title.match(/^(.*?)(\bImpact\b)(.*)$/i);
  if (!match) return title;
  return (
    <>
      {match[1]}
      <span className="announcement-media-accent">{match[2]}</span>
      {match[3]}
    </>
  );
}

function splitFact(value?: string) {
  const text = value?.trim() || "";
  if (!text) return { primary: "", secondary: "" };

  const dateMatch = text.match(/^([A-Za-z]+),\s+(.+)$/);
  if (dateMatch) return { primary: dateMatch[1], secondary: dateMatch[2] };

  const timeMatch = text.match(/^(.+?)\s+(\([^)]+\))$/);
  if (timeMatch) return { primary: timeMatch[1], secondary: timeMatch[2] };

  const comma = text.indexOf(",");
  if (comma > 0) {
    return { primary: text.slice(0, comma).trim(), secondary: text.slice(comma + 1).trim() };
  }

  return { primary: text, secondary: "" };
}

function shortDateLabel(value?: string) {
  const text = value?.trim() || "";
  if (!text) return "";
  const match = text.match(/([A-Za-z]{3})\w*\s+(\d{1,2}),?\s+(\d{4})/);
  if (match) return `${match[1].toUpperCase()} ${match[2]}, ${match[3]}`;
  return text.toUpperCase();
}

function shortPlaceLabel(value?: string) {
  const text = value?.trim() || "";
  if (!text) return "";
  return text.split(",")[0]?.trim().toUpperCase() || text.toUpperCase();
}

function ActionLink({ href, className, onClick, children }: { href: string; className: string; onClick?: () => void; children: ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
      {children}
    </a>
  );
}
