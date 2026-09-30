"use client";

import { useCallback, useRef } from "react";
import { RiCloseLine, RiZoomInLine, RiZoomOutLine } from "react-icons/ri";
import { dismissOnBackdrop } from "@/hooks/useHistoryBackClose";

const ZOOM_MIN = 100;
const ZOOM_MAX = 180;
const ZOOM_STEP = 10;

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value)));
}

function clampPct(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

const NATURAL = { x: 50, y: 50, zoom: 100 };

export default function HeroMobileFocusModal({
  image,
  x,
  y,
  zoom,
  saving = false,
  onChange,
  onClose,
  onApply,
}: {
  image: string;
  x: number;
  y: number;
  zoom: number;
  saving?: boolean;
  onChange: (next: { x: number; y: number; zoom: number }) => void;
  onClose: () => void;
  onApply: (next: { x: number; y: number; zoom: number }) => void;
}) {
  const surface = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const safeZoom = clampZoom(zoom);

  const applyPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = surface.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      onChange({
        x: clampPct(((clientX - rect.left) / rect.width) * 100),
        y: clampPct(((clientY - rect.top) / rect.height) * 100),
        zoom: safeZoom,
      });
    },
    [onChange, safeZoom],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
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
    <div className="dash-modal-layer hero-focus-layer" role="presentation" onMouseDown={dismissOnBackdrop(onClose)}>
      <div
        className="hero-focus-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Position the mobile hero image"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="hero-focus-head">
          <div>
            <p>Mobile image focus</p>
            <h2>Place the person in frame</h2>
          </div>
          <button type="button" className="hero-focus-close" onClick={onClose} aria-label="Close">
            <RiCloseLine size={18} />
          </button>
        </div>

        <div
          ref={surface}
          className="hero-focus-frame"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              draggable={false}
              style={{
                objectPosition: `${x}% ${y}%`,
                transform: safeZoom === 100 ? "none" : `scale(${safeZoom / 100})`,
                transformOrigin: `${x}% ${y}%`,
              }}
            />
          ) : (
            <span>Choose a banner image first.</span>
          )}
          <em>Drag to reposition</em>
        </div>

        <div className="hero-focus-tools">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onChange({ x, y, zoom: clampZoom(safeZoom - ZOOM_STEP) })}
            disabled={safeZoom <= ZOOM_MIN}
          >
            <RiZoomOutLine size={16} /> Out
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onChange({ x, y, zoom: clampZoom(safeZoom + ZOOM_STEP) })}
            disabled={safeZoom >= ZOOM_MAX}
          >
            <RiZoomInLine size={16} /> In
          </button>
          <span>
            {x}% · {y}% · {safeZoom}%
          </span>
        </div>

        <div className="hero-focus-presets">
          {[
            { label: "Face right", x: 78, y: 12, zoom: 100 },
            { label: "Face center", x: 55, y: 18, zoom: 110 },
            { label: "Upper body", x: 70, y: 28, zoom: 100 },
          ].map((preset) => (
            <button key={preset.label} type="button" className="btn btn-outline btn-sm" onClick={() => onChange(preset)}>
              {preset.label}
            </button>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange(NATURAL)} disabled={saving}>
            Reset
          </button>
        </div>

        <button
          type="button"
          className="btn btn-primary hero-focus-done"
          disabled={saving}
          onClick={() => onApply({ x, y, zoom: safeZoom })}
        >
          {saving ? "Saving…" : "Use this position"}
        </button>
      </div>
    </div>
  );
}
