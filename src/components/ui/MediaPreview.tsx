"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { RiArrowLeftLine, RiArrowRightLine, RiCloseLine, RiPauseFill, RiPlayFill } from "react-icons/ri";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

export type PreviewItem = {
  src: string;
  kind?: "image" | "video";
  caption?: string;
};

function kindOf(src: string, kind?: PreviewItem["kind"]): "image" | "video" {
  if (kind) return kind;
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src) ? "video" : "image";
}

export default function MediaPreview({
  title,
  items,
  start = 0,
  onClose,
}: {
  title: string;
  items: PreviewItem[];
  start?: number;
  onClose: () => void;
}) {
  const list = items.filter((item) => item.src);
  const [index, setIndex] = useState(Math.min(Math.max(start, 0), Math.max(list.length - 1, 0)));
  const [playing, setPlaying] = useState(true);
  const current = list[index];
  const isVideo = current ? kindOf(current.src, current.kind) === "video" : false;
  useHistoryBackClose(Boolean(current), onClose);

  const step = useEffectEvent((delta: number) => {
    if (!list.length) return;
    setIndex((value) => (value + delta + list.length) % list.length);
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!playing || isVideo || list.length < 2) return;
    const timer = window.setInterval(() => step(1), 4200);
    return () => window.clearInterval(timer);
  }, [playing, isVideo, list.length, index]);

  if (!current) return null;

  return (
    <div className="media-preview" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="media-preview-chrome" onClick={(event) => event.stopPropagation()}>
        <div className="media-preview-top">
          <p>{title}{list.length > 1 ? ` · ${index + 1}/${list.length}` : ""}</p>
          <div>
            {list.length > 1 && !isVideo ? (
              <button type="button" aria-label={playing ? "Pause autoplay" : "Play autoplay"} onClick={() => setPlaying((value) => !value)}>
                {playing ? <RiPauseFill size={18} /> : <RiPlayFill size={18} />}
              </button>
            ) : null}
            <button type="button" className="media-preview-close" aria-label="Close preview" onClick={onClose}>
              <RiCloseLine size={22} />
            </button>
          </div>
        </div>
        <div className="media-preview-stage">
          {list.length > 1 ? (
            <button type="button" className="media-preview-nav is-prev" aria-label="Previous" onClick={() => step(-1)}>
              <RiArrowLeftLine size={20} />
            </button>
          ) : null}
          {isVideo ? (
            <video key={current.src} src={current.src} controls autoPlay playsInline preload="metadata" />
          ) : (
            <img key={current.src} src={current.src} alt={current.caption || title} />
          )}
          {list.length > 1 ? (
            <button type="button" className="media-preview-nav is-next" aria-label="Next" onClick={() => step(1)}>
              <RiArrowRightLine size={20} />
            </button>
          ) : null}
        </div>
        {current.caption ? <p className="media-preview-caption">{current.caption}</p> : null}
        {list.length > 1 ? (
          <div className="media-preview-dots" role="tablist" aria-label="Preview items">
            {list.map((item, itemIndex) => (
              <button
                key={`${item.src}-${itemIndex}`}
                type="button"
                role="tab"
                aria-selected={itemIndex === index}
                className={itemIndex === index ? "is-on" : undefined}
                onClick={() => setIndex(itemIndex)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
