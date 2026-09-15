"use client";

import { useState } from "react";
import { RiAddLine } from "react-icons/ri";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { AnnouncementCard, AnnouncementOverlay } from "@/components/layout/AnnouncementBar";
import {
  ANNOUNCEMENT_SHARE_OPTIONS,
  announcementSharePlatforms,
  fileName,
  mediaKind,
} from "@/lib/announcement";
import type { AnnouncementBarPosition, AnnouncementMedia, AnnouncementSharePlatform, SiteSettings } from "@/lib/supabase";
import CustomSelect from "@/components/ui/CustomSelect";

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.375rem",
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  fontSize: "0.8125rem",
  color: "#0f172a",
  outline: "none",
} as const;

export default function AnnouncementEditor({
  settings,
  patch,
}: {
  settings: SiteSettings;
  patch: (next: Partial<SiteSettings>) => void;
}) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [kind, setKind] = useState<AnnouncementMedia["type"]>("image");
  const [fullPreview, setFullPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const media = settings.announcementMedia || [];
  const sharePlatforms = announcementSharePlatforms(settings);

  const addMedia = (url: string) => {
    if (!url || url.startsWith("blob:")) return;
    const item: AnnouncementMedia = {
      id: `${Date.now()}`,
      type: kind === "image" ? mediaKind(url) : kind,
      url,
      name: fileName(url),
    };
    patch({ announcementMedia: [...media, item], announcementImage: settings.announcementImage || url });
  };

  const toggleSharePlatform = (id: AnnouncementSharePlatform) => {
    const current = [...sharePlatforms];
    const exists = current.includes(id);
    if (exists) {
      patch({ announcementSharePlatforms: current.filter((item) => item !== id) });
      return;
    }
    if (current.length >= 6) return;
    patch({ announcementSharePlatforms: [...current, id] });
  };

  return (
    <div style={{ display: "grid", gap: "0.85rem", maxWidth: "52rem" }}>
      <AnnouncementCard settings={settings} preview />
      <button type="button" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setEditing(true)}>
        Edit announcement
      </button>
      {editing ? (
        <div className="announcement-layer" role="presentation" onClick={() => setEditing(false)} style={{ zIndex: 220 }}>
          <div className="dash-edit-modal" onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Edit announcement</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
                Close
              </button>
            </div>
            <div className="announcement-editor" style={{ display: "grid", gridTemplateColumns: "minmax(0, 22rem) minmax(0, 1fr)", gap: "1.25rem", alignItems: "start" }}>
              <div style={{ display: "grid", gap: "0.7rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#334155" }}>
                  <input
                    type="checkbox"
                    checked={settings.announcementIsActive || false}
                    onChange={(event) => patch({ announcementIsActive: event.target.checked })}
                  />
                  Show announcement banner
                </label>
                <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                  Banner position
                  <CustomSelect
                    value={settings.announcementBarPosition || "top"}
                    options={[
                      { value: "top", label: "Top of site" },
                      { value: "bottom", label: "Bottom of site" },
                    ]}
                    onChange={(value) => patch({ announcementBarPosition: value as AnnouncementBarPosition })}
                  />
                </label>
                <Field label="Bar text" value={settings.announcementText || ""} onChange={(announcementText) => patch({ announcementText })} />
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
                <Field label="Detail" value={settings.announcementDetail || ""} area onChange={(announcementDetail) => patch({ announcementDetail })} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <Field label="Date" value={settings.announcementDate || ""} onChange={(announcementDate) => patch({ announcementDate })} />
                  <Field label="Time" value={settings.announcementTime || ""} onChange={(announcementTime) => patch({ announcementTime })} />
                </div>
                <Field label="Place" value={settings.announcementPlace || ""} onChange={(announcementPlace) => patch({ announcementPlace })} />
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
                  label="Audience line"
                  value={settings.announcementAudience || ""}
                  onChange={(announcementAudience) => patch({ announcementAudience })}
                  placeholder="Leaders · Innovators · Change-makers"
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
                />
                <Field
                  label="Closing line"
                  value={settings.announcementClosing || ""}
                  onChange={(announcementClosing) => patch({ announcementClosing })}
                  placeholder="See you there!"
                />
                <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                  Layout
                  <CustomSelect
                    value={settings.announcementLayout || "side"}
                    options={[
                      { value: "side", label: "Details on the right" },
                      { value: "stack", label: "Details underneath" },
                    ]}
                    onChange={(value) => patch({ announcementLayout: value as "side" | "stack" })}
                  />
                </label>
                <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
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
                <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>
                  <input
                    type="checkbox"
                    checked={settings.announcementShare !== false}
                    onChange={(event) => patch({ announcementShare: event.target.checked })}
                  />
                  Show share row
                </label>
                {settings.announcementShare !== false ? (
                  <div style={{ display: "grid", gap: "0.35rem" }}>
                    <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: "#334155" }}>
                      Share icons (up to 5 networks + copy link)
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                      {ANNOUNCEMENT_SHARE_OPTIONS.map((option) => {
                        const on = sharePlatforms.includes(option.id);
                        const disabled = !on && sharePlatforms.length >= 6;
                        return (
                          <label
                            key={option.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              padding: "0.35rem 0.55rem",
                              borderRadius: "999px",
                              border: `1px solid ${on ? "#0e52a8" : "#cbd5e1"}`,
                              background: on ? "rgba(14,82,168,0.08)" : "#fff",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              color: "#334155",
                              opacity: disabled ? 0.5 : 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              disabled={disabled}
                              onChange={() => toggleSharePlatform(option.id)}
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>
                      Copied links include UTM tags and reopen this announcement sheet.
                    </p>
                  </div>
                ) : null}
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <CustomSelect
                    value={kind}
                    options={[
                      { value: "image", label: "Image" },
                      { value: "video", label: "Video" },
                      { value: "document", label: "Document" },
                    ]}
                    onChange={(value) => setKind(value as AnnouncementMedia["type"])}
                    className="dash-cselect-sm"
                  />
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setMediaOpen(true)}>
                    <RiAddLine size={15} /> Add from library
                  </button>
                </div>
                <div style={{ display: "grid", gap: "0.4rem" }}>
                  {media.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
                      {item.type === "image" ? (
                        <img src={item.url} alt="" style={{ width: "4.2rem", height: "2.6rem", objectFit: "cover", borderRadius: "0.35rem" }} />
                      ) : (
                        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#0e52a8" }}>{item.type}</span>
                      )}
                      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.72rem", color: "#64748b" }}>
                        {item.name || item.url}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => patch({ announcementMedia: media.filter((entry) => entry.id !== item.id) })}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                  Only publish details you can stand behind. A video stays unloaded until someone presses play.
                </p>
              </div>
              <AnnouncementCard settings={settings} preview />
            </div>
          </div>
        </div>
      ) : null}
      {fullPreview ? <AnnouncementOverlay settings={settings} onClose={() => setFullPreview(false)} /> : null}
      <MediaManagerModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          addMedia(url);
          setMediaOpen(false);
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  area = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  area?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
      {label}
      {area ? (
        <textarea style={{ ...inputStyle, minHeight: "4.5rem" }} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input style={inputStyle} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
