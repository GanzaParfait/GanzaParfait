"use client";

import { useEffect, useState } from "react";
import SplitHero from "./SplitHero";
import FeaturedOverlayHero from "./FeaturedOverlayHero";
import MinimalCenteredHero from "./MinimalCenteredHero";
import FullCenteredHero from "./FullCenteredHero";
import { getLocalSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/supabase";

export default function HeroSection() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Sync initial settings
    setSettings(getLocalSettings());

    // Listen for live updates from admin dashboard
    const handleUpdate = (e: CustomEvent<SiteSettings>) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };

    window.addEventListener("site-settings-changed" as any, handleUpdate);
    return () => {
      window.removeEventListener("site-settings-changed" as any, handleUpdate);
    };
  }, []);

  if (settings.bannerLayout === "featured_overlay") {
    return <FeaturedOverlayHero settings={settings} />;
  }


  if (settings.bannerLayout === "full_centered_floating") {
    return <FullCenteredHero settings={settings} />;
  }

  return <SplitHero settings={settings} />;
}
