"use client";

import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { RiCloseLine, RiSaveLine, RiImageAddLine, RiSunLine, RiMoonLine } from "react-icons/ri";
import { SiteSettings, HeroLayoutType } from "@/lib/supabase";
import { HERO_LAYOUTS, heroImageFor, imageKeyFor, layoutCopyFrom, layoutShows, settingsForLayout, visibleHeroLayouts } from "@/lib/hero";
import { resolvedSocials, heroSocialsFor, socialIcon, syncHeroSocialFlags } from "@/lib/socials";
import { PORTRAIT_PATH } from "@/lib/schema";
import HeroPreviewFrame from "@/components/hero/HeroPreviewFrame";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import SocialMultiSelect from "@/components/ui/SocialMultiSelect";
import { useHistoryBackClose, dismissOnBackdrop } from "@/hooks/useHistoryBackClose";

interface HeroEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  initialLayout?: HeroLayoutType;
  onSave: (updated: Partial<SiteSettings>) => void | Promise<void>;
  onOpenMedia: () => void;
  selectedMediaUrl?: string;
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  borderRadius: "0.5rem",
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  color: "#0f172a",
  fontSize: "0.875rem",
  outline: "none",
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </label>
      {children}
      {hint ? <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.35rem", lineHeight: 1.45 }}>{hint}</p> : null}
    </div>
  );
}

