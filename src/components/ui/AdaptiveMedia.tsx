"use client";

import { useEffect, useRef, useState } from "react";
import { RiVolumeMuteLine, RiVolumeUpLine } from "react-icons/ri";
import { isVideoUrl } from "@/lib/projects";
import { cloudinaryVideoDeliveryUrl, cloudinaryVideoPosterUrl } from "@/lib/cloudinary-url";

/**
 * Renders an image, or a muted autoplay video with optional unmute control.
 * Used by contact/about/homepage slots that accept either media type.
 */
export default function AdaptiveMedia({
  src,
  alt = "",
  className = "",
  width,
  height,
  muted: preferMuted = true,
  showSoundControl = true,
  objectFit = "cover",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  muted?: boolean;
  showSoundControl?: boolean;
  objectFit?: "cover" | "contain";
}) {
  const video = Boolean(src && isVideoUrl(src));
  const [muted, setMuted] = useState(preferMuted);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const delivery = video && src ? cloudinaryVideoDeliveryUrl(src, { width: width || 960 }) : src || "";
  const poster = video && src ? cloudinaryVideoPosterUrl(src, { width: width || 960 }) : undefined;

  useEffect(() => {
    setMuted(preferMuted);
    setReady(false);
    setFailed(false);
    setPosterOk(true);
  }, [preferMuted, src]);

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

  if (!src || failed) return null;

  if (!video) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit }}
      />
    );
  }

  return (
    <span className={className} style={{ display: "block", position: "relative", width: "100%", height: "100%", background: "#07111f" }}>
      {poster && posterOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          onError={() => setPosterOk(false)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit,
            opacity: ready ? 0 : 1,
            transition: "opacity 0.35s ease",
            pointerEvents: "none",
          }}
        />
      ) : null}
      <video
        ref={videoRef}
        src={delivery}
        muted={muted}
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-label={alt || "Video"}
        onLoadedData={() => setReady(true)}
        onPlaying={() => setReady(true)}
        onError={() => setFailed(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          opacity: ready || !poster || !posterOk ? 1 : 0,
          transition: "opacity 0.35s ease",
          display: "block",
        }}
      />
      {showSoundControl ? (
        <button
          type="button"
          className="adaptive-media-sound"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const next = !muted;
            setMuted(next);
            if (videoRef.current) {
              videoRef.current.muted = next;
              if (!next) void videoRef.current.play().catch(() => {});
            }
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
