"use client";

import { useEffect, useState } from "react";
import {
  RiSaveLine,
  RiAddLine,
  RiDeleteBinLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiImageAddLine,
  RiUser3Line,
  RiPhoneLine,
  RiShareLine,
  RiLayoutTopLine,
  RiImageLine,
  RiMegaphoneLine,
  RiMailSendLine,
} from "react-icons/ri";
import {
  getLocalSettings,
  saveLocalSettings,
  SiteSettings,
  DEFAULT_SETTINGS,
  NavbarStyle,
  FooterCompanyFit,
  FooterCompanyHeight,
} from "@/lib/supabase";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import {
  DEFAULT_SOCIAL_LINKS,
  SOCIAL_PLATFORM_OPTIONS,
  SocialLink,
  resolvedSocials,
  socialIcon,
  socialsFor,
} from "@/lib/socials";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import AnnouncementEditor from "@/components/dashboard/AnnouncementEditor";
import SocialMultiSelect from "@/components/ui/SocialMultiSelect";
import EmailEditor from "@/components/dashboard/EmailEditor";
import FooterFocusDragPreview from "@/components/dashboard/FooterFocusDragPreview";
import CustomSelect from "@/components/ui/CustomSelect";
import { FooterCompanyBand } from "@/components/layout/Footer";
import { footerNav } from "@/data/site-data";
import { setting } from "@/lib/hero";

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

type SettingsView = "identity" | "contact" | "socials" | "navbar" | "footer" | "announcement" | "email";

const VIEWS: { id: SettingsView; label: string; hint: string; icon: typeof RiUser3Line }[] = [
  { id: "identity", label: "Identity", hint: "Name, location, roles, bio", icon: RiUser3Line },
  { id: "contact", label: "Public contact", hint: "Email, phone, WhatsApp", icon: RiPhoneLine },
  { id: "socials", label: "Social links", hint: "Where each link appears", icon: RiShareLine },
  { id: "navbar", label: "Public navbar", hint: "Pill or full width", icon: RiLayoutTopLine },
  { id: "footer", label: "Footer", hint: "Company image and layout", icon: RiImageLine },
  { id: "announcement", label: "Announcement", hint: "Bar, sheet, and preview", icon: RiMegaphoneLine },
  { id: "email", label: "Email", hint: "Header layouts, signature, copy", icon: RiMailSendLine },
];

