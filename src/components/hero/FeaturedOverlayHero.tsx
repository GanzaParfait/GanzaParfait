"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { RiArrowRightLine, RiArrowRightSLine, RiVolumeMuteLine, RiVolumeUpLine } from "react-icons/ri";
import { SiteSettings } from "@/lib/supabase";
import { heroHighlights, heroImageFor, heroPortraitAlt, setting } from "@/lib/hero";
import { isVideoUrl } from "@/lib/media";
import { cloudinaryVideoDeliveryUrl, cloudinaryVideoPosterUrl } from "@/lib/cloudinary-url";

export default function FeaturedOverlayHero({
  settings,
  isPreview = false,
}: {
  settings: SiteSettings;
  isPreview?: boolean;
}) {
  const media = heroImageFor(settings, "featured_overlay");
  const highlights = heroHighlights(settings);
  const mobileX = settings.heroOverlayMobilePositionX ?? 78;
  const mobileY = settings.heroOverlayMobilePositionY ?? 12;
  const mobileZoom = (settings.heroOverlayMobileZoom ?? 100) / 100;
  const preferMuted = settings.heroOverlayMuted !== false;
  const [muted, setMuted] = useState(preferMuted);
  const [mediaReady, setMediaReady] = useState(!isVideoUrl(media));
  const kicker = [setting(settings, "heroAvailableText").trim(), String(settings.location || "").trim()]
    .filter(Boolean)
    .join(" · ");
  const video = isVideoUrl(media);
  const alt = heroPortraitAlt(settings);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStyle = {
    ["--hero-mobile-pos-x" as string]: `${mobileX}%`,
    ["--hero-mobile-pos-y" as string]: `${mobileY}%`,
    ["--hero-mobile-zoom" as string]: String(mobileZoom),
  } as CSSProperties;

  const desktopVideoSrc = useMemo(
    () => (video ? cloudinaryVideoDeliveryUrl(media, { width: 1600 }) : media),
    [video, media],
  );
  const mobileVideoSrc = useMemo(
    () => (video ? cloudinaryVideoDeliveryUrl(media, { width: 960 }) : media),
    [video, media],
  );
  // Never use the SEO portrait as poster — that is what flashed a person photo before the video.
  const posterSrc = useMemo(() => {
    if (!video) return undefined;
    return cloudinaryVideoPosterUrl(media, { width: 1400 }) || undefined;
  }, [video, media]);

  useEffect(() => {
    setMuted(preferMuted);
  }, [preferMuted, media]);

  useEffect(() => {
    setMediaReady(!video);
  }, [video, media]);

  useEffect(() => {
    if (!video || !videoRef.current) return;
    const node = videoRef.current;
    node.muted = muted;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      node.pause();
      node.removeAttribute("autoplay");
      return;
    }
    void node.play().catch(() => {});
  }, [video, desktopVideoSrc, mobileVideoSrc, muted]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    const node = videoRef.current;
    if (!node) return;
    node.muted = next;
    if (!next) {
      void node.play().catch(() => {});
    }
  };

  return (
    <section
      className={isPreview ? "hero-cinematic hero-layout-preview" : "hero-cinematic"}
      style={isPreview ? {
        height: "100%",
        minHeight: "100%",
        paddingBottom: "2rem",
        paddingTop: "3rem",
      } : undefined}
    >
      <div className={`hero-cinematic-media${mediaReady ? " is-ready" : ""}`}>
        {video ? (
          <video
            ref={videoRef}
            className="hero-cinematic-video"
            poster={posterSrc}
            autoPlay
            muted={muted}
            loop
            playsInline
            preload={isPreview ? "metadata" : "metadata"}
            aria-label={alt}
            style={mediaStyle}
            onLoadedData={() => setMediaReady(true)}
            onCanPlay={() => setMediaReady(true)}
          >
            <source src={mobileVideoSrc} media="(max-width: 768px)" type="video/mp4" />
            <source src={desktopVideoSrc} type="video/mp4" />
          </video>
        ) : (
          <img
            src={media}
            alt={alt}
            width={1600}
            height={2000}
            decoding="async"
            fetchPriority={isPreview ? "low" : "high"}
            style={mediaStyle}
            onLoad={() => setMediaReady(true)}
          />
        )}
        <div className="hero-cinematic-shade" aria-hidden="true" />
        {video && !isPreview ? (
          <button
            type="button"
            className="hero-cinematic-mute"
            onClick={toggleMute}
            aria-pressed={!muted}
            aria-label={muted ? "Unmute background video" : "Mute background video"}
          >
            {muted ? <RiVolumeMuteLine size={16} /> : <RiVolumeUpLine size={16} />}
            <span>{muted ? "Muted" : "Sound"}</span>
          </button>
        ) : null}
      </div>

      <div className="container hero-cinematic-inner">
        <div className="hero-cinematic-copy">
          {kicker ? <p className="hero-cinematic-kicker">{kicker}</p> : null}
          <h1 className="hero-cinematic-title">{setting(settings, "heroHeadline")}</h1>
          <Link href={setting(settings, "heroPrimaryCtaHref")} className="hero-cinematic-action">
            {setting(settings, "heroPrimaryCtaLabel")}
            <RiArrowRightLine size={16} />
          </Link>
        </div>

        <aside className="hero-cinematic-card">
          <p className="hero-cinematic-card-label">{setting(settings, "heroCardLabel")}</p>
          <p className="hero-cinematic-card-body">{setting(settings, "heroCardBody")}</p>
          {highlights.length > 0 ? (
            <div className="hero-cinematic-highlights">
              {highlights.map((item) => (
                <div key={`${item.value}-${item.label}`} className="hero-cinematic-chip">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          <Link href={setting(settings, "heroCardCtaHref")} className="hero-cinematic-card-cta">
            <span className="hero-cinematic-play">
              <RiArrowRightSLine size={18} />
            </span>
            {setting(settings, "heroCardCtaLabel")}
          </Link>
        </aside>
      </div>
    </section>
  );
}
