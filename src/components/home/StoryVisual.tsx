"use client";

import { useEffect, useState } from "react";

export default function StoryVisual({ images, title, organization }: { images: string[]; title: string; organization: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const frames = images.filter(Boolean);

  useEffect(() => {
    setIndex(0);
  }, [frames.join("|")]);

  useEffect(() => {
    if (frames.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % frames.length), 5200);
    return () => window.clearInterval(timer);
  }, [frames.length, paused]);

  if (!frames.length) {
    return (
      <div className="work-story-visual work-story-fallback" aria-hidden="true">
        <span>{organization}</span>
        <strong>{title}</strong>
      </div>
    );
  }

  return (
    <div
      className="work-gallery"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="work-gallery-frame">
        {frames.map((src, frame) => (
          <img key={src} src={src} alt="" className={frame === index ? "is-on" : undefined} />
        ))}
      </div>
      {frames.length > 1 ? (
        <div className="work-gallery-nav" role="tablist" aria-label={`${title} images`}>
          {frames.map((src, frame) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={frame === index}
              aria-label={`Show image ${frame + 1}`}
              className={frame === index ? "is-on" : undefined}
              onClick={() => setIndex(frame)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
