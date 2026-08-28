"use client";

import { useEffect, useState } from "react";
import {
  RiSaveLine,
  RiAddLine,
  RiDeleteBinLine,
  RiImageAddLine,
  RiUser3Line,
  RiPhoneLine,
  RiShareLine,
  RiLayoutTopLine,
  RiImageLine,
  RiMegaphoneLine,
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

type SettingsView = "identity" | "contact" | "socials" | "navbar" | "footer" | "announcement";

const VIEWS: { id: SettingsView; label: string; hint: string; icon: typeof RiUser3Line }[] = [
  { id: "identity", label: "Identity", hint: "Name, location, roles, bio", icon: RiUser3Line },
  { id: "contact", label: "Public contact", hint: "Email, phone, WhatsApp", icon: RiPhoneLine },
  { id: "socials", label: "Social links", hint: "Where each link appears", icon: RiShareLine },
  { id: "navbar", label: "Public navbar", hint: "Pill or full width", icon: RiLayoutTopLine },
  { id: "footer", label: "Footer", hint: "Company image and layout", icon: RiImageLine },
  { id: "announcement", label: "Announcement", hint: "Optional top bar", icon: RiMegaphoneLine },
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

  const imageFieldValue = (value?: string) => (value && isBlobUrl(value) ? "" : value || "");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, height: "100%", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.85rem", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>Control center</p>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0b192c" }}>{activeView.label}</h1>
          <p style={{ fontSize: "0.8rem", color: "#64748b" }}>{activeView.hint}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => persist()} disabled={saving}>
          <RiSaveLine size={16} /> {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <nav style={{ width: "13.5rem", flexShrink: 0, borderRight: "1px solid #e2e8f0", padding: "0.75rem", overflowY: "auto", background: "#f8fafc" }}>
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

        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.4rem 1.75rem" }}>
          {view === "identity" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "44rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Display name
                <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.siteTitle} onChange={(e) => patch({ siteTitle: e.target.value })} />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Location
                <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.location} onChange={(e) => patch({ location: e.target.value })} />
              </label>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Roles (separated by •)
                <input style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.siteSubtitle} onChange={(e) => patch({ siteSubtitle: e.target.value })} />
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
            </div>
          )}

          {view === "socials" && (
            <div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.75rem" }}>
                Header and footer use these links. Homepage banner icons are chosen in Hero layouts, so they are not duplicated here.
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
                {socials.map((link) => (
                  <div key={link.id} style={{ border: "1px solid #e2e8f0", borderRadius: "0.65rem", padding: "0.75rem", background: link.enabled ? "#fff" : "#f8fafc" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "8rem 1fr 1.6fr auto", gap: "0.5rem", alignItems: "center" }}>
                      <select value={link.platform} onChange={(e) => updateSocial(link.id, { platform: e.target.value })} style={inputStyle}>
                        {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                      <input value={link.label} onChange={(e) => updateSocial(link.id, { label: e.target.value })} style={inputStyle} />
                      <input value={link.url} onChange={(e) => updateSocial(link.id, { url: e.target.value })} style={inputStyle} />
                      <button type="button" onClick={() => removeSocial(link.id)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }} aria-label="Remove">
                        <RiDeleteBinLine size={16} />
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", marginTop: "0.6rem", fontSize: "0.75rem", color: "#475569" }}>
                      {(["enabled", "header", "footer", "contact"] as const).map((key) => (
                        <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.3rem", textTransform: "capitalize" }}>
                          <input type="checkbox" checked={Boolean(link[key])} onChange={(e) => updateSocial(link.id, { [key]: e.target.checked })} />
                          {key}
                        </label>
                      ))}
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
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Fit
                    <select style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.footerCompanyFit || "cover"} onChange={(e) => patch({ footerCompanyFit: e.target.value as FooterCompanyFit })}>
                      <option value="cover">Cover (full width)</option>
                      <option value="contain">Contain</option>
                    </select>
                  </label>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Height
                    <select style={{ ...inputStyle, marginTop: "0.3rem" }} value={settings.footerCompanyHeight || "regular"} onChange={(e) => patch({ footerCompanyHeight: e.target.value as FooterCompanyHeight })}>
                      <option value="compact">Compact</option>
                      <option value="regular">Regular</option>
                      <option value="tall">Tall</option>
                    </select>
                  </label>
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
            <div style={{ display: "grid", gap: "0.75rem", maxWidth: "40rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#334155" }}>
                <input type="checkbox" checked={settings.announcementIsActive || false} onChange={(e) => patch({ announcementIsActive: e.target.checked })} />
                Show announcement banner
              </label>
              <input style={inputStyle} value={settings.announcementText || ""} onChange={(e) => patch({ announcementText: e.target.value })} placeholder="Announcement text" />
              <input style={inputStyle} value={settings.announcementLink || ""} onChange={(e) => patch({ announcementLink: e.target.value })} placeholder="/projects" />
            </div>
          )}
        </div>
      </div>

      <MediaManagerModal
        isOpen={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        onSelect={(url) => {
          if (isBlobUrl(url)) return;
          if (mediaTarget === "dark") patch({ footerCompanyImageDark: url });
          else patch({ footerCompanyImage: url });
          setMediaTarget(null);
        }}
      />
    </div>
  );
}
