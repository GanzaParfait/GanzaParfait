"use client";

import type { CSSProperties } from "react";
import { mediaStillUrl } from "@/lib/cloudinary-url";
import { isVideoUrl } from "@/lib/projects";

/** Dashboard / admin thumbnail that never feeds a video URL into <img>. */
export default function MediaThumb({
  src,
  alt = "",
  className,
  width,
  style,
  showVideoBadge = true,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  style?: CSSProperties;
  showVideoBadge?: boolean;
}) {
  if (!src || src.includes("placeholder")) {
    return <span className={className} style={style} />;
  }

  const video = isVideoUrl(src);
  const still = mediaStillUrl(src, { width: width || 320, isVideo: video });

  if (!still && video) {
    return (
      <span className={className} style={{ position: "relative", display: "block", background: "#0b1329", ...style }}>
        <video src={src} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {showVideoBadge ? <VideoBadge /> : null}
      </span>
    );
  }

  return (
    <span className={className} style={{ position: "relative", display: "block", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={still || src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      {video && showVideoBadge ? <VideoBadge /> : null}
    </span>
  );
}

function VideoBadge() {
  return (
    <span
      style={{
        position: "absolute",
        left: "0.3rem",
        bottom: "0.3rem",
        fontSize: "0.55rem",
        fontWeight: 800,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "#fff",
        background: "rgba(11,25,44,0.72)",
        padding: "0.1rem 0.3rem",
        borderRadius: "999px",
        pointerEvents: "none",
      }}
    >
      Video
    </span>
  );
}
