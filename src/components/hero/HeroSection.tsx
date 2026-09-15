"use client";

import { useEffect, useState } from "react";
import SplitHero from "./SplitHero";
import FeaturedOverlayHero from "./FeaturedOverlayHero";
import FullCenteredHero from "./FullCenteredHero";
import type { HeroLayoutType, SiteSettings } from "@/lib/supabase";
import { carouselLayouts, settingsForLayout } from "@/lib/hero";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const MOBILE_MAX = 900;

export function HeroRenderer({
  settings,
  isPreview = false,
}: {
  settings: SiteSettings;
  isPreview?: boolean;
}) {
  if (settings.bannerLayout === "featured_overlay") {
    return <FeaturedOverlayHero settings={settings} isPreview={isPreview} />;
  }
  if (settings.bannerLayout === "full_centered_floating") {
    return <FullCenteredHero settings={settings} isPreview={isPreview} />;
  }
  return <SplitHero settings={settings} isPreview={isPreview} />;
}

export default function HeroSection() {
  const settings = useSiteSettings();
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  // Start false so SSR + mobile first paint only show the live DB layout (no carousel flash).
  const [allowCarousel, setAllowCarousel] = useState(false);

  const live = (settings.bannerLayout || "split_portrait") as HeroLayoutType;
  const rotating = carouselLayouts(settings);
  const sequence = allowCarousel && rotating.length > 1 ? rotating : [live];
  const active = sequence[index] && sequence.includes(sequence[index]) ? sequence[index] : sequence[0];
  const intervalSeconds = Math.min(20, Math.max(4, settings.heroCarouselInterval || 8));

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const sync = () => setAllowCarousel(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const start = sequence.indexOf(live);
    setIndex(start >= 0 ? start : 0);
  }, [live, sequence.join("|")]);

  useEffect(() => {
    if (sequence.length < 2 || paused) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const timer = window.setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % sequence.length);
        setFading(false);
      }, 280);
    }, intervalSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [sequence.length, paused, intervalSeconds, sequence.join("|")]);

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={fading ? "hero-carousel-fade is-fading" : "hero-carousel-fade"}>
        <HeroRenderer settings={settingsForLayout(settings, active)} />
      </div>
      {sequence.length > 1 ? (
        <div className="hero-carousel-dots" role="tablist" aria-label="Hero layouts">
          {sequence.map((layout, dot) => (
            <button
              key={layout}
              type="button"
              role="tab"
              aria-selected={dot === index}
              aria-label={`Show layout ${dot + 1}`}
              className={dot === index ? "is-active" : undefined}
              onClick={() => {
                setFading(false);
                setIndex(dot);
              }}
            />
          ))}
        </div>
      ) : (
        <a href="#manifesto" className="hero-story-cue">
          <span>The story</span>
        </a>
      )}
    </div>
  );
}
