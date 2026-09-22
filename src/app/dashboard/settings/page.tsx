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
  RiSearchLine,
} from "react-icons/ri";
import {
  getLocalSettings,
  saveLocalSettings,
  fetchRemoteSettings,
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
} from "@/lib/socials";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import AnnouncementEditor from "@/components/dashboard/AnnouncementEditor";
import SocialMultiSelect from "@/components/ui/SocialMultiSelect";
import EmailEditor from "@/components/dashboard/EmailEditor";
import FooterFocusDragPreview from "@/components/dashboard/FooterFocusDragPreview";
import CustomSelect from "@/components/ui/CustomSelect";
import { setting } from "@/lib/hero";
import { defaultFooterQuote } from "@/data/site-data";

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

type SettingsView = "identity" | "contact" | "socials" | "navbar" | "footer" | "announcement" | "email" | "search";

const VIEWS: { id: SettingsView; label: string; hint: string; icon: typeof RiUser3Line }[] = [
  { id: "identity", label: "Identity", hint: "Name, location, roles, bio", icon: RiUser3Line },
  { id: "contact", label: "Public contact", hint: "Email, phone, WhatsApp", icon: RiPhoneLine },
  { id: "socials", label: "Social links", hint: "Where each link appears", icon: RiShareLine },
  { id: "navbar", label: "Public navbar", hint: "Pill or full width", icon: RiLayoutTopLine },
  { id: "footer", label: "Footer", hint: "Company image and layout", icon: RiImageLine },
  { id: "announcement", label: "Announcement", hint: "Bar, sheet, and preview", icon: RiMegaphoneLine },
  { id: "email", label: "Email", hint: "Header layouts, signature, copy", icon: RiMailSendLine },
  { id: "search", label: "Site search", hint: "⌘K command palette", icon: RiSearchLine },
];

function isBlobUrl(url: string) {
  return url.startsWith("blob:");
}

