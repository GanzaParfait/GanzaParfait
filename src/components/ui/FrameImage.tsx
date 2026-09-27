"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type NetworkInfo = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

function networkQuality() {
  if (typeof navigator === "undefined") return 75;
  const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  if (!connection) return 75;
  if (connection.saveData || connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") return 40;
  if (connection.effectiveType === "3g") return 55;
  return 75;
}

/**
 * Image frame that keeps a layout-matched skeleton until the file is ready.
 * Quality drops on slow connections and Save-Data.
 */
export default function FrameImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState(75);
  const optimized = src.startsWith("/") || /^https?:\/\//i.test(src);

  useEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 2800);
    return () => window.clearTimeout(timer);
  }, [src]);

  useEffect(() => {
    setQuality(networkQuality());
    const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    if (!connection?.addEventListener) return;
    const update = () => setQuality(networkQuality());
    connection.addEventListener("change", update);
    return () => connection.removeEventListener?.("change", update);
  }, []);

  return (
    <span className={`frame-shot${ready ? " is-ready" : " is-loading"}${className ? ` ${className}` : ""}`}>
      <span className="frame-skel" aria-hidden="true" />
      {optimized ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes || "(max-width: 800px) 92vw, 640px"}
          quality={quality}
          priority={priority}
          {...(priority ? {} : { loading: "lazy" as const })}
          onLoad={() => setReady(true)}
          onError={() => setReady(true)}
          className="frame-shot-img"
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setReady(true)}
          onError={() => setReady(true)}
          className="frame-shot-img"
        />
      )}
    </span>
  );
}
