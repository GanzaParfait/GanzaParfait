"use client";

import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { RiCloseLine, RiSaveLine, RiImageAddLine, RiCheckLine, RiSunLine, RiMoonLine } from "react-icons/ri";
import { SiteSettings, HeroLayoutType } from "@/lib/supabase";
import { HERO_LAYOUTS, heroImageFor, imageKeyFor, layoutShows } from "@/lib/hero";
import { resolvedSocials, heroSocialsFor, socialIcon, syncHeroSocialFlags } from "@/lib/socials";
import { PORTRAIT_PATH } from "@/lib/schema";
import HeroPreviewFrame from "@/components/hero/HeroPreviewFrame";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";

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
  const { runSave, saving } = useDashboardFeedback();
  const layout = formData.bannerLayout || "split_portrait";
  const show = (field: Parameters<typeof layoutShows>[1]) => layoutShows(layout, field);
  const imageValue = heroImageFor(formData, layout);

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      ...settings,
      bannerLayout: initialLayout || settings.bannerLayout || "split_portrait",
    });
    setPreviewTheme("light");
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
    const ok = await runSave(() => onSave(syncHeroSocialFlags(formData)), "Hero layout saved and activated.");
    if (ok) onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(11, 25, 44, 0.72)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "1480px",
          height: "94vh",
          background: "#ffffff",
          borderRadius: "1.25rem",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
              Live layout editor
            </p>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0b192c" }}>
              {HERO_LAYOUTS.find((item) => item.id === layout)?.name || "Hero"}
            </h3>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: "0.55rem 1rem" }} disabled={saving}>
              <RiCloseLine size={18} /> Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: "0.55rem 1.25rem" }} disabled={saving}>
              <RiSaveLine size={18} /> Save and activate
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
          <div style={{ width: "24rem", minWidth: "22rem", overflowY: "auto", borderRight: "1px solid #e2e8f0", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.15rem" }}>
            <Field label="Layout" hint="Fields below match only what this banner actually shows. Preview updates as you type.">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {HERO_LAYOUTS.map((item) => {
                  const active = layout === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => update({ bannerLayout: item.id })}
                      style={{
                        textAlign: "left",
                        padding: "0.7rem 0.85rem",
                        borderRadius: "0.7rem",
                        border: `2px solid ${active ? "#0e52a8" : "#e2e8f0"}`,
                        background: active ? "#eff6ff" : "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 800, color: active ? "#0e52a8" : "#0b192c", fontSize: "0.875rem" }}>
                        {active && <RiCheckLine size={16} />}
                        {item.name}
                      </span>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                        {item.description}
                      </span>
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
              <Field label={layout === "full_centered_floating" ? "Primary role" : "Roles (separated by •)"} hint={layout === "full_centered_floating" ? "First role before • is shown in the left pill." : undefined}>
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
              <Field label="Detail card">
                <input value={formData.heroCardLabel || ""} onChange={(event) => update({ heroCardLabel: event.target.value })} style={{ ...inputStyle, marginBottom: "0.4rem" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "0.4rem" }}>
                  <input value={formData.heroCardCtaLabel || ""} onChange={(event) => update({ heroCardCtaLabel: event.target.value })} style={inputStyle} />
                  <input value={formData.heroCardCtaHref || ""} onChange={(event) => update({ heroCardCtaHref: event.target.value })} style={inputStyle} />
                </div>
              </Field>
            )}
            {show("stat1") && (
              <Field label="Highlight 1">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  <input value={formData.heroStat1Value || ""} onChange={(event) => update({ heroStat1Value: event.target.value })} style={inputStyle} />
                  <input value={formData.heroStat1Label || ""} onChange={(event) => update({ heroStat1Label: event.target.value })} style={inputStyle} />
                </div>
              </Field>
            )}
            {show("stat2") && (
              <Field label="Highlight 2">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  <input value={formData.heroStat2Value || ""} onChange={(event) => update({ heroStat2Value: event.target.value })} style={inputStyle} />
                  <input value={formData.heroStat2Label || ""} onChange={(event) => update({ heroStat2Label: event.target.value })} style={inputStyle} />
                </div>
              </Field>
            )}
            {show("stat3") && (
              <Field label="Highlight 3">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  <input value={formData.heroStat3Value || ""} onChange={(event) => update({ heroStat3Value: event.target.value })} style={inputStyle} />
                  <input value={formData.heroStat3Label || ""} onChange={(event) => update({ heroStat3Label: event.target.value })} style={inputStyle} />
                </div>
              </Field>
            )}
            {show("heroSocials") && (
              <Field
                label="Social icons on this banner"
                hint="These icons appear only on the homepage banner. Header and footer still use Site Settings."
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
                  Showing {heroSocialsFor(formData).length} of {(formData.heroSocialIds || []).length} selected
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {resolvedSocials(formData).filter((link) => link.enabled).map((link) => {
                    const selected = (formData.heroSocialIds || []).includes(link.id);
                    return (
                      <label key={link.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#334155" }}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            setFormData((prev) => {
                              const current = prev.heroSocialIds || [];
                              const isOn = current.includes(link.id);
                              const unique = isOn
                                ? current.filter((id) => id !== link.id)
                                : [...current, link.id];
                              const nextLimit = isOn
                                ? (prev.heroSocialLimit || 4)
                                : Math.min(6, Math.max(prev.heroSocialLimit || 4, unique.length, 2));
                              return {
                                ...prev,
                                heroSocialIds: unique,
                                heroSocialLimit: nextLimit,
                              };
                            });
                          }}
                        />
                        {link.label}
                      </label>
                    );
                  })}
                </div>
              </Field>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0, position: "relative", background: previewTheme === "dark" ? "#050816" : "#ffffff" }}>
            <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 5, display: "flex", gap: "0.5rem", alignItems: "center" }}>
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
            </div>
            <HeroPreviewFrame key={`${layout}-${previewTheme}`} settings={formData} previewTheme={previewTheme} fit="width" />
          </div>
        </div>
      </form>
    </div>
  );
}
