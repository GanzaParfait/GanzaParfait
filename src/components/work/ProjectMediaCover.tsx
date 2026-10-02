"use client";

import { useEffect, useRef, useState } from "react";
import { RiVolumeMuteLine, RiVolumeUpLine } from "react-icons/ri";
import ResilientCover from "@/components/work/ResilientCover";
import { isVideoUrl } from "@/lib/projects";
import { cloudinaryVideoDeliveryUrl, mediaStillUrl } from "@/lib/cloudinary-url";

const PREVIEW_SECONDS = 4;

/**
 * Project card / hero media: still image, or a muted autoplay teaser of the
 * featured video (first few seconds) that pauses when off-screen or reduced-motion.
 */
export default function ProjectMediaCover({
  src,
  alt,
  poster,
  wide = false,
  priority = false,
  className = "",
  sizes,
  autoplayPreview = true,
  /** When true, show an unmute control (autoplay still starts muted). */
  allowSound = false,
}: {
  src: string;
  alt: string;
  poster?: string;
  wide?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  /** When false, only show the poster/still (e.g. static OG contexts). */
  autoplayPreview?: boolean;
  allowSound?: boolean;
}) {
  const video = isVideoUrl(src);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inViewRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [muted, setMuted] = useState(true);

  const delivery = video ? cloudinaryVideoDeliveryUrl(src, { width: wide ? 1280 : 720 }) : src;
  const posterSrc = poster || mediaStillUrl(src, { width: wide ? 1280 : 720, isVideo: video }) || undefined;
  const shotClass = className || "selected-shot-img";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    setReady(false);
    setMuted(true);
  }, [delivery]);

  useEffect(() => {
    if (!video || !autoplayPreview || reduceMotion) return;
    const node = videoRef.current;
    if (!node) return;

    node.muted = muted;
    node.defaultMuted = true;
    node.playsInline = true;
    node.setAttribute("playsinline", "");

    const markReady = () => setReady(true);

    const playTeaser = () => {
      if (!inViewRef.current) return;
      // Autoplay must stay muted until the visitor explicitly unmutes.
      if (!allowSound || muted) node.muted = true;
      try {
        if (node.currentTime > PREVIEW_SECONDS || node.ended) {
          node.currentTime = 0;
        }
      } catch {
        // ignore seek errors before metadata
      }
      const attempt = node.play();
      if (attempt) {
        void attempt.then(markReady).catch(() => {});
      }
    };

    const onTimeUpdate = () => {
      // When unmuted with sound allowed, let the clip play through.
      if (allowSound && !muted) return;
      if (node.currentTime < PREVIEW_SECONDS) return;
      try {
        node.currentTime = 0;
      } catch {
        // ignore
      }
      if (inViewRef.current) {
        void node.play().catch(() => {});
      } else {
        node.pause();
      }
    };

    const onCanPlay = () => {
      markReady();
      if (inViewRef.current) playTeaser();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        inViewRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        if (inViewRef.current) {
          playTeaser();
        } else {
          node.pause();
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75] },
    );

    node.addEventListener("loadeddata", markReady);
    node.addEventListener("canplay", onCanPlay);
    node.addEventListener("playing", markReady);
    node.addEventListener("timeupdate", onTimeUpdate);
    observer.observe(node);

    if (typeof node.getBoundingClientRect === "function") {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const visible = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
      if (visible) {
        inViewRef.current = true;
        playTeaser();
      }
    }

    return () => {
      inViewRef.current = false;
      node.removeEventListener("loadeddata", markReady);
      node.removeEventListener("canplay", onCanPlay);
      node.removeEventListener("playing", markReady);
      node.removeEventListener("timeupdate", onTimeUpdate);
      observer.disconnect();
      node.pause();
    };
  }, [video, delivery, autoplayPreview, reduceMotion, allowSound, muted]);

  if (!video) {
    return (
      <ResilientCover
        src={src}
        alt={alt}
        wide={wide}
        priority={priority}
        className={className}
        sizes={sizes}
      />
    );
  }

  if (reduceMotion || !autoplayPreview) {
    if (posterSrc) {
      return <ResilientCover src={posterSrc} alt={alt} wide={wide} priority={priority} className={className} sizes={sizes} />;
    }
    return (
      <video
        className={shotClass}
        src={delivery}
        poster={posterSrc}
        muted
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    );
  }

  return (
    <span
      className={`project-media-cover${ready ? " is-ready" : ""}`}
      style={{ display: "block", width: "100%", height: "100%", position: "relative", background: "#07111f" }}
    >
      {posterSrc ? (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className={shotClass}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: ready ? 0 : 1,
            transition: "opacity 0.35s ease",
            pointerEvents: "none",
          }}
        />
      ) : null}
      <video
        ref={videoRef}
        className={shotClass}
        src={delivery}
        poster={posterSrc}
        muted={muted}
        autoPlay
        playsInline
        loop={false}
        preload="auto"
        aria-label={alt}
        onLoadedData={() => setReady(true)}
        onPlaying={() => setReady(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: ready || !posterSrc ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      />
      {allowSound ? (
        <button
          type="button"
          className="project-media-sound"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const next = !muted;
            setMuted(next);
            const node = videoRef.current;
            if (!node) return;
            node.muted = next;
            if (!next) void node.play().catch(() => {});
          }}
          aria-pressed={!muted}
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? <RiVolumeMuteLine size={14} /> : <RiVolumeUpLine size={14} />}
          <span>{muted ? "Muted" : "Sound"}</span>
        </button>
      ) : null}
    </span>
  );
}
