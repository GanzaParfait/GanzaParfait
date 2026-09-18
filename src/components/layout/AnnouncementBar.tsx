"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type TouchEvent } from "react";
import Link from "next/link";
import {
  RiArrowDownSLine,
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
  RiCheckLine,
} from "react-icons/ri";
import type { AnnouncementSharePlatform, SiteSettings } from "@/lib/supabase";
import {
  announcementMedia,
  announcementCalendarTargets,
  announcementSharePath,
  announcementSharePlatforms,
  fileName,
  shouldAutoOpenAnnouncement,
} from "@/lib/announcement";
import { buildShareUrl, SHARE_PRESETS } from "@/lib/utm";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

export default function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const text =
    settings.announcementText?.trim() ||
    settings.announcementHeadline?.trim() ||
    settings.announcementEyebrow?.trim() ||
    "";
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
  useHistoryBackClose(true, onClose);

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
  const [progressKey, setProgressKey] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const sheetTouchY = useRef<number | null>(null);
  const sheetDragY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const layout = settings.announcementLayout === "stack" ? "stack" : "side";
  const showMediaPanel = settings.announcementShowMedia !== false && visuals.length > 0;
  const sheetLayout = showMediaPanel ? layout : "stack";
  const isBottomSheet = !showMediaPanel && !preview && Boolean(onClose);
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
  const dateShort = shortDateLabel(settings.announcementDate);
  const placeShort = shortPlaceLabel(settings.announcementPlace);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
    setProgressKey(0);
  }, [visuals.map((item) => item.url).join("|")]);

  useEffect(() => {
    if (visuals.length < 2 || paused || playing) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % visuals.length);
      setProgressKey((key) => key + 1);
    }, interval * 1000);
    return () => window.clearInterval(timer);
  }, [visuals.length, paused, playing, interval]);

  useEffect(() => {
    setProgressKey((key) => key + 1);
  }, [index, paused, playing]);

  useEffect(() => {
    if (!calendarOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!calendarRef.current?.contains(event.target as Node)) setCalendarOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [calendarOpen]);

  useEffect(() => {
    if (preview || visuals.length < 2) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      setIndex((current) => (current + delta + visuals.length) % visuals.length);
      setPlaying(false);
      setProgressKey((key) => key + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview, visuals.length]);

  const goFrame = (delta: number) => {
    if (visuals.length < 2) return;
    setIndex((current) => (current + delta + visuals.length) % visuals.length);
    setPlaying(false);
    setProgressKey((key) => key + 1);
  };

  const onMediaTouchStart = (event: TouchEvent) => {
    if (visuals.length < 2) return;
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
    setPaused(true);
  };

  const onMediaTouchEnd = (event: TouchEvent) => {
    if (visuals.length < 2 || touchStartX.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    goFrame(delta < 0 ? 1 : -1);
  };

  const onSheetTouchStart = (event: TouchEvent) => {
    if (!isBottomSheet) return;
    sheetTouchY.current = event.changedTouches[0]?.clientY ?? null;
    sheetDragY.current = 0;
  };

  const onSheetTouchMove = (event: TouchEvent) => {
    if (!isBottomSheet || sheetTouchY.current == null || !sheetRef.current) return;
    const y = event.changedTouches[0]?.clientY ?? sheetTouchY.current;
    const delta = Math.max(0, y - sheetTouchY.current);
    sheetDragY.current = delta;
    if (delta > 0) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
      sheetRef.current.style.transition = "none";
    }
  };

  const onSheetTouchEnd = () => {
    if (!isBottomSheet || !sheetRef.current) return;
    const delta = sheetDragY.current;
    sheetTouchY.current = null;
    sheetDragY.current = 0;
    if (delta > 90) {
      sheetRef.current.style.transition = "transform 0.2s ease-out";
      sheetRef.current.style.transform = "translateY(110%)";
      window.setTimeout(() => onClose?.(), 180);
      return;
    }
    sheetRef.current.style.transition = "transform 0.22s ease-out";
    sheetRef.current.style.transform = "";
  };

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
  const calendar = announcementCalendarTargets(settings);

  const downloadIcs = () => {
    if (!calendar) return;
    const blob = new Blob([calendar.ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = calendar.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setCalendarOpen(false);
  };

  return (
    <div
      ref={sheetRef}
      className={`announcement-sheet is-${sheetLayout}${showMediaPanel ? "" : " is-content-only"}${preview ? " is-preview" : ""}`}
      role={preview ? undefined : "dialog"}
      aria-modal={preview ? undefined : true}
      aria-labelledby={titleId}
      onClick={(event) => event.stopPropagation()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={isBottomSheet ? onSheetTouchStart : undefined}
      onTouchMove={isBottomSheet ? onSheetTouchMove : undefined}
      onTouchEnd={isBottomSheet ? onSheetTouchEnd : undefined}
    >
      {onClose ? (
        <button type="button" className="announcement-close" onClick={onClose} aria-label="Close announcement">
          <RiCloseLine size={18} />
        </button>
      ) : null}
      {showMediaPanel ? (
      <div
        className="announcement-media"
        onTouchStart={onMediaTouchStart}
        onTouchEnd={onMediaTouchEnd}
      >
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
        ) : null}

        {(mediaTitle) && !playing ? (
          <div className="announcement-media-copy">
            {mediaKicker ? <p className="announcement-media-kicker">{mediaKicker}</p> : null}
            <p className="announcement-media-title">{accentMediaTitle(mediaTitle)}</p>
          </div>
        ) : null}

        {(dateShort || placeShort) && !playing ? (
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
          </div>
        ) : null}

        {visuals.length > 1 ? (
          <div className="announcement-dots" role="tablist" aria-label="Announcement media">
            {visuals.map((item, frameIndex) => {
              const state = frameIndex < index ? "is-done" : frameIndex === index ? "is-on" : undefined;
              return (
                <button
                  key={`${item.id}-${frameIndex === index ? progressKey : "idle"}`}
                  type="button"
                  role="tab"
                  aria-selected={frameIndex === index}
                  className={[state, paused || playing ? "is-paused" : undefined].filter(Boolean).join(" ") || undefined}
                      style={
                        frameIndex === index && !paused && !playing
                          ? ({ "--ann-progress-ms": `${interval * 1000}ms` } as CSSProperties)
                          : undefined
                      }
                  onClick={() => {
                    setIndex(frameIndex);
                    setPlaying(false);
                    setProgressKey((key) => key + 1);
                  }}
                />
              );
            })}
          </div>
        ) : null}
      </div>
      ) : null}
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
            ) : calendar ? (
              <div className="announcement-calendar" ref={calendarRef}>
                <button
                  type="button"
                  className="btn btn-outline"
                  aria-expanded={calendarOpen}
                  aria-haspopup="menu"
                  onClick={() => setCalendarOpen((open) => !open)}
                >
                  <RiCalendarLine size={15} /> {secondaryLabel} <RiArrowDownSLine size={15} />
                </button>
                {calendarOpen ? (
                  <div className="announcement-calendar-menu" role="menu">
                    <a
                      role="menuitem"
                      href={calendar.google}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setCalendarOpen(false);
                        onClose?.();
                      }}
                    >
                      Google Calendar
                    </a>
                    <button type="button" role="menuitem" onClick={downloadIcs}>
                      Download .ics
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <span className="btn btn-outline announcement-secondary-static" title="Add a date and time to enable calendar">
                <RiCalendarLine size={15} /> {secondaryLabel}
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
