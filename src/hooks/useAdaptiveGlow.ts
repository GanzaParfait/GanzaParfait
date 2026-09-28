"use client";

import { useEffect, useState } from "react";

const FALLBACK = "14, 82, 168";

/**
 * Samples a cover image for a soft accent RGB used by Selected Work glow.
 * Falls back to brand primary when sampling is unavailable.
 */
export function useAdaptiveGlow(src?: string) {
  const [glow, setGlow] = useState(FALLBACK);

  useEffect(() => {
    if (!src) {
      setGlow(FALLBACK);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    if (/^https?:\/\//i.test(src)) img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 36;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const samples: { r: number; g: number; b: number; chroma: number }[] = [];
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 140) continue;
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          const max = Math.max(pr, pg, pb);
          const min = Math.min(pr, pg, pb);
          const chroma = max - min;
          if (max < 28 || min > 246) continue;
          if (chroma < 22) continue;
          samples.push({ r: pr, g: pg, b: pb, chroma });
        }
        samples.sort((a, b) => b.chroma - a.chroma);
        const top = samples.slice(0, Math.max(1, Math.ceil(samples.length * 0.18)));
        if (top.length && !cancelled) {
          const r = top.reduce((sum, sample) => sum + sample.r, 0) / top.length;
          const g = top.reduce((sum, sample) => sum + sample.g, 0) / top.length;
          const b = top.reduce((sum, sample) => sum + sample.b, 0) / top.length;
          setGlow(`${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`);
        }
      } catch {
        if (!cancelled) setGlow(FALLBACK);
      }
    };

    img.onerror = () => {
      if (!cancelled) setGlow(FALLBACK);
    };

    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return glow;
}
