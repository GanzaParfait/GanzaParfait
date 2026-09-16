"use client";

import { useState, type ReactNode } from "react";
import { RiAddLine, RiArrowDownSLine, RiLockLine, RiLockUnlockLine, RiSaveLine } from "react-icons/ri";
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
  padding: "0.45rem 0.65rem",
  borderRadius: "0.375rem",
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  fontSize: "0.8rem",
  color: "#0f172a",
  outline: "none",
} as const;

type AccordionId = "banner" | "copy" | "event" | "media" | "share";

export default function AnnouncementEditor({
  settings,
  patch,
  onSave,
  saving = false,
}: {
  settings: SiteSettings;
  patch: (next: Partial<SiteSettings>) => void;
  onSave?: () => void;
  saving?: boolean;
}) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [kind, setKind] = useState<AnnouncementMedia["type"]>("image");
  const [fullPreview, setFullPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editUnlocked, setEditUnlocked] = useState(Boolean(settings.announcementIsActive));
  const [openPanels, setOpenPanels] = useState<AccordionId[]>(["banner", "copy"]);
  const media = settings.announcementMedia || [];
  const sharePlatforms = announcementSharePlatforms(settings);
  const canEdit = editUnlocked;

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

  const togglePanel = (id: AccordionId) => {
    setOpenPanels((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <div className="ann-editor-root">
      <AnnouncementCard settings={settings} preview />

      <div className="ann-editor-gate">
        <label className="ann-editor-unlock">
          <input
            type="checkbox"
            checked={editUnlocked}
            onChange={(event) => {
              const on = event.target.checked;
              setEditUnlocked(on);
              if (!on) setEditing(false);
            }}
          />
          {editUnlocked ? <RiLockUnlockLine size={15} /> : <RiLockLine size={15} />}
          Unlock announcement editing
        </label>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canEdit}
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
        <div className="announcement-layer ann-editor-layer" role="presentation" onClick={() => setEditing(false)}>
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
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
                  Close
                </button>
              </div>
            </header>

            <div className="ann-edit-grid">
              <div className="ann-edit-form">
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
                      onChange={(event) => patch({ announcementIsActive: event.target.checked })}
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
                  <Field
                    label="Detail"
                    value={settings.announcementDetail || ""}
                    area
                    onChange={(announcementDetail) => patch({ announcementDetail })}
                  />
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
                  />
                  <div className="ann-media-tools">
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
                      <RiAddLine size={15} /> Add
                    </button>
                  </div>
                  <div className="ann-media-list">
                    {media.map((item) => (
                      <div key={item.id} className="ann-media-row">
                        {item.type === "image" ? (
                          <img src={item.url} alt="" />
                        ) : (
                          <span>{item.type}</span>
                        )}
                        <em>{item.name || item.url}</em>
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
                        { value: "side", label: "Details on the right" },
                        { value: "stack", label: "Details underneath" },
                      ]}
                      onChange={(value) => patch({ announcementLayout: value as "side" | "stack" })}
                    />
                  </label>
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
                      checked={settings.announcementShare !== false}
                      onChange={(event) => patch({ announcementShare: event.target.checked })}
                    />
                    Show share row
                  </label>
                  {settings.announcementShare !== false ? (
                    <div className="ann-share-picks">
                      {ANNOUNCEMENT_SHARE_OPTIONS.map((option) => {
                        const on = sharePlatforms.includes(option.id);
                        const disabled = !on && sharePlatforms.length >= 6;
                        return (
                          <label key={option.id} className={on ? "is-on" : ""} style={{ opacity: disabled ? 0.5 : 1 }}>
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
                  ) : null}
                </Accordion>
              </div>

              <div className="ann-edit-preview">
                <AnnouncementCard settings={settings} preview />
              </div>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  area?: boolean;
}) {
  return (
    <label className="ann-field">
      {label}
      {area ? (
        <textarea
          style={{ ...inputStyle, minHeight: "3.4rem", resize: "vertical" }}
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
