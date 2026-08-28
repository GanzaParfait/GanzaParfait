"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteSettings } from "@/lib/supabase";
import { HeroRenderer } from "./HeroSection";

const FRAME_WIDTH = 1440;
const FRAME_HEIGHT = 900;

export default function HeroPreviewFrame({
  settings,
  previewTheme = "light",
  fit = "width",
}: {
  settings: SiteSettings;
  previewTheme?: "light" | "dark";
  fit?: "width" | "contain";
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const isLight = previewTheme !== "dark";

  useEffect(() => {
    const node = shellRef.current;
    if (!node) return;

    const update = () => {
      const width = node.clientWidth;
      const height = node.clientHeight;
      if (!width || !height) return;
      const widthScale = width / FRAME_WIDTH;
      const heightScale = height / FRAME_HEIGHT;
      setScale(fit === "contain" ? Math.min(widthScale, heightScale) : widthScale);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [fit]);

  return (
    <div
      ref={shellRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: isLight ? "#ffffff" : "#050816",
      }}
    >
      <div
        data-theme={isLight ? "light" : "dark"}
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
          background: isLight ? "#ffffff" : "#050816",
          colorScheme: isLight ? "light" : "dark",
        }}
      >
        <HeroRenderer settings={settings} isPreview />
      </div>
    </div>
  );
}
