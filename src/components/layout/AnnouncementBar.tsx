"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import Link from "next/link";
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiCloseLine,
  RiFileTextLine,
  RiLink,
  RiMapPinLine,
  RiFacebookFill,
  RiLinkedinFill,
  RiMegaphoneLine,
  RiShareForwardLine,
  RiTimeLine,
  RiTwitterXFill,
  RiVolumeMuteLine,
  RiVolumeUpLine,
  RiWhatsappLine,
  RiCheckLine,
} from "react-icons/ri";
import type {
  AnnouncementBarPosition,
  AnnouncementModalDock,
  AnnouncementSharePlatform,
  SiteSettings,
} from "@/lib/supabase";
import {
  announcementMedia,
  announcementCalendarTargets,
  announcementSharePath,
  announcementSharePlatforms,
  fileName,
  shouldAutoOpenAnnouncement,
} from "@/lib/announcement";
import { formatAnnouncementDetailHtml } from "@/lib/announcement-format";
import { cloudinaryVideoDeliveryUrl, cloudinaryVideoPosterUrl, mediaStillUrl } from "@/lib/cloudinary-url";
import { buildShareUrl, SHARE_PRESETS } from "@/lib/utm";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import { useLockPageScroll } from "@/hooks/useLockPageScroll";

function barPositionOf(settings: SiteSettings): AnnouncementBarPosition {
  const value = settings.announcementBarPosition;
  if (value === "bottom" || value === "left" || value === "right") return value;
  return "top";
}

