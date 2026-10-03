"use client";

import { useState, type ReactNode } from "react";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowRightLine,
  RiComputerLine,
  RiDraggable,
  RiImageAddLine,
  RiLockLine,
  RiLockUnlockLine,
  RiMegaphoneLine,
  RiSaveLine,
  RiSmartphoneLine,
} from "react-icons/ri";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import AnnouncementDetailEditor from "@/components/dashboard/AnnouncementDetailEditor";
import { AnnouncementCard, AnnouncementOverlay } from "@/components/layout/AnnouncementBar";
import {
  ANNOUNCEMENT_SHARE_MAX,
  announcementShareOptionsFromSettings,
  announcementSharePlatforms,
  fileName,
  mediaKind,
} from "@/lib/announcement";
import type {
  AnnouncementBarPosition,
  AnnouncementMedia,
  AnnouncementMediaSide,
  AnnouncementModalDock,
  AnnouncementSharePlatform,
  SiteSettings,
} from "@/lib/supabase";
import CustomSelect from "@/components/ui/CustomSelect";
import SocialMultiSelect from "@/components/ui/SocialMultiSelect";
import { resolvedSocials } from "@/lib/socials";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import { useLockPageScroll } from "@/hooks/useLockPageScroll";

const inputStyle = {
  width: "100%",
  padding: "0.45rem 0.65rem",
  borderRadius: "0.375rem",
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  fontSize: "0.8rem",
  color: "#0f172a",
  outline: "none",
} as const;

type AccordionId = "banner" | "copy" | "event" | "media" | "share";
type PreviewDevice = "desktop" | "mobile";

const PREVIEW_DEVICES: { id: PreviewDevice; label: string; Icon: typeof RiComputerLine }[] = [
  { id: "desktop", label: "Desktop", Icon: RiComputerLine },
  { id: "mobile", label: "Mobile", Icon: RiSmartphoneLine },
];

function barPositionOf(settings: SiteSettings): AnnouncementBarPosition {
  const value = settings.announcementBarPosition;
  if (value === "bottom" || value === "left" || value === "right") return value;
  return "top";
}

function modalDockOf(settings: SiteSettings): AnnouncementModalDock {
  const value = settings.announcementModalDock;
  if (value === "left" || value === "right") return value;
  return "center";
}

