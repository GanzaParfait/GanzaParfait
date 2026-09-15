"use client";

import { useCallback, useEffect, useRef } from "react";
import { RiZoomInLine, RiZoomOutLine } from "react-icons/ri";
import { FooterCompanyBand } from "@/components/layout/Footer";
import type { SiteSettings } from "@/lib/supabase";

/** 100% = frame filled (cover). Higher = crop in. Below 100% would letterbox — not allowed. */
const ZOOM_MIN = 100;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value)));
}

/** Drag / touch on the grid preview to reposition footer media, plus zoom controls. */
export default function FooterFocusDragPreview({
  settings,
  patch,
}: {
  settings: SiteSettings;
  patch: (next: Partial<SiteSettings>) => void;
}) {
  const dragging = useRef(false);
  const surface = useRef<HTMLDivElement>(null);
  const zoom = clampZoom(settings.footerCompanyZoom ?? 100);

  // Heal legacy values saved below cover (e.g. 80%) that letterboxed the band.
  useEffect(() => {
    const raw = settings.footerCompanyZoom ?? 100;
    if (raw < ZOOM_MIN && !settings.footerCompanyWholeImage) {
      patch({ footerCompanyZoom: ZOOM_MIN });
    }
  }, [settings.footerCompanyZoom, settings.footerCompanyWholeImage, patch]);

  const applyPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = surface.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
      patch({
        footerCompanyPositionX: Math.round(x),
        footerCompanyPositionY: Math.round(y),
        footerCompanyWholeImage: false,
      });
    },
    [patch],
  );

  const nudgeZoom = (delta: number) => {
    patch({
      footerCompanyZoom: clampZoom(zoom + delta),
      footerCompanyWholeImage: false,
    });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (settings.footerCompanyWholeImage) return;
    event.preventDefault();
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    applyPoint(event.clientX, event.clientY);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    event.preventDefault();
    applyPoint(event.clientX, event.clientY);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div style={{ gridColumn: "1 / -1", display: "grid", gap: "0.55rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={Boolean(settings.footerCompanyWholeImage)}
            onChange={(e) => patch({ footerCompanyWholeImage: e.target.checked })}
          />
          Render whole image (no crop)
        </label>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() =>
            patch({
              footerCompanyPositionX: 50,
              footerCompanyPositionY: 40,
              footerCompanyZoom: 100,
              footerCompanyWholeImage: false,
              footerCompanyFit: "cover",
              footerCompanyHeight: "regular",
            })
          }
        >
          Reset focus
        </button>
      </div>

      <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b" }}>
        Drag to reposition. Zoom in crops closer; zoom out returns to a full-frame fill (100%). Focus{" "}
        {settings.footerCompanyPositionX ?? 50}% · {settings.footerCompanyPositionY ?? 40}% · zoom {zoom}%.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center" }}>
        {[
          { label: "Center", x: 50, y: 50 },
          { label: "Face / top", x: 50, y: 18 },
          { label: "Left", x: 20, y: 40 },
          { label: "Right", x: 80, y: 40 },
          { label: "Bottom", x: 50, y: 82 },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => patch({ footerCompanyPositionX: preset.x, footerCompanyPositionY: preset.y, footerCompanyWholeImage: false })}
          >
            {preset.label}
          </button>
        ))}
        <span style={{ width: 1, height: "1.4rem", background: "#e2e8f0", margin: "0 0.15rem" }} aria-hidden />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          aria-label="Zoom out"
          disabled={settings.footerCompanyWholeImage || zoom <= ZOOM_MIN}
          onClick={() => nudgeZoom(-ZOOM_STEP)}
        >
          <RiZoomOutLine size={15} /> Out
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          aria-label="Zoom in"
          disabled={settings.footerCompanyWholeImage || zoom >= ZOOM_MAX}
          onClick={() => nudgeZoom(ZOOM_STEP)}
        >
          <RiZoomInLine size={15} /> In
        </button>
        <input
          type="range"
          min={ZOOM_MIN}
          max={ZOOM_MAX}
          step={ZOOM_STEP}
          value={zoom}
          disabled={settings.footerCompanyWholeImage}
          aria-label="Footer image zoom"
          onChange={(e) =>
            patch({
              footerCompanyZoom: clampZoom(Number(e.target.value)),
              footerCompanyWholeImage: false,
            })
          }
          style={{ width: "7.5rem", accentColor: "#0e52a8" }}
        />
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: "0.85rem", overflow: "hidden" }}>
        <p
          style={{
            margin: 0,
            padding: "0.55rem 0.85rem",
            fontSize: "0.7rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#64748b",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          Drag preview with grid
        </p>
        <div
          ref={surface}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDragStart={(event) => event.preventDefault()}
          style={{
            cursor: settings.footerCompanyWholeImage ? "default" : "grab",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            overflow: "hidden",
          }}
          title="Drag to reposition"
        >
          <FooterCompanyBand settings={settings} isDark={false} emptyHint flush showGrid />
        </div>
      </div>
    </div>
  );
}
