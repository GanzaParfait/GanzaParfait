"use client";

import { useState } from "react";
import { RiAddLine } from "react-icons/ri";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { AnnouncementCard, AnnouncementOverlay } from "@/components/layout/AnnouncementBar";
import { fileName, mediaKind } from "@/lib/announcement";
import type { AnnouncementMedia, SiteSettings } from "@/lib/supabase";

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
  const media = settings.announcementMedia || [];

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

  return (
    <div className="announcement-editor" style={{ display: "grid", gridTemplateColumns: "minmax(0, 24rem) minmax(0, 1fr)", gap: "1.25rem", alignItems: "start" }}>
      <div style={{ display: "grid", gap: "0.7rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#334155" }}>
          <input type="checkbox" checked={settings.announcementIsActive || false} onChange={(event) => patch({ announcementIsActive: event.target.checked })} />
          Show announcement banner
        </label>
        <Field label="Bar text" value={settings.announcementText || ""} onChange={(announcementText) => patch({ announcementText })} />
        <Field label="Eyebrow" value={settings.announcementEyebrow || ""} onChange={(announcementEyebrow) => patch({ announcementEyebrow })} placeholder="Optional short label" />
        <Field label="Sheet title" value={settings.announcementHeadline || ""} onChange={(announcementHeadline) => patch({ announcementHeadline })} placeholder="Uses the bar text if empty" />
        <Field label="Detail" value={settings.announcementDetail || ""} area onChange={(announcementDetail) => patch({ announcementDetail })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <Field label="Date" value={settings.announcementDate || ""} onChange={(announcementDate) => patch({ announcementDate })} />
          <Field label="Time" value={settings.announcementTime || ""} onChange={(announcementTime) => patch({ announcementTime })} />
        </div>
        <Field label="Place" value={settings.announcementPlace || ""} onChange={(announcementPlace) => patch({ announcementPlace })} />
        <Field label="Button label" value={settings.announcementCtaLabel || ""} onChange={(announcementCtaLabel) => patch({ announcementCtaLabel })} placeholder="Continue" />
        <Field label="Button link" value={settings.announcementLink || ""} onChange={(announcementLink) => patch({ announcementLink })} placeholder="/contact or https://" />
        <Field label="Second button" value={settings.announcementSecondaryLabel || ""} onChange={(announcementSecondaryLabel) => patch({ announcementSecondaryLabel })} placeholder="Add to calendar" />
        <Field label="Second link" value={settings.announcementSecondaryHref || ""} onChange={(announcementSecondaryHref) => patch({ announcementSecondaryHref })} />
        <Field label="Closing line" value={settings.announcementClosing || ""} onChange={(announcementClosing) => patch({ announcementClosing })} />
        <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
          Layout
          <select style={inputStyle} value={settings.announcementLayout || "side"} onChange={(event) => patch({ announcementLayout: event.target.value as "side" | "stack" })}>
            <option value="side">Details on the right</option>
            <option value="stack">Details underneath</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
          Auto-scroll seconds
          <input style={inputStyle} type="number" min={3} max={20} value={settings.announcementInterval || 5} onChange={(event) => patch({ announcementInterval: Number(event.target.value) })} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>
          <input type="checkbox" checked={settings.announcementShare !== false} onChange={(event) => patch({ announcementShare: event.target.checked })} />
          Show share icons
        </label>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <select style={{ ...inputStyle, width: "auto" }} value={kind} onChange={(event) => setKind(event.target.value as AnnouncementMedia["type"])}>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setMediaOpen(true)}><RiAddLine size={15} /> Add from library</button>
        </div>
        <div style={{ display: "grid", gap: "0.4rem" }}>
          {media.map((item) => (
            <div key={item.id} style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
              {item.type === "image" ? <img src={item.url} alt="" style={{ width: "4.2rem", height: "2.6rem", objectFit: "cover", borderRadius: "0.35rem" }} /> : <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#0e52a8" }}>{item.type}</span>}
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.72rem", color: "#64748b" }}>{item.name || item.url}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => patch({ announcementMedia: media.filter((entry) => entry.id !== item.id) })}>Remove</button>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Only publish details you can stand behind. A video stays unloaded until someone presses play. On a phone the panel is always a bottom sheet.</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setFullPreview(true)}>Open full preview</button>
      </div>
      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>Preview</p>
        <button type="button" className="announcement-bar" onClick={() => setFullPreview(true)} style={{ marginBottom: "0.75rem" }}>
          <span>{settings.announcementText || "Announcement text"}</span>
          <span className="announcement-bar-cta">{settings.announcementCtaLabel || "Continue"}</span>
        </button>
        <AnnouncementCard settings={settings} preview />
      </div>
      {fullPreview ? <AnnouncementOverlay settings={settings} onClose={() => setFullPreview(false)} /> : null}
      <MediaManagerModal isOpen={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={(url) => { addMedia(url); setMediaOpen(false); }} />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, area = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; area?: boolean }) {
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
