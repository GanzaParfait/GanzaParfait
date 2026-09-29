"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { RiImageLine } from "react-icons/ri";

type NetInfo = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: string, cb: () => void) => void;
  removeEventListener?: (type: string, cb: () => void) => void;
};

function connectionIsSlow() {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
  if (!conn) return false;
  return (
    Boolean(conn.saveData) ||
    conn.effectiveType === "slow-2g" ||
    conn.effectiveType === "2g" ||
    conn.effectiveType === "3g"
  );
}

function useSlowNetwork() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
    const update = () => setSlow(connectionIsSlow());
    update();
    conn?.addEventListener?.("change", update);
    return () => conn?.removeEventListener?.("change", update);
  }, []);
  return slow;
}

export default function ResilientCover({
  src,
  alt,
  wide = false,
  priority = false,
  className = "",
  sizes: sizesOverride,
}: {
  src: string;
  alt: string;
  wide?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const slow = useSlowNetwork();
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const local = src.startsWith("/") && !src.startsWith("//");
  const remote = /^https?:\/\//i.test(src);
  const sizes = slow
    ? "280px"
    : sizesOverride ||
      (wide
        ? "(max-width: 900px) 92vw, (max-width: 1200px) 55vw, 646px"
        : "(max-width: 900px) 92vw, (max-width: 1200px) 30vw, 360px");

  const retry = () => {
    setFailed(false);
    setAttempt((value) => value + 1);
  };

  if (failed) {
    return (
      <span
        className="media-fallback"
        role="button"
        tabIndex={0}
        aria-label="Reload image"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          retry();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.stopPropagation();
          retry();
        }}
      >
        <RiImageLine aria-hidden="true" />
      </span>
    );
  }

  const shotClass = className || "selected-shot-img";

  if (local || remote) {
    return (
      <Image
        key={attempt}
        src={src}
        alt={alt}
        width={slow ? 640 : 1200}
        height={slow ? 400 : 750}
        sizes={sizes}
        quality={75}
        priority={priority && !slow}
        loading={priority && !slow ? undefined : "lazy"}
        className={shotClass}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <img
      key={attempt}
      src={src}
      alt={alt}
      width={1200}
      height={750}
      loading="lazy"
      decoding="async"
      className={shotClass}
      onError={() => setFailed(true)}
    />
  );
}