function withDefaultFooterQuote(settings: SiteSettings): SiteSettings {
  return {
    ...settings,
    footerQuote: settings.footerQuote?.trim() || defaultFooterQuote.text,
    footerQuoteAttribution: settings.footerQuoteAttribution?.trim() || defaultFooterQuote.attribution,
    footerShowQuote: settings.footerShowQuote !== false,
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [view, setView] = useState<SettingsView>("identity");
  const [mediaTarget, setMediaTarget] = useState<"light" | "dark" | number | null>(null);
  const { runSave, saving } = useDashboardFeedback();

  useEffect(() => {
    const loaded = getLocalSettings();
    setSettings(withDefaultFooterQuote(loaded));
    void fetchRemoteSettings().then((remote) => {
      if (remote) setSettings(withDefaultFooterQuote(remote));
    });
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
    runSave(async () => {
      const payload = { ...settings, ...(next || {}) };
      if (isBlobUrl(payload.footerCompanyImage || "")) payload.footerCompanyImage = "";
      if (isBlobUrl(payload.footerCompanyImageDark || "")) payload.footerCompanyImageDark = "";
      const updated = await saveLocalSettings(payload);
      setSettings(updated);
    }, message);

  const socials = resolvedSocials(settings);
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
    <div className="dash-settings">
      <div className="dash-page-head">
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>Control center</p>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0b192c" }}>{activeView.label}</h1>
          <p style={{ fontSize: "0.8rem", color: "#64748b" }}>{activeView.hint}</p>
        </div>
        {view !== "announcement" ? (
          <div className="dash-page-head-actions">
            <button type="button" className="btn btn-primary" onClick={() => persist()} disabled={saving}>
              <RiSaveLine size={16} /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="dash-settings-body">
        <nav className="dash-settings-nav" aria-label="Settings sections">
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
                className={active ? "dash-settings-nav-btn is-on" : "dash-settings-nav-btn"}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="dash-settings-panel">
          {view === "identity" && (
            <div className="dash-form-grid" style={{ maxWidth: "44rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Display name
                <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.siteTitle} onChange={(e) => patch({ siteTitle: e.target.value })} />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Location
                <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.location} onChange={(e) => patch({ location: e.target.value })} />
              </label>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Identity roles (· separated)
                <input
                  style={{ ...inputStyle, marginTop: "0.3rem" }}
                  value={settings.siteSubtitle}
                  onChange={(e) => patch({ siteSubtitle: e.target.value })}
                  placeholder="Software Engineer · Technology Entrepreneur · Founder"
                />
                <span style={{ display: "block", fontWeight: 500, color: "#94a3b8", marginTop: "0.3rem" }}>
                  Public role line only. Default: Software Engineer · Technology Entrepreneur · Founder. Older multi-role lines are normalized on load/save.
                </span>
              </label>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Bio
                <textarea rows={4} style={{ ...inputStyle, marginTop: "0.3rem", resize: "vertical" }} value={settings.bio} onChange={(e) => patch({ bio: e.target.value })} />
              </label>
            </div>
          )}

          {view === "contact" && (
            <div className="dash-form-grid" style={{ maxWidth: "44rem" }}>
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
                    <div className="dash-social-row">
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
            <div className="dash-form-grid" style={{ gap: "0.75rem", maxWidth: "40rem" }}>
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
                <div className="dash-form-grid" style={{ gap: "0.75rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", gridColumn: "1 / -1" }}>
                    Quote
                    <textarea
                      rows={2}
                      style={{ ...inputStyle, marginTop: "0.3rem", resize: "vertical" }}
                      value={settings.footerQuote || defaultFooterQuote.text}
                      onChange={(e) => patch({ footerQuote: e.target.value, footerShowQuote: Boolean(e.target.value.trim()) || settings.footerShowQuote !== false })}
                      placeholder={defaultFooterQuote.text}
                    />
                  </label>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                    Quote attribution
                    <input
                      style={{ ...inputStyle, marginTop: "0.3rem" }}
                      value={settings.footerQuoteAttribution || defaultFooterQuote.attribution}
                      onChange={(e) => patch({ footerQuoteAttribution: e.target.value })}
                      placeholder={defaultFooterQuote.attribution}
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

              <div className="dash-form-grid">
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
                    onChange={(value) => {
                      const next = value as "image" | "video" | "carousel";
                      const media = [...(settings.footerCompanyMedia || [])].filter(Boolean);
                      if (next === "video") {
                        patch({
                          footerCompanyMediaType: next,
                          footerCompanyMedia: media.slice(0, 1),
                          footerCompanyImage: media[0] || settings.footerCompanyImage || "",
                        });
                      } else if (next === "image") {
                        patch({
                          footerCompanyMediaType: next,
                          footerCompanyMedia: media.slice(0, 1),
                          footerCompanyImage: media[0] || settings.footerCompanyImage || "",
                        });
                      } else {
                        patch({ footerCompanyMediaType: next });
                      }
                    }}
                  />
                </label>

                {(settings.footerCompanyMediaType || "image") === "carousel" ? (
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", gridColumn: "1 / -1" }}>
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

                <div style={{ display: "grid", gap: "0.75rem", gridColumn: "1 / -1" }}>
                  <FooterFocusDragPreview
                    settings={settings}
                    patch={patch}
                    saving={saving}
                    onSave={() => void persist()}
                    onPickMedia={(slotIndex) => setMediaTarget(slotIndex)}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1", display: "grid", gap: "0.45rem" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Dark-mode fallback image (optional)</p>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <input
                      style={inputStyle}
                      value={imageFieldValue(settings.footerCompanyImageDark).startsWith("data:") ? "" : imageFieldValue(settings.footerCompanyImageDark)}
                      onChange={(e) => patch({ footerCompanyImageDark: isBlobUrl(e.target.value) ? "" : e.target.value })}
                      placeholder="Optional dark-mode URL"
                    />
                    <button type="button" className="btn btn-outline" onClick={() => setMediaTarget("dark")}><RiImageAddLine /></button>
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

          {view === "search" && (
            <div className="dash-form-grid" style={{ maxWidth: "44rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={settings.siteSearch?.enabled !== false}
                  onChange={(e) =>
                    patch({
                      siteSearch: {
                        ...(settings.siteSearch || {}),
                        enabled: e.target.checked,
                      },
                    })
                  }
                />
                Enable ⌘K / Ctrl+K site search
              </label>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Search placeholder
                <input
                  style={{ ...inputStyle, marginTop: "0.3rem" }}
                  value={settings.siteSearch?.placeholder || ""}
                  onChange={(e) =>
                    patch({
                      siteSearch: {
                        ...(settings.siteSearch || {}),
                        placeholder: e.target.value,
                      },
                    })
                  }
                  placeholder="Search name, email, projects…"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <MediaManagerModal
        isOpen={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={(url) => {
          if (isBlobUrl(url)) return;
          if (mediaTarget === "dark") {
            patch({ footerCompanyImageDark: url });
          } else if (typeof mediaTarget === "number") {
            const next = [...(settings.footerCompanyMedia || [])];
            while (next.length < 3) next.push("");
            next[mediaTarget] = url;
            const cleaned = next.map((value) => value.trim()).filter(Boolean).slice(0, 3);
            const type = settings.footerCompanyMediaType || "image";
            patch({
              footerCompanyMedia: type === "video" || type === "image" ? cleaned.slice(0, 1) : cleaned,
              footerCompanyImage: cleaned[0] || url,
            });
          }
          setMediaTarget(null);
        }}
      />
    </div>
  );
}