export default function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const text =
    settings.announcementText?.trim() ||
    settings.announcementHeadline?.trim() ||
    settings.announcementEyebrow?.trim() ||
    "";
  const position = barPositionOf(settings);

  useEffect(() => {
    if (!settings.announcementIsActive || !text) return;
    if (typeof window === "undefined") return;
    if (shouldAutoOpenAnnouncement(window.location.search)) {
      setOpen(true);
    }
  }, [settings.announcementIsActive, text]);

  if (!settings.announcementIsActive || !text) return null;

  const isEdgeChip = position === "left" || position === "right";

  return (
    <>
      <button
        type="button"
        className={`announcement-bar is-${position}${isEdgeChip ? " is-chip" : ""}`}
        onClick={() => setOpen(true)}
        aria-label={isEdgeChip ? `Announcement: ${text}` : undefined}
      >
        {isEdgeChip ? (
          <>
            <span className="announcement-bar-mark" aria-hidden="true">
              <RiMegaphoneLine size={16} />
            </span>
            <span className="announcement-bar-copy">
              <span className="announcement-bar-title">{text}</span>
              <span className="announcement-bar-cta">
                Continue <RiArrowRightLine size={14} />
              </span>
            </span>
          </>
        ) : (
          <>
            <span>{text}</span>
            <span className="announcement-bar-cta">
              Continue <RiArrowRightLine size={14} />
            </span>
          </>
        )}
      </button>
      {open ? <AnnouncementOverlay settings={settings} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function modalDockOf(settings: SiteSettings): AnnouncementModalDock {
  const value = settings.announcementModalDock;
  if (value === "left" || value === "right") return value;
  return "center";
}

export function AnnouncementOverlay({ settings, onClose }: { settings: SiteSettings; onClose: () => void }) {
  const titleId = useId();
  const requestedDock = modalDockOf(settings);
  // Left/right dock only applies with "Details underneath" (stack) layout
  const dock =
    settings.announcementLayout === "stack" && (requestedDock === "left" || requestedDock === "right")
      ? requestedDock
      : "center";
  useHistoryBackClose(true, onClose);
  useLockPageScroll(true, "announcement-open");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`announcement-layer is-dock-${dock}`}
      role="presentation"
      onClick={onClose}
    >
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
  const [holding, setHolding] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [copied, setCopied] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number | null>(null);
  const holdPointerId = useRef<number | null>(null);
  const holdingRef = useRef(false);
  const sheetTouchY = useRef<number | null>(null);
  const sheetDragY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dock = modalDockOf(settings);
  const layout =
    settings.announcementLayout === "stack" || dock === "left" || dock === "right" ? "stack" : "side";
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
  const isVideoFrame = Boolean(frame?.type === "video" && !preview);
  const adminMuted = settings.announcementVideoMuted !== false;
  const allowSoundControl = !adminMuted;
  const storyPaused = paused || holding;
  // Hover pause is for image story bars only — video keeps playing unless held
  const videoPlaying = Boolean(isVideoFrame && !videoPaused && !holding);
  const platforms = settings.announcementShare === false ? [] : announcementSharePlatforms(settings);
  const mediaKicker = settings.announcementMediaKicker?.trim() || "";
  const mediaTitle = settings.announcementMediaTitle?.trim() || "";
  const dateShort = shortDateLabel(settings.announcementDate);
  const placeShort = shortPlaceLabel(settings.announcementPlace);
  const placeUrl = settings.announcementPlaceUrl?.trim() || "";
  const detailHtml = detail ? formatAnnouncementDetailHtml(detail) : "";
  const videoSrc =
    frame?.type === "video" ? cloudinaryVideoDeliveryUrl(frame.url, { width: 1400 }) || frame.url : "";
  const videoPoster =
    frame?.type === "video"
      ? frame.poster || cloudinaryVideoPosterUrl(frame.url, { width: 1200 }) || undefined
      : undefined;
  const previewStill =
    frame?.type === "video"
      ? videoPoster || mediaStillUrl(frame.url, { width: 1200, isVideo: true })
      : frame?.url;

  useEffect(() => {
    setIndex(0);
    setVideoPaused(false);
    setMuted(true);
    setHolding(false);
    setVideoProgress(0);
    setProgressKey(0);
  }, [visuals.map((item) => item.url).join("|")]);

  useEffect(() => {
    setVideoPaused(false);
    setMuted(true);
    setHolding(false);
    setVideoProgress(0);
  }, [index]);

  useEffect(() => {
    if (adminMuted) setMuted(true);
  }, [adminMuted, index]);

  // Image slides: advance on dashboard interval (paused while holding / hover-pause)
  useEffect(() => {
    if (preview || visuals.length < 2 || storyPaused || isVideoFrame) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % visuals.length);
      setProgressKey((key) => key + 1);
    }, interval * 1000);
    return () => window.clearTimeout(timer);
  }, [preview, visuals.length, storyPaused, isVideoFrame, interval, index, progressKey]);

  useEffect(() => {
    setProgressKey((key) => key + 1);
  }, [index]);

  useEffect(() => {
    if (preview) return;
    const node = videoRef.current;
    if (!node || frame?.type !== "video") return;
    node.muted = adminMuted ? true : muted;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || videoPaused || holding) {
      node.pause();
      return;
    }
    void node.play().catch(() => setVideoPaused(true));
  }, [frame?.type, frame?.url, muted, adminMuted, videoPaused, holding, index, preview]);

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
      setVideoPaused(false);
      setProgressKey((key) => key + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview, visuals.length]);

  const goFrame = (delta: number) => {
    if (visuals.length < 2) return;
    setIndex((current) => (current + delta + visuals.length) % visuals.length);
    setVideoPaused(false);
    setVideoProgress(0);
    setProgressKey((key) => key + 1);
  };

  const beginHold = (pointerId: number) => {
    if (preview) return;
    holdPointerId.current = pointerId;
    holdingRef.current = true;
    setHolding(true);
  };

  const endHold = (pointerId?: number) => {
    if (pointerId != null && holdPointerId.current != null && pointerId !== holdPointerId.current) return;
    holdPointerId.current = null;
    holdingRef.current = false;
    setHolding(false);
    setVideoPaused(false);
  };

  const onMediaPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (preview) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, .announcement-media-nav, .announcement-video-sound, .announcement-dots")) return;
    beginHold(event.pointerId);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onMediaPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    endHold(event.pointerId);
  };

  const onMediaTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onMediaTouchEnd = (event: TouchEvent) => {
    endHold();
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

  const announcementShareUrl = () => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}${announcementSharePath(window.location.pathname)}`;
    const url = buildShareUrl(base, SHARE_PRESETS.copy("announcement", "open_announcement"));
    const withFlag = new URL(url);
    withFlag.searchParams.set("announce", "1");
    return withFlag.toString();
  };

  const copyAnnouncementLink = async () => {
    const url = announcementShareUrl();
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const nativeShareAnnouncement = async () => {
    const url = announcementShareUrl();
    if (!url || typeof navigator === "undefined") return;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: headline, text: headline, url });
        return;
      } catch {
        /* user cancelled or share failed — fall through */
      }
    }
    await copyAnnouncementLink();
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
      data-scroll-lock-allow={preview ? undefined : "true"}
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
        className={`announcement-media${holding ? " is-holding" : ""}`}
        onPointerDown={onMediaPointerDown}
        onPointerUp={onMediaPointerUp}
        onPointerCancel={onMediaPointerUp}
        onPointerLeave={(event) => {
          if (holdPointerId.current != null) endHold(event.pointerId);
        }}
        onTouchStart={onMediaTouchStart}
        onTouchEnd={onMediaTouchEnd}
      >
        {frame ? (
          frame.type === "video" && !preview ? (
            <>
              <video
                key={frame.url}
                ref={videoRef}
                className="announcement-frame is-video"
                src={videoSrc}
                poster={videoPoster}
                muted={adminMuted ? true : muted}
                autoPlay
                playsInline
                preload="auto"
                draggable={false}
                onTimeUpdate={() => {
                  const node = videoRef.current;
                  if (!node || !node.duration || !Number.isFinite(node.duration)) return;
                  setVideoProgress(Math.min(1, Math.max(0, node.currentTime / node.duration)));
                }}
                onLoadedMetadata={() => {
                  setVideoProgress(0);
                  if (!holdingRef.current) void videoRef.current?.play().catch(() => setVideoPaused(true));
                }}
                onEnded={() => {
                  setVideoProgress(1);
                  if (visuals.length > 1) goFrame(1);
                  else {
                    const node = videoRef.current;
                    if (!node) return;
                    node.currentTime = 0;
                    void node.play().catch(() => {});
                  }
                }}
                onPlay={() => {
                  if (!holdingRef.current) setVideoPaused(false);
                }}
                onPause={() => {
                  if (!holdingRef.current) setVideoPaused(true);
                }}
              />
              {allowSoundControl ? (
                <button
                  type="button"
                  className="announcement-video-sound is-icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMuted((current) => !current);
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  aria-pressed={!muted}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                >
                  {muted ? <RiVolumeMuteLine size={16} /> : <RiVolumeUpLine size={16} />}
                </button>
              ) : null}
            </>
          ) : (
            <img
              src={previewStill || frame.url}
              alt=""
              className="announcement-frame"
              draggable={false}
            />
          )
        ) : null}

        {mediaTitle && !videoPlaying ? (
          <div className="announcement-media-copy">
            {mediaKicker ? <p className="announcement-media-kicker">{mediaKicker}</p> : null}
            <p className="announcement-media-title">{accentMediaTitle(mediaTitle)}</p>
          </div>
        ) : null}

        {dateShort || placeShort ? (
          <div className="announcement-media-meta">
            {dateShort ? (
              <span>
                <RiCalendarLine size={13} aria-hidden="true" /> {dateShort}
              </span>
            ) : null}
            {placeShort ? (
              placeUrl ? (
                <a
                  href={placeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="announcement-place-link"
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <RiMapPinLine size={13} aria-hidden="true" /> {placeShort}
                </a>
              ) : (
                <span>
                  <RiMapPinLine size={13} aria-hidden="true" /> {placeShort}
                </span>
              )
            ) : null}
          </div>
        ) : null}

        {visuals.length > 1 ? (
          <>
            <button
              type="button"
              className="announcement-media-nav is-prev"
              aria-label="Previous media"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                goFrame(-1);
              }}
            >
              <RiArrowLeftSLine size={18} />
            </button>
            <button
              type="button"
              className="announcement-media-nav is-next"
              aria-label="Next media"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                goFrame(1);
              }}
            >
              <RiArrowRightSLine size={18} />
            </button>
          </>
        ) : null}

        {visuals.length > 0 ? (
          <div className="announcement-dots" role="tablist" aria-label="Announcement media">
            {visuals.map((item, frameIndex) => {
              const state = frameIndex < index ? "is-done" : frameIndex === index ? "is-on" : undefined;
              const isActiveVideo = frameIndex === index && item.type === "video" && !preview;
              return (
                <button
                  key={`${item.id}-${frameIndex === index ? progressKey : "idle"}`}
                  type="button"
                  role="tab"
                  aria-selected={frameIndex === index}
                  className={[
                    state,
                    storyPaused ? "is-paused" : undefined,
                    isActiveVideo ? "is-video" : undefined,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                  style={
                    frameIndex === index
                      ? isActiveVideo
                        ? ({ "--ann-video-progress": `${Math.round(videoProgress * 1000) / 10}%` } as CSSProperties)
                        : !storyPaused
                          ? ({ "--ann-progress-ms": `${interval * 1000}ms` } as CSSProperties)
                          : undefined
                      : undefined
                  }
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    setIndex(frameIndex);
                    setVideoPaused(false);
                    setVideoProgress(0);
                    setProgressKey((key) => key + 1);
                  }}
                />
              );
            })}
          </div>
        ) : null}
      </div>
      ) : null}
      <div className="announcement-copy" data-scroll-lock-allow={preview ? undefined : "true"}>
        <p className="announcement-kicker">{settings.announcementEyebrow?.trim() || "Announcement"}</p>
        <h2 id={titleId}>{headline}</h2>
        {detailHtml ? (
          <div className="announcement-detail" dangerouslySetInnerHTML={{ __html: detailHtml }} />
        ) : null}
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
                  {placeUrl ? (
                    <a
                      href={placeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="announcement-place-link"
                    >
                      <strong>{placeFact.primary}</strong>
                      {placeFact.secondary ? <em>{placeFact.secondary}</em> : null}
                    </a>
                  ) : (
                    <>
                      <strong>{placeFact.primary}</strong>
                      {placeFact.secondary ? <em>{placeFact.secondary}</em> : null}
                    </>
                  )}
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
                  <button
                    type="button"
                    className="announcement-share-more"
                    aria-label="More share options"
                    title="More share options"
                    onClick={() => void nativeShareAnnouncement()}
                  >
                    <RiShareForwardLine size={15} />
                  </button>
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
