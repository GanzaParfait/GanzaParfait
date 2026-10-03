"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { RiArrowRightLine, RiArrowRightSLine } from "react-icons/ri";
import { SiteSettings } from "@/lib/supabase";
import { heroHighlights, heroImageFor, heroPortraitAlt, setting } from "@/lib/hero";
import { isVideoUrl } from "@/lib/media";
import { cloudinaryOptimizedUrl, cloudinaryVideoDeliveryUrl, cloudinaryVideoPosterUrl } from "@/lib/cloudinary-url";

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
  /** Dashboard-only: no public mute control on the site. */
  const muted = settings.heroOverlayMuted !== false;
  const volume = Math.min(1, Math.max(0, (settings.heroOverlayVolume ?? 80) / 100));
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
    setMediaReady(!video);
  }, [video, media]);

  useEffect(() => {
    if (!video || !videoRef.current) return;
    const node = videoRef.current;
    node.muted = muted;
    node.volume = volume;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      node.pause();
      node.removeAttribute("autoplay");
      return;
    }
    // Unmuted autoplay is often blocked — fall back to muted so the clip still plays.
    void node.play().catch(() => {
      if (!muted) {
        node.muted = true;
        void node.play().catch(() => {});
      }
    });
  }, [video, desktopVideoSrc, mobileVideoSrc, muted, volume]);

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
            src={cloudinaryOptimizedUrl(media, { width: 1800, height: 2200, crop: "fill" }) || media}
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
