"use client";

import SplitHero from "./SplitHero";
import FeaturedOverlayHero from "./FeaturedOverlayHero";
import FullCenteredHero from "./FullCenteredHero";
import type { SiteSettings } from "@/lib/supabase";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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
  return <HeroRenderer settings={settings} />;
}