function isBlobUrl(url: string) {
  return url.startsWith("blob:");
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [view, setView] = useState<SettingsView>("identity");
  const [mediaTarget, setMediaTarget] = useState<"light" | "dark" | null>(null);
  const { runSave, saving } = useDashboardFeedback();

  useEffect(() => {
    const loaded = getLocalSettings();
    setSettings(loaded);
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "") as SettingsView;
      if (VIEWS.some((item) => item.id === hash)) setView(hash);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const patch = (next: Partial<SiteSettings>) => setSettings((prev) => ({ ...prev, ...next }));
  const persist = (next?: Partial<SiteSettings>, message = "Settings saved.") =>
    runSave(() => {
      const payload = { ...settings, ...(next || {}) };
      if (isBlobUrl(payload.footerCompanyImage || "")) payload.footerCompanyImage = "";
      if (isBlobUrl(payload.footerCompanyImageDark || "")) payload.footerCompanyImageDark = "";
      const updated = saveLocalSettings(payload);
      setSettings(updated);
    }, message);

  const socials = resolvedSocials(settings);
  const footerSocials = socialsFor(settings, "footer");
  const activeView = VIEWS.find((item) => item.id === view) || VIEWS[0];

  const updateSocial = (id: string, next: Partial<SocialLink>) => {
    patch({ socialLinks: socials.map((link) => (link.id === id ? { ...link, ...next } : link)) });
  };

  const addSocial = () => {
    const id = `custom-${Date.now()}`;
    patch({
      socialLinks: [
        ...socials,
        { id, platform: "custom", label: "New link", url: "https://", enabled: true, header: false, footer: true, hero: false, contact: false, order: socials.length + 1 },
      ],
    });
  };

  const removeSocial = (id: string) => {
    const protectedIds = new Set(DEFAULT_SOCIAL_LINKS.map((link) => link.id));
    if (protectedIds.has(id)) {
      updateSocial(id, { enabled: false });
      return;
    }
    patch({ socialLinks: socials.filter((link) => link.id !== id) });
  };

  const moveSocial = (id: string, direction: -1 | 1) => {
    const ordered = [...socials].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((link) => link.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ordered.length) return;
    const swapped = [...ordered];
    [swapped[index], swapped[next]] = [swapped[next], swapped[index]];
    patch({ socialLinks: swapped.map((link, order) => ({ ...link, order: order + 1 })) });
  };

  const imageFieldValue = (value?: string) => (value && isBlobUrl(value) ? "" : value || "");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, height: "100%", gap: "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>Control center</p>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0b192c" }}>{activeView.label}</h1>
          <p style={{ fontSize: "0.8rem", color: "#64748b" }}>{activeView.hint}</p>
        </div>
        {view !== "announcement" ? (
          <button type="button" className="btn btn-primary" onClick={() => persist()} disabled={saving}>
            <RiSaveLine size={16} /> {saving ? "Saving..." : "Save"}
          </button>
        ) : null}
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <nav style={{ width: "13.5rem", flexShrink: 0, padding: "0.15rem 0.75rem 0.15rem 0", overflowY: "auto" }}>
          {VIEWS.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id);
                  window.history.replaceState(null, "", `#${item.id}`);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  textAlign: "left",
                  padding: "0.7rem 0.75rem",
                  marginBottom: "0.25rem",
                  border: "none",
                  borderRadius: "0.55rem",
                  background: active ? "#0e52a8" : "transparent",
                  color: active ? "#ffffff" : "#334155",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 1rem 0.15rem" }}>
          {view === "identity" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "44rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Display name
                <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.siteTitle} onChange={(e) => patch({ siteTitle: e.target.value })} />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Location
                <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.location} onChange={(e) => patch({ location: e.target.value })} />
              </label>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Roles (separated by ·)
                <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.siteSubtitle} onChange={(e) => patch({ siteSubtitle: e.target.value })} />
                <span style={{ display: "block", fontWeight: 500, color: "#94a3b8", marginTop: "0.3rem" }}>Used until a hero layout is saved with its own roles. After that, that layout keeps its own line.</span>
              </label>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Bio
                <textarea rows={4} style={{ ...inputStyle, marginTop: "0.3rem", resize: "vertical" }} value={settings.bio} onChange={(e) => patch({ bio: e.target.value })} />
              </label>
            </div>
          )}

          {view === "contact" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "44rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Email
                <input type="email" style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.contactEmail} onChange={(e) => patch({ contactEmail: e.target.value })} />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Phone (display)
                <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.phoneNumber || ""} onChange={(e) => patch({ phoneNumber: e.target.value })} />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>WhatsApp number (digits)
                <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.whatsappNumber} onChange={(e) => patch({ whatsappNumber: e.target.value })} />
              </label>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Google Calendar booking page
                <input
                  style={{ ...inputStyle, marginTop: "0.3rem" }}
                  value={settings.bookingCalendarUrl || ""}
                  onChange={(e) => patch({ bookingCalendarUrl: e.target.value })}
                  placeholder="https://calendar.app.google/…"
                />
                <span style={{ display: "block", fontWeight: 500, color: "#94a3b8", marginTop: "0.3rem" }}>
                  Public appointment link only. Leave empty until the booking page exists. Private calendar addresses stay off the site.
                </span>
              </label>
            </div>
          )}

          {view === "socials" && (
            <div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.75rem" }}>
                Use the arrows to set the order shown on the site. Hovering an icon shows its name. Homepage banner icons are chosen inside each hero layout.
              </p>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.75rem" }}>Header shows this many before the overflow menu:</p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => patch({ headerSocialLimit: num })}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "0.4rem",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      border: "1px solid #cbd5e1",
                      background: (settings.headerSocialLimit || 3) === num ? "#0e52a8" : "#fff",
                      color: (settings.headerSocialLimit || 3) === num ? "#fff" : "#0f172a",
                      cursor: "pointer",
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {socials.map((link, index) => (
                  <div key={link.id} style={{ border: "1px solid #e2e8f0", borderRadius: "0.65rem", padding: "0.75rem", background: link.enabled ? "#fff" : "#f8fafc" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 8rem 1fr 1.6fr auto", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ display: "flex", flexDirection: "column" }}>
                        <button type="button" aria-label={`Move ${link.label} up`} disabled={index === 0} onClick={() => moveSocial(link.id, -1)} style={{ border: "none", background: "none", cursor: index === 0 ? "default" : "pointer", color: "#64748b", opacity: index === 0 ? 0.35 : 1 }}>
                          <RiArrowUpSLine size={16} />
                        </button>
                        <button type="button" aria-label={`Move ${link.label} down`} disabled={index === socials.length - 1} onClick={() => moveSocial(link.id, 1)} style={{ border: "none", background: "none", cursor: index === socials.length - 1 ? "default" : "pointer", color: "#64748b", opacity: index === socials.length - 1 ? 0.35 : 1 }}>
                          <RiArrowDownSLine size={16} />
                        </button>
                      </span>
                      <CustomSelect
                        value={link.platform}
                        options={SOCIAL_PLATFORM_OPTIONS.map((option) => ({ value: option.id, label: option.label }))}
                        onChange={(value) => updateSocial(link.id, { platform: value })}
                      />
                      <input value={link.label} onChange={(e) => updateSocial(link.id, { label: e.target.value })} style={inputStyle} />
                      <input value={link.url} onChange={(e) => updateSocial(link.id, { url: e.target.value })} style={inputStyle} />
                      <button type="button" onClick={() => removeSocial(link.id)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }} aria-label="Remove">
                        <RiDeleteBinLine size={16} />
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", marginTop: "0.6rem", fontSize: "0.75rem", color: "#475569", alignItems: "center" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <input type="checkbox" checked={Boolean(link.enabled)} onChange={(e) => updateSocial(link.id, { enabled: e.target.checked })} />
                        Enabled
                      </label>
                      <div style={{ flex: 1, minWidth: "14rem" }}>
                        <SocialMultiSelect
                          values={(["header", "footer", "contact"] as const).filter((key) => link[key])}
                          max={3}
                          placeholder="Show on…"
                          options={[
                            { value: "header", label: "Header" },
                            { value: "footer", label: "Footer" },
                            { value: "contact", label: "Contact" },
                          ]}
                          onChange={(placements) =>
                            updateSocial(link.id, {
                              header: placements.includes("header"),
                              footer: placements.includes("footer"),
                              contact: placements.includes("contact"),
                            })
                          }
                          aria-label={`${link.label} placements`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-outline" onClick={addSocial} style={{ marginTop: "0.85rem" }}>
                <RiAddLine /> Add social link
              </button>
            </div>
          )}

          {view === "navbar" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", maxWidth: "40rem" }}>
              {([
                { id: "pill" as NavbarStyle, title: "Radiused pill", body: "Inset rounded bar with tighter side padding." },
                { id: "full" as NavbarStyle, title: "Full width", body: "Edge-to-edge bar across the top." },
              ]).map((option) => {
                const active = (settings.navbarStyle || "pill") === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => patch({ navbarStyle: option.id })}
                    style={{
                      textAlign: "left",
                      padding: "0.9rem 1rem",
                      borderRadius: "0.75rem",
                      border: `2px solid ${active ? "#0e52a8" : "#e2e8f0"}`,
                      background: active ? "#eff6ff" : "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ display: "block", fontWeight: 800, color: active ? "#0e52a8" : "#0b192c" }}>{option.title}</span>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>{option.body}</span>
                  </button>
                );
              })}
            </div>
          )}

          {view === "footer" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "0.85rem", padding: "0.9rem 1rem", background: "#fff" }}>
                <p style={{ margin: "0 0 0.65rem", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b" }}>
                  Optional footer texts
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", gap: "0.55rem", marginBottom: "0.85rem" }}>
                  {(
                    [
                      ["footerShowBio", "Bio"],
                      ["footerShowEmail", "Email"],
                      ["footerShowPhone", "Phone"],
                      ["footerShowLocation", "Location"],
                      ["footerShowQuote", "Quote"],
                      ["footerShowFeaturedCopy", "Featured band copy"],
                      ["footerShowPrivacy", "Privacy link"],
                      ["footerShowSitemap", "Sitemap link"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", fontWeight: 600, color: "#334155" }}>
                      <input
                        type="checkbox"
                        checked={
                          key === "footerShowQuote" || key === "footerShowFeaturedCopy"
                            ? Boolean(settings[key])
                            : settings[key] !== false
                        }
                        onChange={(e) => patch({ [key]: e.target.checked })}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", gridColumn: "1 / -1" }}>
                    Quote
                    <textarea
                      rows={2}
                      style={{ ...inputStyle, marginTop: "0.3rem", resize: "vertical" }}
                      value={settings.footerQuote || ""}
                      onChange={(e) => patch({ footerQuote: e.target.value, footerShowQuote: Boolean(e.target.value.trim()) || settings.footerShowQuote })}
                      placeholder="Optional quote shown in the footer"
                    />
                  </label>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                    Quote attribution
                    <input
                      style={{ ...inputStyle, marginTop: "0.3rem" }}
                      value={settings.footerQuoteAttribution || ""}
                      onChange={(e) => patch({ footerQuoteAttribution: e.target.value })}
                      placeholder={setting(settings, "siteTitle")}
                    />
                  </label>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                    Featured eyebrow
                    <input
                      style={{ ...inputStyle, marginTop: "0.3rem" }}
                      value={settings.footerFeaturedEyebrow || ""}
                      onChange={(e) => patch({ footerFeaturedEyebrow: e.target.value })}
                      placeholder="Featured"
                    />
                  </label>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", gridColumn: "1 / -1" }}>
                    Featured title
                    <input
                      style={{ ...inputStyle, marginTop: "0.3rem" }}
                      value={settings.footerFeaturedTitle || ""}
                      onChange={(e) =>
                        patch({
                          footerFeaturedTitle: e.target.value,
                          footerShowFeaturedCopy: Boolean(e.target.value.trim()) || settings.footerShowFeaturedCopy,
                        })
                      }
                      placeholder="Building technology for real impact."
                    />
                  </label>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", gridColumn: "1 / -1" }}>
                    Featured detail
                    <textarea
                      rows={2}
                      style={{ ...inputStyle, marginTop: "0.3rem", resize: "vertical" }}
                      value={settings.footerFeaturedDetail || ""}
                      onChange={(e) => patch({ footerFeaturedDetail: e.target.value })}
                      placeholder="Optional supporting line on the media band"
                    />
                  </label>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                    Featured CTA label
                    <input
                      style={{ ...inputStyle, marginTop: "0.3rem" }}
                      value={settings.footerFeaturedCtaLabel || ""}
                      onChange={(e) => patch({ footerFeaturedCtaLabel: e.target.value })}
                      placeholder="Follow the journey"
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>Image URL</p>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <input
                      style={inputStyle}
                      value={imageFieldValue(settings.footerCompanyImage).startsWith("data:") ? "" : imageFieldValue(settings.footerCompanyImage)}
                      onChange={(e) => patch({ footerCompanyImage: isBlobUrl(e.target.value) ? "" : e.target.value })}
                      placeholder={imageFieldValue(settings.footerCompanyImage).startsWith("data:") ? "Uploaded image stored in this browser" : "https://… or /brand/…"}
                    />
                    <button type="button" className="btn btn-outline" onClick={() => setMediaTarget("light")}><RiImageAddLine /></button>
                  </div>
                  <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.35rem" }}>Use a public https URL or a site path. Temporary blob URLs are not kept.</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>Dark-mode image (optional)</p>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <input
                      style={inputStyle}
                      value={imageFieldValue(settings.footerCompanyImageDark).startsWith("data:") ? "" : imageFieldValue(settings.footerCompanyImageDark)}
                      onChange={(e) => patch({ footerCompanyImageDark: isBlobUrl(e.target.value) ? "" : e.target.value })}
                      placeholder={imageFieldValue(settings.footerCompanyImageDark).startsWith("data:") ? "Uploaded image stored in this browser" : "Optional dark-mode URL"}
                    />
                    <button type="button" className="btn btn-outline" onClick={() => setMediaTarget("dark")}><RiImageAddLine /></button>
                  </div>
                </div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Link
                  <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.footerCompanyHref || ""} onChange={(e) => patch({ footerCompanyHref: e.target.value })} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "grid", gap: "0.3rem" }}>Fit
                    <CustomSelect
                      value={settings.footerCompanyFit || "cover"}
                      options={[
                        { value: "cover", label: "Cover (full width)" },
                        { value: "contain", label: "Contain" },
                      ]}
                      onChange={(value) => patch({ footerCompanyFit: value as FooterCompanyFit })}
                    />
                  </label>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "grid", gap: "0.3rem" }}>Height
                    <CustomSelect
                      value={settings.footerCompanyHeight || "regular"}
                      options={[
                        { value: "compact", label: "Compact" },
                        { value: "regular", label: "Regular" },
                        { value: "tall", label: "Tall" },
                      ]}
                      onChange={(value) => patch({ footerCompanyHeight: value as FooterCompanyHeight })}
                    />
                  </label>
                </div>

                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", gridColumn: "1 / -1", display: "grid", gap: "0.3rem" }}>
                  Media mode
                  <CustomSelect
                    value={settings.footerCompanyMediaType || "image"}
                    options={[
                      { value: "image", label: "Single image" },
                      { value: "video", label: "Video" },
                      { value: "carousel", label: "Carousel (up to 3 images)" },
                    ]}
                    onChange={(value) => patch({ footerCompanyMediaType: value as "image" | "video" | "carousel" })}
                  />
                </label>

                <div style={{ gridColumn: "1 / -1", display: "grid", gap: "0.45rem" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Media URLs (max 3)</p>
                  {[0, 1, 2].map((index) => (
                    <div key={index} style={{ display: "flex", gap: "0.4rem" }}>
                      <input
                        style={inputStyle}
                        value={(settings.footerCompanyMedia || [])[index] || (index === 0 ? imageFieldValue(settings.footerCompanyImage) : "")}
                        onChange={(e) => {
                          const next = [...(settings.footerCompanyMedia || [])];
                          while (next.length < 3) next.push("");
                          next[index] = isBlobUrl(e.target.value) ? "" : e.target.value;
                          const cleaned = next.filter(Boolean).slice(0, 3);
                          patch({
                            footerCompanyMedia: cleaned,
                            footerCompanyImage: cleaned[0] || settings.footerCompanyImage,
                          });
                        }}
                        placeholder={index === 0 ? "Primary image or video URL" : `Optional slide ${index + 1}`}
                        disabled={(settings.footerCompanyMediaType || "image") === "video" && index > 0}
                      />
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setMediaTarget("light");
                        }}
                      >
                        <RiImageAddLine />
                      </button>
                    </div>
                  ))}
                  {(settings.footerCompanyMediaType || "image") === "carousel" ? (
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Carousel interval (seconds)
                      <input
                        type="number"
                        min={3}
                        max={20}
                        style={{ ...inputStyle, marginTop: "0.3rem" }}
                        value={settings.footerCompanyCarouselInterval ?? 5}
                        onChange={(e) => patch({ footerCompanyCarouselInterval: Number(e.target.value) || 5 })}
                      />
                    </label>
                  ) : null}
                </div>

                <div style={{ display: "grid", gap: "0.75rem", gridColumn: "1 / -1" }}>
                  <FooterFocusDragPreview settings={settings} patch={patch} />
                </div>
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: "1rem", overflow: "hidden", background: "#ffffff" }}>
                <div style={{ padding: "0.65rem 1rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>Live footer preview</p>
                  <button type="button" className="btn btn-primary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem" }} onClick={() => persist()} disabled={saving}>
                    <RiSaveLine size={14} /> Save
                  </button>
                </div>
                <div style={{ background: "#ffffff", pointerEvents: "none" }}>
                  <div style={{ padding: "1.5rem 1.25rem 1.15rem", display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between" }}>
                    <div style={{ flex: "1 1 220px", maxWidth: "22rem" }}>
                      <img src="/brand/logos/logo-horizontal-blue.png" alt="" style={{ height: "2rem", objectFit: "contain", marginBottom: "0.85rem" }} />
                      <p style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.6, marginBottom: "0.65rem" }}>{settings.bio}</p>
                      <p style={{ fontSize: "0.75rem", color: "#0e52a8", fontWeight: 600, marginBottom: "0.75rem" }}>
                        {setting(settings, "contactEmail")}
                        {settings.phoneNumber ? ` · ${settings.phoneNumber}` : ""}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {footerSocials.map((link) => {
                          const Icon = socialIcon(link.platform);
                          return (
                            <span key={link.id} className="footer-social-icon" style={{ width: "1.85rem", height: "1.85rem" }}>
                              <Icon size={14} />
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {footerNav.map((group) => (
                      <div key={group.label} style={{ minWidth: "7rem" }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0b192c", marginBottom: "0.7rem" }}>{group.label}</p>
                        {group.links.map((link) => (
                          <p key={link.href} style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "0.4rem" }}>{link.label}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                  <FooterCompanyBand
                    settings={{ ...settings, footerCompanyImage: imageFieldValue(settings.footerCompanyImage) }}
                    isDark={false}
                    emptyHint
                    flush
                  />
                  <div style={{ padding: "1rem 1.25rem 1.25rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                    <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>© {new Date().getFullYear()} {setting(settings, "siteTitle")}. All rights reserved.</p>
                    <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Privacy · Buy me a coffee</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "announcement" && (
            <AnnouncementEditor
              settings={settings}
              patch={patch}
              saving={saving}
              onSave={(next) => persist(next, "Announcement saved.")}
            />
          )}
          {view === "email" && <EmailEditor settings={settings} patch={patch} />}
        </div>
      </div>

      <MediaManagerModal
        isOpen={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        onSelect={(url) => {
          if (isBlobUrl(url)) return;
          if (mediaTarget === "dark") {
            patch({ footerCompanyImageDark: url });
          } else {
            const next = [...(settings.footerCompanyMedia || [])];
            if (!next.length && settings.footerCompanyImage) next.push(settings.footerCompanyImage);
            if (next.length >= 3) next[next.length - 1] = url;
            else next.push(url);
            patch({ footerCompanyImage: next[0] || url, footerCompanyMedia: next.slice(0, 3) });
          }
          setMediaTarget(null);
        }}
      />
    </div>
  );
}