export default function HeroEditorModal({
  isOpen,
  onClose,
  settings,
  initialLayout,
  onSave,
  onOpenMedia,
  selectedMediaUrl,
}: HeroEditorModalProps) {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const { runSave, saving } = useDashboardFeedback();
  const layout = formData.bannerLayout || "split_portrait";
  const show = (field: Parameters<typeof layoutShows>[1]) => layoutShows(layout, field);
  const imageValue = heroImageFor(formData, layout);
  useHistoryBackClose(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const layout = initialLayout || settings.bannerLayout || "split_portrait";
    setFormData(settingsForLayout(settings, layout));
    setPreviewTheme("light");
    setMobilePreviewOpen(false);
  }, [isOpen, settings, initialLayout]);

  useEffect(() => {
    if (!selectedMediaUrl) return;
    setFormData((prev) => {
      const key = imageKeyFor(prev.bannerLayout || "split_portrait");
      return { ...prev, [key]: selectedMediaUrl };
    });
  }, [selectedMediaUrl]);

  if (!isOpen) return null;

  const update = (patch: Partial<SiteSettings>) => setFormData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const synced = syncHeroSocialFlags(formData);
    const active = synced.bannerLayout || "split_portrait";
    const imageKey = imageKeyFor(active);
    const ok = await runSave(async () => {
      await onSave({
      bannerLayout: active,
      [imageKey]: synced[imageKey],
      heroOverlayMobilePositionX: synced.heroOverlayMobilePositionX,
      heroOverlayMobilePositionY: synced.heroOverlayMobilePositionY,
      heroLayoutCopy: {
        ...settings.heroLayoutCopy,
        [active]: layoutCopyFrom(synced),
      },
      });
    }, "This layout’s details were saved. Other layouts are unchanged.");
    if (ok) onClose();
  };

  return (
    <div
      className="dash-modal-layer"
      role="dialog"
      aria-modal="true"
      aria-label="Live layout editor"
      onMouseDown={dismissOnBackdrop(onClose)}
    >
      <form
        onSubmit={handleSubmit}
        className="dash-modal-sheet is-hero"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dash-modal-head">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", width: "100%" }}>
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
                Live layout editor
              </p>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0b192c" }}>
                {HERO_LAYOUTS.find((item) => item.id === layout)?.name || "Hero"}
              </h3>
            </div>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm dash-modal-close-icon" style={{ padding: "0.4rem" }} disabled={saving} aria-label="Cancel">
              <RiCloseLine size={20} />
            </button>
          </div>
          <div className="dash-modal-head-actions dash-modal-head-actions-desktop">
            <button
              type="button"
              className="btn btn-outline hp-mobile-preview-btn"
              onClick={() => setMobilePreviewOpen((open) => !open)}
            >
              {mobilePreviewOpen ? "Edit fields" : "Open preview"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: "0.55rem 1rem" }} disabled={saving}>
              <RiCloseLine size={18} /> Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: "0.55rem 1.25rem" }} disabled={saving}>
              <RiSaveLine size={18} /> Save and activate
            </button>
          </div>
        </div>

        <div className={mobilePreviewOpen ? "dash-hero-body is-preview-open" : "dash-hero-body"}>
          <div className="dash-hero-form">
            <Field label="Layout">
              <div className="dash-hero-layout-tabs">
                {visibleHeroLayouts(formData).map((item) => {
                  const active = layout === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => update({ bannerLayout: item.id })}
                      style={{
                        flex: 1,
                        padding: "0.45rem 0.4rem",
                        borderRadius: "0.55rem",
                        border: "none",
                        background: active ? "#ffffff" : "transparent",
                        color: active ? "#0e52a8" : "#475569",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        boxShadow: active ? "0 1px 2px rgba(15,23,42,0.08)" : "none",
                      }}
                    >
                      {item.short}
                    </button>
                  );
                })}
              </div>
            </Field>

            {show("image") && (
              <Field
                label="Banner image (this layout)"
                hint={`SEO Person image stays at ${PORTRAIT_PATH}. Changing this layout image does not change Google’s URL.`}
              >
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={imageValue}
                    onChange={(event) => update({ [imageKeyFor(layout)]: event.target.value })}
                    style={inputStyle}
                  />
                  <button type="button" onClick={onOpenMedia} className="btn btn-outline" style={{ padding: "0.5rem" }} title="Choose from media library">
                    <RiImageAddLine size={18} />
                  </button>
                </div>
              </Field>
            )}

            {layout === "featured_overlay" ? (
              <Field
                label="Mobile image focus"
                hint="Only affects phones. Drag the sliders until the person sits in frame, then open Mobile preview to check."
              >
                <div style={{ display: "grid", gap: "0.55rem" }}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569" }}>
                    Horizontal {formData.heroOverlayMobilePositionX ?? 78}%
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formData.heroOverlayMobilePositionX ?? 78}
                      onChange={(event) => update({ heroOverlayMobilePositionX: Number(event.target.value) })}
                      style={{ width: "100%", accentColor: "#0e52a8", marginTop: "0.25rem" }}
                    />
                  </label>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569" }}>
                    Vertical {formData.heroOverlayMobilePositionY ?? 12}%
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formData.heroOverlayMobilePositionY ?? 12}
                      onChange={(event) => update({ heroOverlayMobilePositionY: Number(event.target.value) })}
                      style={{ width: "100%", accentColor: "#0e52a8", marginTop: "0.25rem" }}
                    />
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {[
                      { label: "Face right", x: 78, y: 12 },
                      { label: "Face center", x: 55, y: 15 },
                      { label: "Upper body", x: 70, y: 25 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          update({
                            heroOverlayMobilePositionX: preset.x,
                            heroOverlayMobilePositionY: preset.y,
                          })
                        }
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Field>
            ) : null}

            {show("name") && (
              <Field label="Display name">
                <input value={formData.siteTitle} onChange={(event) => update({ siteTitle: event.target.value })} style={inputStyle} />
              </Field>
            )}
            {show("greeting") && (
              <Field label="Greeting">
                <input value={formData.heroGreeting || ""} onChange={(event) => update({ heroGreeting: event.target.value })} style={inputStyle} />
              </Field>
            )}
            {show("availability") && (
              <Field label="Availability text">
                <input value={formData.heroAvailableText || ""} onChange={(event) => update({ heroAvailableText: event.target.value })} style={inputStyle} />
              </Field>
            )}
            {show("location") && (
              <Field label="Location">
                <input value={formData.location} onChange={(event) => update({ location: event.target.value })} style={inputStyle} />
              </Field>
            )}
            {show("roles") && (
              <Field label="Roles" hint="Only this layout. Separate roles with · so people can read each one.">
                <textarea rows={2} value={formData.siteSubtitle} onChange={(event) => update({ siteSubtitle: event.target.value })} style={{ ...inputStyle, resize: "vertical" }} />
              </Field>
            )}
            {show("headline") && (
              <Field label="Overlay headline">
                <input value={formData.heroHeadline || ""} onChange={(event) => update({ heroHeadline: event.target.value })} style={inputStyle} />
              </Field>
            )}
            {show("bio") && (
              <Field label={layout === "featured_overlay" ? "Detail card body" : "Bio / tagline"}>
                <textarea rows={3} value={formData.bio} onChange={(event) => update({ bio: event.target.value })} style={{ ...inputStyle, resize: "vertical" }} />
              </Field>
            )}
            {show("email") && (
              <Field label="Email">
                <input value={formData.contactEmail} onChange={(event) => update({ contactEmail: event.target.value })} style={inputStyle} />
              </Field>
            )}
            {show("invite") && (
              <Field label="Invite line" hint="Shown under the name, with the Let’s Talk link.">
                <input value={formData.heroInviteLine || ""} onChange={(event) => update({ heroInviteLine: event.target.value })} style={{ ...inputStyle, marginBottom: "0.4rem" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "0.4rem" }}>
                  <input value={formData.heroInviteCtaLabel || ""} onChange={(event) => update({ heroInviteCtaLabel: event.target.value })} style={inputStyle} />
                  <input value={formData.heroInviteCtaHref || ""} onChange={(event) => update({ heroInviteCtaHref: event.target.value })} style={inputStyle} />
                </div>
              </Field>
            )}
            {show("primaryCta") && (
              <Field label="Primary button">
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "0.4rem" }}>
                  <input value={formData.heroPrimaryCtaLabel || ""} onChange={(event) => update({ heroPrimaryCtaLabel: event.target.value })} style={inputStyle} />
                  <input value={formData.heroPrimaryCtaHref || ""} onChange={(event) => update({ heroPrimaryCtaHref: event.target.value })} style={inputStyle} />
                </div>
              </Field>
            )}
            {show("secondaryCta") && (
              <Field label="Secondary button">
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "0.4rem" }}>
                  <input value={formData.heroSecondaryCtaLabel || ""} onChange={(event) => update({ heroSecondaryCtaLabel: event.target.value })} style={inputStyle} />
                  <input value={formData.heroSecondaryCtaHref || ""} onChange={(event) => update({ heroSecondaryCtaHref: event.target.value })} style={inputStyle} />
                </div>
              </Field>
            )}
            {show("card") && (
              <Field label="Welcome card" hint="Keep this short. Highlights below appear as chips on the card.">
                <input value={formData.heroCardLabel || ""} onChange={(event) => update({ heroCardLabel: event.target.value })} style={{ ...inputStyle, marginBottom: "0.4rem" }} />
                <textarea
                  rows={3}
                  value={formData.heroCardBody || ""}
                  onChange={(event) => update({ heroCardBody: event.target.value })}
                  style={{ ...inputStyle, resize: "vertical", marginBottom: "0.4rem" }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "0.4rem" }}>
                  <input value={formData.heroCardCtaLabel || ""} onChange={(event) => update({ heroCardCtaLabel: event.target.value })} style={inputStyle} />
                  <input value={formData.heroCardCtaHref || ""} onChange={(event) => update({ heroCardCtaHref: event.target.value })} style={inputStyle} />
                </div>
              </Field>
            )}
            {show("stat1") && (
              <Field label="Highlight 1" hint="Saved on this layout only.">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  <input value={formData.heroStat1Value || ""} onChange={(event) => update({ heroStat1Value: event.target.value })} style={inputStyle} placeholder="Founder" />
                  <input value={formData.heroStat1Label || ""} onChange={(event) => update({ heroStat1Label: event.target.value })} style={inputStyle} placeholder="LERONY Ltd · 2025" />
                </div>
              </Field>
            )}
            {show("stat2") && (
              <Field label="Highlight 2">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  <input value={formData.heroStat2Value || ""} onChange={(event) => update({ heroStat2Value: event.target.value })} style={inputStyle} placeholder="Kigali" />
                  <input value={formData.heroStat2Label || ""} onChange={(event) => update({ heroStat2Label: event.target.value })} style={inputStyle} placeholder="Rwanda" />
                </div>
              </Field>
            )}
            {show("stat3") && (
              <Field label="Highlight 3">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  <input value={formData.heroStat3Value || ""} onChange={(event) => update({ heroStat3Value: event.target.value })} style={inputStyle} placeholder="2025" />
                  <input value={formData.heroStat3Label || ""} onChange={(event) => update({ heroStat3Label: event.target.value })} style={inputStyle} placeholder="Company founded" />
                </div>
              </Field>
            )}
            {show("stat4") && (
              <Field label="Highlight 4" hint="Up to four highlights, only on this layout.">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  <input value={formData.heroStat4Value || ""} onChange={(event) => update({ heroStat4Value: event.target.value })} style={inputStyle} placeholder="Speaker" />
                  <input value={formData.heroStat4Label || ""} onChange={(event) => update({ heroStat4Label: event.target.value })} style={inputStyle} placeholder="Talks & training" />
                </div>
              </Field>
            )}
            {show("heroSocials") && (
              <Field
                label="Social icons on this banner"
                hint="Order here is the order on this banner. Header and footer still use Site Settings."
              >
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.65rem", flexWrap: "wrap" }}>
                  {[2, 3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => update({ heroSocialLimit: count })}
                      style={{
                        padding: "0.3rem 0.65rem",
                        borderRadius: "0.4rem",
                        border: "1px solid #cbd5e1",
                        background: (formData.heroSocialLimit || 4) === count ? "#0e52a8" : "#fff",
                        color: (formData.heroSocialLimit || 4) === count ? "#fff" : "#0f172a",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.7rem", minHeight: "2rem" }}>
                  {heroSocialsFor(formData).map((link) => {
                    const Icon = socialIcon(link.platform);
                    return (
                      <span
                        key={link.id}
                        title={link.label}
                        style={{
                          width: "1.85rem",
                          height: "1.85rem",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid #cbd5e1",
                          borderRadius: "0.4rem",
                          color: "#0e52a8",
                          background: "#fff",
                        }}
                      >
                        <Icon size={14} />
                      </span>
                    );
                  })}
                </div>
                <p style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.5rem" }}>
                  Showing {heroSocialsFor(formData).length} of {(formData.heroSocialIds || []).length} selected · from Site Settings → Socials
                </p>
                <SocialMultiSelect
                  values={formData.heroSocialIds || []}
                  max={6}
                  placeholder="Choose socials from site settings…"
                  options={resolvedSocials(formData)
                    .filter((link) => link.enabled && link.url)
                    .map((link) => ({ value: link.id, label: link.label }))}
                  onChange={(ids) => {
                    setFormData((prev) => ({
                      ...prev,
                      heroSocialIds: ids,
                      heroSocialLimit: Math.min(6, Math.max(prev.heroSocialLimit || 4, ids.length, 2)),
                    }));
                  }}
                  aria-label="Hero social links"
                />
              </Field>
            )}
          </div>

          <div className="dash-hero-preview" style={{ background: previewTheme === "dark" ? "#050816" : "#ffffff" }}>
            <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 5, display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{
                background: previewTheme === "dark" ? "rgba(0,0,0,0.55)" : "#0f172a",
                color: "#fff",
                padding: "0.3rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                Preview · {previewTheme === "dark" ? "Dark" : "Default"}
              </span>
              <button
                type="button"
                onClick={() => setPreviewTheme((current) => (current === "dark" ? "light" : "dark"))}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  background: previewTheme === "dark" ? "rgba(255,255,255,0.12)" : "#e2e8f0",
                  color: previewTheme === "dark" ? "#fff" : "#0f172a",
                  padding: "0.3rem 0.7rem",
                  borderRadius: "999px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {previewTheme === "dark" ? <RiSunLine size={14} /> : <RiMoonLine size={14} />}
                {previewTheme === "dark" ? "Light" : "Dark"}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm hp-mobile-preview-btn"
                onClick={() => setMobilePreviewOpen(false)}
              >
                Back to edit
              </button>
            </div>
            <HeroPreviewFrame key={`${layout}-${previewTheme}`} settings={formData} previewTheme={previewTheme} fit="contain" />
          </div>
        </div>

        <div className="dash-modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setMobilePreviewOpen((open) => !open)}
          >
            {mobilePreviewOpen ? "Edit fields" : "Open preview"}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <RiSaveLine size={16} /> {saving ? "Saving…" : "Save and activate"}
          </button>
        </div>
      </form>
    </div>
  );
}
