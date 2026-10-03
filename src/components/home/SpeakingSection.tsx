"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  RiBarChart2Line,
  RiBookOpenLine,
  RiCloseLine,
  RiDatabase2Line,
  RiFlashlightLine,
  RiMapPinLine,
  RiTeamLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
} from "react-icons/ri";
import type { HomepageContent, SpeakingTopicIcon } from "@/lib/homepage";
import { isVideoUrl } from "@/lib/projects";
import { cloudinaryOptimizedUrl, cloudinaryVideoDeliveryUrl, cloudinaryVideoPosterUrl, mediaStillUrl } from "@/lib/cloudinary-url";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

function TopicIcon({ icon }: { icon: SpeakingTopicIcon }) {
  if (icon === "tools") return <RiBarChart2Line size={18} />;
  if (icon === "hands") return <RiTeamLine size={18} />;
  if (icon === "teams") return <RiFlashlightLine size={18} />;
  return <RiDatabase2Line size={18} />;
}

function StatIcon({ icon }: { icon: string }) {
  if (icon === "book") return <RiBookOpenLine size={18} />;
  if (icon === "pin") return <RiMapPinLine size={18} />;
  return <RiTeamLine size={18} />;
}

export default function SpeakingSection({
  speaking,
  attribution,
  embedded = false,
}: {
  speaking: HomepageContent["speaking"];
  attribution?: string;
  embedded?: boolean;
}) {
  const cite = attribution || "Prince Parfait GANZA";
  const quote = speaking.quote?.trim() || "Technology is more powerful when people can use it.";
  const video = Boolean(speaking.image && isVideoUrl(speaking.image));
  const preferMuted = speaking.videoMuted !== false;
  const [muted, setMuted] = useState(preferMuted);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useHistoryBackClose(lightboxOpen && !embedded, () => setLightboxOpen(false));
  const delivery = video && speaking.image
    ? cloudinaryVideoDeliveryUrl(speaking.image, { width: 1200 })
    : speaking.image
      ? cloudinaryOptimizedUrl(speaking.image, { width: 1200, height: 1500, crop: "fill" })
      : speaking.image;
  const poster = video && speaking.image ? cloudinaryVideoPosterUrl(speaking.image, { width: 1200 }) : undefined;
  const posX = speaking.imagePositionX ?? 50;
  const posY = speaking.imagePositionY ?? 28;
  const zoom = (speaking.imageZoom ?? 100) / 100;
  const mediaStyle = {
    ["--speaking-pos-x" as string]: `${posX}%`,
    ["--speaking-pos-y" as string]: `${posY}%`,
    ["--speaking-zoom" as string]: String(zoom),
  } as CSSProperties;
  const photoAlt =
    speaking.visualCaption?.trim() ||
    `Speaking and training with ${cite}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMuted(preferMuted);
    setReady(false);
    setFailed(false);
    setPosterOk(true);
  }, [preferMuted, speaking.image]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  useEffect(() => {
    if (!video || !videoRef.current || failed) return;
    const node = videoRef.current;
    node.muted = muted;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      node.pause();
      return;
    }
    void node.play().catch(() => {});
  }, [video, delivery, muted, failed]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    const node = videoRef.current;
    if (!node) return;
    node.muted = next;
    if (!next) void node.play().catch(() => {});
  };

  const openLightbox = () => {
    if (embedded || !speaking.image || failed) return;
    setLightboxOpen(true);
  };

  const lightboxSrc =
    mediaStillUrl(speaking.image, { width: 1600, isVideo: video }) ||
    delivery ||
    speaking.image;

  return (
    <section
      className={embedded ? "speaking-band speaking-embedded" : "speaking-band"}
      aria-label="Speaking and training"
      id="speaking"
      data-page-section={embedded ? undefined : true}
      data-section-label={embedded ? undefined : "Speaking"}
    >
      <div className="container speaking-shell">
        <div className="speaking-hero">
          <div className="speaking-intro">
            <p className="section-label">{speaking.label}</p>
            <h2>{speaking.title}</h2>
            {speaking.body ? <p className="speaking-lead">{speaking.body}</p> : null}

            {speaking.stats?.length ? (
              <ul className="speaking-stats">
                {speaking.stats.map((stat) => (
                  <li key={stat.label}>
                    <span className="speaking-stat-icon" aria-hidden="true">
                      <StatIcon icon={stat.icon} />
                    </span>
                    <em>{stat.label}</em>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="speaking-brand">
              {speaking.brandLogo ? (
                <img src={speaking.brandLogo} alt="" width={44} height={44} className="speaking-brand-mark" />
              ) : null}
              <div>
                <strong>{speaking.brandName}</strong>
                {speaking.brandTagline ? <span>{speaking.brandTagline}</span> : null}
                {speaking.brandNote ? <p>{speaking.brandNote}</p> : null}
              </div>
            </div>
          </div>

          <div
            className={`speaking-visual${speaking.image && !failed && !embedded ? " is-openable" : ""}`}
            style={mediaStyle}
            role={speaking.image && !failed && !embedded ? "button" : undefined}
            tabIndex={speaking.image && !failed && !embedded ? 0 : undefined}
            aria-label={speaking.image && !failed && !embedded ? `View ${photoAlt}` : undefined}
            onClick={openLightbox}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              openLightbox();
            }}
          >
            {speaking.image && !failed ? (
              video ? (
                <>
                  {poster && posterOk ? (
                    <img
                      src={poster}
                      alt=""
                      className="speaking-photo speaking-photo-poster"
                      width={720}
                      height={900}
                      onError={() => setPosterOk(false)}
                      style={{ opacity: ready ? 0 : 1, transition: "opacity 0.35s ease" }}
                    />
                  ) : null}
                  <video
                    ref={videoRef}
                    className="speaking-photo"
                    src={delivery}
                    muted={muted}
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    width={720}
                    height={900}
                    onLoadedData={() => setReady(true)}
                    onPlaying={() => setReady(true)}
                    onError={() => setFailed(true)}
                    style={{ opacity: ready ? 1 : poster && posterOk ? 0 : 1, transition: "opacity 0.35s ease" }}
                  />
                  <button
                    type="button"
                    className="speaking-video-sound"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleMute();
                    }}
                    aria-pressed={!muted}
                    aria-label={muted ? "Unmute video" : "Mute video"}
                  >
                    {muted ? <RiVolumeMuteLine size={16} /> : <RiVolumeUpLine size={16} />}
                    <span>{muted ? "Muted" : "Sound"}</span>
                  </button>
                </>
              ) : (
                <img
                  src={delivery}
                  alt={photoAlt}
                  className="speaking-photo"
                  width={720}
                  height={900}
                  onError={() => setFailed(true)}
                />
              )
            ) : (
              <div className="speaking-photo-fallback" aria-hidden="true" />
            )}
            {speaking.visualCaption ? (
              <p className="speaking-visual-caption">{speaking.visualCaption}</p>
            ) : null}
            <blockquote className="speaking-quote-card">
              <p>{quote}</p>
              <cite>— {cite}</cite>
            </blockquote>
            <div className="speaking-logo-card">
              {speaking.brandLogo ? <img src={speaking.brandLogo} alt="" width={36} height={36} /> : null}
              <div>
                <strong>{speaking.brandName}</strong>
                {speaking.brandTagline ? <span>{speaking.brandTagline}</span> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="speaking-cover">
          <div className="speaking-cover-head">
            <h3>{speaking.coverTitle}</h3>
            {speaking.coverSubtitle ? <p>{speaking.coverSubtitle}</p> : null}
          </div>
          <ul className="speaking-topics">
            {speaking.topics.map((topic) => (
              <li key={topic.title}>
                <span className={`speaking-topic-icon is-${topic.icon}`} aria-hidden="true">
                  <TopicIcon icon={topic.icon} />
                </span>
                <strong>{topic.title}</strong>
                <p>{topic.body}</p>
              </li>
            ))}
          </ul>
          <div className="speaking-foot">
            {speaking.footQuote ? (
              <p className="speaking-foot-quote">
                <span aria-hidden="true">“</span>
                {speaking.footQuote} — {cite}
              </p>
            ) : (
              <span />
            )}
            <div className="speaking-foot-brand">
              {speaking.brandLogo ? <img src={speaking.brandLogo} alt="" width={28} height={28} /> : null}
              <div>
                <strong>{speaking.brandName}</strong>
                {speaking.brandTagline ? <span>{speaking.brandTagline}</span> : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {mounted && lightboxOpen && lightboxSrc
        ? createPortal(
            <div
              className="speaking-lightbox svc-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={photoAlt}
              onClick={() => setLightboxOpen(false)}
            >
              <button
                type="button"
                className="svc-lightbox-close"
                aria-label="Close image"
                onClick={() => setLightboxOpen(false)}
              >
                <RiCloseLine size={20} />
              </button>
              <figure className="svc-lightbox-frame" onClick={(event) => event.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lightboxSrc} alt={photoAlt} className="svc-lightbox-img" />
                {(speaking.visualCaption || speaking.brandName) ? (
                  <figcaption>
                    <strong>{speaking.brandName || "Speaking"}</strong>
                    {speaking.visualCaption ? <span>{speaking.visualCaption}</span> : null}
                  </figcaption>
                ) : null}
              </figure>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