export default function AnnouncementEditor({
  settings,
  patch,
  onSave,
  saving = false,
}: {
  settings: SiteSettings;
  patch: (next: Partial<SiteSettings>) => void;
  onSave?: (next?: Partial<SiteSettings>) => void;
  saving?: boolean;
}) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [fullPreview, setFullPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editUnlocked, setEditUnlocked] = useState(Boolean(settings.announcementIsActive));
  const [openPanels, setOpenPanels] = useState<AccordionId[]>(["banner", "copy"]);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [stageSheetOpen, setStageSheetOpen] = useState(true);
  const media = settings.announcementMedia || [];
  const sharePlatforms = announcementSharePlatforms(settings);
  const shareOptions = announcementShareOptionsFromSettings(settings);
  const canEdit = editUnlocked;

  const applyAndSave = (next: Partial<SiteSettings>) => {
    const merged = { ...next };
    if (merged.announcementIsActive) {
      const bar =
        (merged.announcementText ?? settings.announcementText)?.trim() ||
        (merged.announcementHeadline ?? settings.announcementHeadline)?.trim() ||
        (merged.announcementEyebrow ?? settings.announcementEyebrow)?.trim() ||
        "";
      if (bar && !(merged.announcementText ?? settings.announcementText)?.trim()) {
        merged.announcementText = bar;
      }
    }
    patch(merged);
    onSave?.(merged);
  };

  const syncLegacyImage = (list: AnnouncementMedia[]) => {
    const firstImage = list.find((item) => item.type === "image");
    return firstImage?.url || "";
  };

  const addMedia = (url: string) => {
    if (!url || url.startsWith("blob:")) return;
    const type = mediaKind(url);
    const item: AnnouncementMedia = {
      id: `${Date.now()}`,
      type,
      url,
      name: fileName(url),
    };
    const next = [...media, item];
    patch({
      announcementMedia: next,
      announcementImage: syncLegacyImage(next) || settings.announcementImage,
    });
  };

  const replaceMediaAt = (url: string, index: number) => {
    if (!url || url.startsWith("blob:") || index < 0 || index >= media.length) return;
    const type = mediaKind(url);
    const next = media.map((item, i) =>
      i === index ? { id: item.id, type, url, name: fileName(url) } : item,
    );
    patch({
      announcementMedia: next,
      announcementImage: syncLegacyImage(next),
    });
  };

  const moveMedia = (from: number, to: number) => {
    if (to < 0 || to >= media.length || from === to) return;
    const next = [...media];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    patch({
      announcementMedia: next,
      announcementImage: syncLegacyImage(next),
    });
  };

  const toggleSharePlatforms = (next: string[]) => {
    patch({ announcementSharePlatforms: next.slice(0, ANNOUNCEMENT_SHARE_MAX) as AnnouncementSharePlatform[] });
  };

  const togglePanel = (id: AccordionId) => {
    setOpenPanels((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const closeEditor = (save = false) => {
    if (save) onSave?.();
    setEditing(false);
  };

  useHistoryBackClose(editing, () => closeEditor(true));
  useLockPageScroll(editing);

  const barPosition = barPositionOf(settings);
  const isEdgeChip = barPosition === "left" || barPosition === "right";
  const requestedDock = modalDockOf(settings);
  const layoutIsStack = settings.announcementLayout === "stack" || requestedDock === "left" || requestedDock === "right";
  const desktopDock =
    layoutIsStack && (requestedDock === "left" || requestedDock === "right") ? requestedDock : "center";
  const stageDock = previewDevice === "mobile" ? "center" : desktopDock;
  const barText =
    settings.announcementText?.trim() ||
    settings.announcementHeadline?.trim() ||
    settings.announcementEyebrow?.trim() ||
    "Announcement";

  return (
    <div className="ann-editor-root">
      <div className="ann-live-preview">
        <div className="ann-live-preview-top">
          <p>Live preview</p>
          <div className="hp-devices" role="group" aria-label="Preview device">
            {PREVIEW_DEVICES.map((item) => {
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={previewDevice === item.id ? "is-on" : undefined}
                  onClick={() => setPreviewDevice(item.id)}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setStageSheetOpen((open) => !open)}
          >
            {stageSheetOpen ? "Hide sheet" : "Show sheet"}
          </button>
        </div>

        <div className="ann-live-preview-stage">
          <div
            className={`ann-live-frame is-${previewDevice}`}
            data-device={previewDevice}
            data-dock={stageDock}
            data-bar={barPosition}
          >
            <div className="ann-live-site">
              <div className="ann-live-site-bg">
                <span className="ann-live-site-nav">About · Work · Experience · Services · Contact</span>
                <span className="ann-live-site-hero">Portfolio surface</span>
              </div>

              {settings.announcementIsActive ? (
                <button
                  type="button"
                  className={`announcement-bar is-${barPosition}${isEdgeChip ? " is-chip" : ""} is-stage`}
                  onClick={() => setStageSheetOpen(true)}
                  aria-label={isEdgeChip ? `Announcement: ${barText}` : undefined}
                >
                  {isEdgeChip ? (
                    <>
                      <span className="announcement-bar-mark" aria-hidden="true">
                        <RiMegaphoneLine size={16} />
                      </span>
                      <span className="announcement-bar-copy">
                        <span className="announcement-bar-title">{barText}</span>
                        <span className="announcement-bar-cta">
                          Continue <RiArrowRightLine size={14} />
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{barText}</span>
                      <span className="announcement-bar-cta">
                        Continue <RiArrowRightLine size={14} />
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <p className="ann-live-inactive">Banner is off — turn on “Show announcement banner”.</p>
              )}

              {stageSheetOpen ? (
                <div
                  className={`announcement-layer is-dock-${stageDock} is-stage is-device-${previewDevice}`}
                  role="presentation"
                  onClick={() => setStageSheetOpen(false)}
                >
                  <AnnouncementCard
                    settings={settings}
                    preview
                    onClose={() => setStageSheetOpen(false)}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="ann-editor-gate">
        <label className="ann-editor-unlock">
          <input
            type="checkbox"
            checked={editUnlocked}
            onChange={(event) => {
              const on = event.target.checked;
              setEditUnlocked(on);
              if (!on) setEditing(false);
              onSave?.();
            }}
          />
          {editUnlocked ? <RiLockUnlockLine size={15} /> : <RiLockLine size={15} />}
          Unlock announcement editing
        </label>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canEdit || saving}
          title={canEdit ? "Edit announcement" : "Turn on unlock to edit"}
          onClick={() => canEdit && setEditing(true)}
        >
          Edit announcement
        </button>
      </div>
      {!canEdit ? (
        <p className="ann-editor-hint">Turn on “Unlock announcement editing” before opening the editor.</p>
      ) : null}

      {editing ? (
        <div className="announcement-layer ann-editor-layer" role="presentation" onClick={() => closeEditor(true)}>
          <div className="dash-edit-modal ann-edit-modal" onClick={(event) => event.stopPropagation()}>
            <header className="ann-edit-head">
              <div>
                <p className="section-label" style={{ margin: 0 }}>
                  Control center
                </p>
                <h2>Edit announcement</h2>
              </div>
              <div className="ann-edit-head-actions">
                {onSave ? (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => onSave()} disabled={saving}>
                    <RiSaveLine size={15} /> {saving ? "Saving…" : "Save"}
                  </button>
                ) : null}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => closeEditor(true)}>
                  Close
                </button>
              </div>
            </header>

            <div className="ann-edit-grid">
              <div className="ann-edit-form" data-scroll-lock-allow="true">
                <Accordion
                  id="banner"
                  title="Banner"
                  open={openPanels.includes("banner")}
                  onToggle={() => togglePanel("banner")}
                >
                  <label className="ann-check">
                    <input
                      type="checkbox"
                      checked={settings.announcementIsActive || false}
                      onChange={(event) => applyAndSave({ announcementIsActive: event.target.checked })}
                    />
                    Show announcement banner
                  </label>
                  <label className="ann-field">
                    Banner position
                    <CustomSelect
                      value={settings.announcementBarPosition || "top"}
                      options={[
                        { value: "top", label: "Top of site" },
                        { value: "bottom", label: "Bottom of site" },
                        { value: "left", label: "Left edge chip" },
                        { value: "right", label: "Right edge chip" },
                      ]}
                      onChange={(value) => patch({ announcementBarPosition: value as AnnouncementBarPosition })}
                    />
                  </label>
                  <Field label="Bar text" value={settings.announcementText || ""} onChange={(announcementText) => patch({ announcementText })} />
                </Accordion>

                <Accordion id="copy" title="Copy" open={openPanels.includes("copy")} onToggle={() => togglePanel("copy")}>
                  <Field
                    label="Eyebrow"
                    value={settings.announcementEyebrow || ""}
                    onChange={(announcementEyebrow) => patch({ announcementEyebrow })}
                    placeholder="Announcement"
                  />
                  <Field
                    label="Sheet title"
                    value={settings.announcementHeadline || ""}
                    onChange={(announcementHeadline) => patch({ announcementHeadline })}
                    placeholder="Uses the bar text if empty"
                  />
                  <label className="ann-field is-tall">
                    Detail
                    <AnnouncementDetailEditor
                      value={settings.announcementDetail || ""}
                      onChange={(announcementDetail) => patch({ announcementDetail })}
                      placeholder={"Event overview…\n• Lists and line breaks keep as typed\n• Select text → Link for maps or RSVP URLs"}
                    />
                  </label>
                  <Field
                    label="Closing line"
                    value={settings.announcementClosing || ""}
                    onChange={(announcementClosing) => patch({ announcementClosing })}
                    placeholder="See you there!"
                  />
                </Accordion>

                <Accordion
                  id="event"
                  title="Event details"
                  open={openPanels.includes("event")}
                  onToggle={() => togglePanel("event")}
                >
                  <div className="ann-field-row">
                    <Field label="Date" value={settings.announcementDate || ""} onChange={(announcementDate) => patch({ announcementDate })} />
                    <Field label="Time" value={settings.announcementTime || ""} onChange={(announcementTime) => patch({ announcementTime })} />
                  </div>
                  <Field label="Place" value={settings.announcementPlace || ""} onChange={(announcementPlace) => patch({ announcementPlace })} />
                  <Field
                    label="Place map / location link"
                    value={settings.announcementPlaceUrl || ""}
                    onChange={(announcementPlaceUrl) => patch({ announcementPlaceUrl })}
                    placeholder="https://maps.google.com/… or Google Maps share link"
                  />
                  <Field
                    label="Audience line"
                    value={settings.announcementAudience || ""}
                    onChange={(announcementAudience) => patch({ announcementAudience })}
                    placeholder="Leaders · Innovators · Change-makers"
                  />
                </Accordion>

                <Accordion
                  id="media"
                  title="Media & CTAs"
                  open={openPanels.includes("media")}
                  onToggle={() => togglePanel("media")}
                >
                  <label className="ann-check" style={{ marginBottom: "0.75rem" }}>
                    <input
                      type="checkbox"
                      checked={settings.announcementShowMedia !== false}
                      onChange={(event) => patch({ announcementShowMedia: event.target.checked })}
                    />
                    Show media panel (image / video)
                  </label>
                  <p
                    className="ann-field-hint"
                    style={{ margin: "0 0 0.75rem", lineHeight: 1.45, overflowWrap: "anywhere" }}
                  >
                    When off — or when no image/video is uploaded — the modal uses a content-only layout
                    instead of an empty blue panel.
                  </p>
                  <Field
                    label="Media kicker"
                    value={settings.announcementMediaKicker || ""}
                    onChange={(announcementMediaKicker) => patch({ announcementMediaKicker })}
                    placeholder="Speak · Learn · Connect"
                  />
                  <Field
                    label="Media title"
                    value={settings.announcementMediaTitle || ""}
                    onChange={(announcementMediaTitle) => patch({ announcementMediaTitle })}
                    placeholder="Building Impact Together"
                  />
                  <Field
                    label="Button label"
                    value={settings.announcementCtaLabel || ""}
                    onChange={(announcementCtaLabel) => patch({ announcementCtaLabel })}
                    placeholder="View Event Details"
                  />
                  <Field
                    label="Button link"
                    value={settings.announcementLink || ""}
                    onChange={(announcementLink) => patch({ announcementLink })}
                    placeholder="/contact or https://"
                  />
                  <Field
                    label="Second button"
                    value={settings.announcementSecondaryLabel || ""}
                    onChange={(announcementSecondaryLabel) => patch({ announcementSecondaryLabel })}
                    placeholder="Add to Calendar"
                  />
                  <Field
                    label="Second link"
                    value={settings.announcementSecondaryHref || ""}
                    onChange={(announcementSecondaryHref) => patch({ announcementSecondaryHref })}
                    placeholder="Leave empty to use date/time"
                  />
                  <div className="ann-media-tools">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setReplaceIndex(null);
                        setMediaOpen(true);
                      }}
                    >
                      <RiImageAddLine size={15} />
                      Add media
                    </button>
                    <span className="ann-media-tools-hint">Images, videos, or files — drag to reorder</span>
                  </div>
                  {!media.length ? (
                    <button
                      type="button"
                      className="ann-media-empty"
                      onClick={() => {
                        setReplaceIndex(null);
                        setMediaOpen(true);
                      }}
                    >
                      <RiAddLine size={18} />
                      <span>Browse media library — add images, videos, or files</span>
                    </button>
                  ) : (
                    <div className="ann-media-list">
                      {media.map((item, index) => (
                        <div
                          key={item.id}
                          className={`ann-media-row${dragIndex === index ? " is-dragging" : ""}`}
                          draggable
                          onDragStart={() => setDragIndex(index)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (dragIndex === null) return;
                            moveMedia(dragIndex, index);
                            setDragIndex(null);
                          }}
                          onDragEnd={() => setDragIndex(null)}
                        >
                          <span className="ann-media-handle" aria-hidden="true" title="Drag to reorder">
                            <RiDraggable size={16} />
                          </span>
                          {item.type === "image" ? (
                            <img src={item.url} alt="" />
                          ) : (
                            <span className="ann-media-badge">{item.type}</span>
                          )}
                          <em title={item.name || item.url}>
                            {index === 0 && item.type !== "document" ? "First · " : ""}
                            {item.name || item.url}
                          </em>
                          <div className="ann-media-row-actions">
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setReplaceIndex(index);
                                setMediaOpen(true);
                              }}
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                const next = media.filter((entry) => entry.id !== item.id);
                                patch({
                                  announcementMedia: next,
                                  announcementImage: syncLegacyImage(next),
                                });
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Accordion>

                <Accordion
                  id="share"
                  title="Share & layout"
                  open={openPanels.includes("share")}
                  onToggle={() => togglePanel("share")}
                >
                  <label className="ann-field">
                    Layout
                    <CustomSelect
                      value={settings.announcementLayout || "side"}
                      options={[
                        { value: "side", label: "Side by side (desktop)" },
                        { value: "stack", label: "Details underneath" },
                      ]}
                      onChange={(value) => {
                        const layout = value as "side" | "stack";
                        patch({
                          announcementLayout: layout,
                          // Side dock only supports the stack sheet
                          ...(layout === "side" ? { announcementModalDock: "center" as AnnouncementModalDock } : null),
                        });
                      }}
                    />
                  </label>
                  {(settings.announcementLayout || "side") === "side" ? (
                    <label className="ann-field">
                      Desktop media column
                      <CustomSelect
                        value={settings.announcementMediaSide || "left"}
                        options={[
                          { value: "left", label: "Media left · content right" },
                          { value: "right", label: "Media right · content left" },
                        ]}
                        onChange={(value) => patch({ announcementMediaSide: value as AnnouncementMediaSide })}
                      />
                      <span className="ann-field-hint">Desktop only. Mobile always stacks media on top.</span>
                    </label>
                  ) : null}
                  <label className="ann-field">
                    Desktop modal position
                    <CustomSelect
                      value={
                        settings.announcementLayout === "stack"
                          ? settings.announcementModalDock || "center"
                          : "center"
                      }
                      options={[
                        { value: "center", label: "Center of screen" },
                        { value: "left", label: "From left sidebar (underneath layout)" },
                        { value: "right", label: "From right sidebar (underneath layout)" },
                      ]}
                      onChange={(value) => {
                        const dock = value as AnnouncementModalDock;
                        patch({
                          announcementModalDock: dock,
                          ...(dock === "left" || dock === "right"
                            ? { announcementLayout: "stack" as const }
                            : null),
                        });
                      }}
                    />
                  </label>
                  <p className="ann-field-hint" style={{ marginTop: "-0.35rem" }}>
                    Left / right dock uses full height and only with “Details underneath”.
                  </p>
                  <label className="ann-field">
                    Auto-scroll seconds
                    <input
                      style={inputStyle}
                      type="number"
                      min={3}
                      max={20}
                      value={settings.announcementInterval || 5}
                      onChange={(event) => patch({ announcementInterval: Number(event.target.value) })}
                    />
                  </label>
                  <label className="ann-check">
                    <input
                      type="checkbox"
                      checked={settings.announcementVideoMuted !== false}
                      onChange={(event) => patch({ announcementVideoMuted: event.target.checked })}
                    />
                    Keep announcement videos muted (hides sound control)
                  </label>
                  <label className="ann-check">
                    <input
                      type="checkbox"
                      checked={settings.announcementShare !== false}
                      onChange={(event) => patch({ announcementShare: event.target.checked })}
                    />
                    Show share row
                  </label>
                  {settings.announcementShare !== false ? (
                    <label className="ann-field">
                      Share platforms
                      <SocialMultiSelect
                        values={sharePlatforms}
                        onChange={toggleSharePlatforms}
                        max={ANNOUNCEMENT_SHARE_MAX}
                        placeholder="Choose from site socials…"
                        options={shareOptions.map((option) => ({ value: option.id, label: option.label }))}
                        aria-label="Announcement share platforms"
                      />
                      <span className="ann-field-hint">
                        Pulled from Site Settings → Socials ({resolvedSocials(settings).filter((link) => link.enabled).length} enabled). Max{" "}
                        {ANNOUNCEMENT_SHARE_MAX}.
                      </span>
                    </label>
                  ) : null}
                </Accordion>
              </div>

              <div
                className="ann-edit-preview"
                data-scroll-lock-allow="true"
                data-dock={
                  settings.announcementLayout === "stack" &&
                  (settings.announcementModalDock === "left" || settings.announcementModalDock === "right")
                    ? settings.announcementModalDock
                    : "center"
                }
              >
                <div
                  className={`ann-edit-stage is-dock-${
                    settings.announcementLayout === "stack" &&
                    (settings.announcementModalDock === "left" || settings.announcementModalDock === "right")
                      ? settings.announcementModalDock
                      : "center"
                  }`}
                >
                  <AnnouncementCard settings={settings} preview />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {fullPreview ? <AnnouncementOverlay settings={settings} onClose={() => setFullPreview(false)} /> : null}
      <MediaManagerModal
        isOpen={mediaOpen}
        pickerMode="any"
        title="Media Library — Select media"
        onClose={() => {
          setMediaOpen(false);
          setReplaceIndex(null);
        }}
        onSelect={(url) => {
          if (replaceIndex !== null) replaceMediaAt(url, replaceIndex);
          else addMedia(url);
          setMediaOpen(false);
          setReplaceIndex(null);
        }}
      />
    </div>
  );
}

function Accordion({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className={open ? "ann-acc is-open" : "ann-acc"}>
      <button type="button" className="ann-acc-trigger" aria-expanded={open} aria-controls={`ann-acc-${id}`} onClick={onToggle}>
        <span>{title}</span>
        <RiArrowDownSLine size={18} />
      </button>
      {open ? (
        <div className="ann-acc-body" id={`ann-acc-${id}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  area = false,
  tall = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  area?: boolean;
  tall?: boolean;
}) {
  return (
    <label className={`ann-field${tall ? " is-tall" : ""}`}>
      {label}
      {area ? (
        <textarea
          className={tall ? "ann-field-area is-tall" : "ann-field-area"}
          style={{
            ...inputStyle,
            minHeight: tall ? "8.5rem" : "3.4rem",
            resize: "vertical",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            lineHeight: 1.5,
          }}
          rows={tall ? 8 : 4}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input style={inputStyle} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
