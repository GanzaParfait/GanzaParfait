"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RiImageAddLine, RiZoomInLine, RiZoomOutLine } from "react-icons/ri";
import { FooterCompanyBand } from "@/components/layout/Footer";
import { footerNav } from "@/data/site-data";
import { setting } from "@/lib/hero";
import { socialIcon, socialsFor } from "@/lib/socials";
import type { SiteSettings } from "@/lib/supabase";

const ZOOM_MIN = 100;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value)));
}

function clampPct(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function mediaSlots(settings: SiteSettings) {
  const type = settings.footerCompanyMediaType || "image";
  const listed = [...(settings.footerCompanyMedia || [])];
  while (listed.length < 3) listed.push("");
  if (type === "video") return [listed[0] || settings.footerCompanyImage || ""];
  if (type === "image") return [listed[0] || settings.footerCompanyImage || ""];
  return listed.slice(0, 3);
}

export default function FooterFocusDragPreview({
  settings,
  patch,
  onPickMedia,
  saving,
  onSave,
}: {
  settings: SiteSettings;
  patch: (next: Partial<SiteSettings>) => void;
  onPickMedia: (slotIndex: number) => void;
  saving?: boolean;
  onSave?: () => void;
}) {
  const dragging = useRef(false);
  const surface = useRef<HTMLDivElement>(null);
  const slots = mediaSlots(settings);
  const filled = slots.map((url, index) => ({ url, index })).filter((item) => item.url);
  const [editIndex, setEditIndex] = useState(0);
  const activeIndex = filled.some((item) => item.index === editIndex)
    ? editIndex
    : filled[0]?.index ?? 0;

  const focusList = useMemo(() => {
    const next = [...(settings.footerCompanyMediaFocus || [])];
    while (next.length < 3) next.push({ x: 50, y: 40, zoom: 100 });
    return next;
  }, [settings.footerCompanyMediaFocus]);

  const activeFocus = focusList[activeIndex] || {
    x: settings.footerCompanyPositionX ?? 50,
    y: settings.footerCompanyPositionY ?? 40,
    zoom: settings.footerCompanyZoom ?? 100,
  };
  const zoom = clampZoom(activeFocus.zoom ?? 100);
  const mediaType = settings.footerCompanyMediaType || "image";
  const footerSocials = socialsFor(settings, "footer");

  useEffect(() => {
    if (filled.length && !filled.some((item) => item.index === editIndex)) {
      setEditIndex(filled[0].index);
    }
  }, [filled, editIndex]);

  const patchFocus = useCallback(
    (partial: { x?: number; y?: number; zoom?: number }) => {
      const next = focusList.map((item) => ({ ...item }));
      next[activeIndex] = {
        x: clampPct(partial.x ?? next[activeIndex]?.x ?? 50),
        y: clampPct(partial.y ?? next[activeIndex]?.y ?? 40),
        zoom: clampZoom(partial.zoom ?? next[activeIndex]?.zoom ?? 100),
      };
      patch({
        footerCompanyMediaFocus: next,
        footerCompanyPositionX: next[activeIndex].x,
        footerCompanyPositionY: next[activeIndex].y,
        footerCompanyZoom: next[activeIndex].zoom,
        footerCompanyWholeImage: false,
      });
    },
    [activeIndex, focusList, patch],
  );

  const applyPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = surface.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      patchFocus({ x, y });
    },
    [patchFocus],
  );

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

  const setSlotUrl = (index: number, url: string) => {
    const next = [...slots];
    next[index] = url;
    const cleaned = next.map((value) => value.trim()).filter(Boolean).slice(0, 3);
    patch({
      footerCompanyMedia: cleaned,
      footerCompanyImage: cleaned[0] || "",
    });
  };

  const slotCount = mediaType === "carousel" ? 3 : 1;

  return (
    <div
      style={{
        gridColumn: "1 / -1",
        display: "grid",
        gridTemplateColumns: "minmax(14rem, 17rem) minmax(0, 1fr)",
        gap: "0.85rem",
        alignItems: "start",
      }}
      className="footer-focus-layout"
    >
      <aside
        style={{
          display: "grid",
          gap: "0.75rem",
          padding: "0.85rem",
          borderRadius: "0.85rem",
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
          position: "sticky",
          top: "0.5rem",
        }}
      >
        <div>
          <p style={{ margin: "0 0 0.35rem", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b" }}>
            Media & focus
          </p>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", lineHeight: 1.45 }}>
            Select a slide, drag in the live preview, then save. Each slide keeps its own focus.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {Array.from({ length: slotCount }).map((_, index) => {
            const url = slots[index] || "";
            const selected = activeIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setEditIndex(index)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.6rem 1fr auto",
                  gap: "0.45rem",
                  alignItems: "center",
                  textAlign: "left",
                  padding: "0.4rem",
                  borderRadius: "0.65rem",
                  border: selected ? "1.5px solid #0e52a8" : "1px solid #e2e8f0",
                  background: selected ? "#eff6ff" : "#fff",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: "2.6rem",
                    height: "2rem",
                    borderRadius: "0.4rem",
                    overflow: "hidden",
                    background: "#e2e8f0",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: "#64748b",
                  }}
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "#0f172a" }}>
                    {mediaType === "video" ? "Video" : `Slide ${index + 1}`}
                    {selected ? " · editing" : ""}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.65rem",
                      color: "#94a3b8",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {url || "Empty — pick media"}
                  </span>
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onPickMedia(index);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      onPickMedia(index);
                    }
                  }}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.4rem",
                    padding: "0.3rem",
                    background: "#fff",
                    color: "#0e52a8",
                    display: "inline-flex",
                  }}
                  title="Choose from library"
                >
                  <RiImageAddLine size={14} />
                </span>
              </button>
            );
          })}
        </div>

        {mediaType === "carousel" || mediaType === "image" ? (
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#334155" }}>
            URL for selected slot
            <input
              value={slots[activeIndex] || ""}
              onChange={(event) => setSlotUrl(activeIndex, event.target.value)}
              placeholder="https://… or /images/…"
              style={{
                width: "100%",
                marginTop: "0.3rem",
                padding: "0.45rem 0.55rem",
                borderRadius: "0.4rem",
                border: "1px solid #cbd5e1",
                fontSize: "0.75rem",
              }}
            />
          </label>
        ) : (
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#334155" }}>
            Video URL
            <input
              value={slots[0] || ""}
              onChange={(event) => setSlotUrl(0, event.target.value)}
              placeholder="https://…/video.mp4"
              style={{
                width: "100%",
                marginTop: "0.3rem",
                padding: "0.45rem 0.55rem",
                borderRadius: "0.4rem",
                border: "1px solid #cbd5e1",
                fontSize: "0.75rem",
              }}
            />
          </label>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={Boolean(settings.footerCompanyWholeImage)}
            onChange={(e) => patch({ footerCompanyWholeImage: e.target.checked })}
          />
          Render whole image (no crop)
        </label>

        <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>
          Focus {activeFocus.x ?? 50}% · {activeFocus.y ?? 40}% · zoom {zoom}%
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
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
              style={{ justifyContent: "flex-start" }}
              onClick={() => patchFocus({ x: preset.x, y: preset.y })}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={settings.footerCompanyWholeImage || zoom <= ZOOM_MIN}
            onClick={() => patchFocus({ zoom: zoom - ZOOM_STEP })}
          >
            <RiZoomOutLine size={15} /> Out
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={settings.footerCompanyWholeImage || zoom >= ZOOM_MAX}
            onClick={() => patchFocus({ zoom: zoom + ZOOM_STEP })}
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
            onChange={(e) => patchFocus({ zoom: Number(e.target.value) })}
            style={{ width: "100%", accentColor: "#0e52a8" }}
          />
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() =>
            patchFocus({
              x: 50,
              y: 40,
              zoom: 100,
            })
          }
        >
          Reset this slide
        </button>

        {onSave ? (
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
            Save footer
          </button>
        ) : null}
      </aside>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: "1rem", overflow: "hidden", background: "#ffffff" }}>
        <div style={{ padding: "0.65rem 1rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
              Live footer preview
            </p>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", color: "#94a3b8" }}>
              Drag the media band to set focus for the selected slide
            </p>
          </div>
        </div>
        <div style={{ background: "#ffffff" }}>
          <div style={{ padding: "1.25rem 1.15rem 1rem", display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 200px", maxWidth: "22rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logos/logo-horizontal-blue.png" alt="" style={{ height: "1.85rem", objectFit: "contain", marginBottom: "0.75rem" }} />
              <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.55, marginBottom: "0.55rem" }}>{settings.bio}</p>
              <p style={{ fontSize: "0.72rem", color: "#0e52a8", fontWeight: 600, marginBottom: "0.65rem" }}>
                {setting(settings, "contactEmail")}
                {settings.phoneNumber ? ` · ${settings.phoneNumber}` : ""}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {footerSocials.map((link) => {
                  const Icon = socialIcon(link.platform);
                  return (
                    <span key={link.id} className="footer-social-icon" style={{ width: "1.75rem", height: "1.75rem" }}>
                      <Icon size={13} />
                    </span>
                  );
                })}
              </div>
            </div>
            {footerNav.map((group) => (
              <div key={group.label} style={{ minWidth: "11rem" }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0b192c", marginBottom: "0.55rem" }}>{group.label}</p>
                <div style={{ columns: 2, columnGap: "1rem" }}>
                  {group.links.map((link) => (
                    <p key={link.href} style={{ fontSize: "0.74rem", color: "#64748b", margin: "0 0 0.45rem", breakInside: "avoid" }}>
                      {link.label}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

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
            }}
            title="Drag to reposition selected slide"
          >
            <FooterCompanyBand
              settings={settings}
              isDark={false}
              emptyHint
              flush
              showGrid={!settings.footerCompanyWholeImage}
              forceIndex={activeIndex}
            />
          </div>

          <div style={{ padding: "0.85rem 1.15rem 1.05rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: 0 }}>
              © {new Date().getFullYear()} {setting(settings, "siteTitle")}. All rights reserved.
            </p>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: 0 }}>Privacy · Sitemap</p>
          </div>
        </div>
      </div>

          <style>{`
            @media (max-width: 900px) {
              .footer-focus-layout {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
    </div>
  );
}
