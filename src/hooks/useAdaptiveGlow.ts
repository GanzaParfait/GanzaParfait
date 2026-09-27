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
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 140) continue;
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          const max = Math.max(pr, pg, pb);
          const min = Math.min(pr, pg, pb);
          if (max < 36 || min > 232) continue;
          if (max - min < 16) continue;
          r += pr;
          g += pg;
          b += pb;
          n += 1;
        }
        if (n > 0 && !cancelled) {
          setGlow(`${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)}`);
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
