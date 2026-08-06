"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  RiLayoutGridLine,
  RiSettings4Line,
  RiShareLine,
  RiFolderLine,
  RiLogoutBoxRLine,
  RiCheckLine,
  RiSaveLine,
  RiExternalLinkLine,
  RiSparklingFill,
  RiUser3Line,
} from "react-icons/ri";
import { siteConfig, projects as initialProjects } from "@/data/site-data";
import { getLocalSettings, saveLocalSettings, SiteSettings, HeroLayoutType } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"banner" | "settings" | "socials" | "projects">("banner");
  const [settings, setSettings] = useState<SiteSettings>(getLocalSettings());
  const [savedMessage, setSavedMessage] = useState("");
  const [projectsList, setProjectsList] = useState(initialProjects);

  // Auth guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("ppg_admin_auth");
      if (!auth) {
        router.push("/dashboard/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ppg_admin_auth");
      document.cookie = "ppg_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
    router.push("/dashboard/login");
  };

  const handleLayoutChange = (layout: HeroLayoutType) => {
    const updated = saveLocalSettings({ bannerLayout: layout });
    setSettings(updated);
    showSavedNotification(`Hero Layout updated to ${layout === "split" ? "Split Person Photo" : "Tony Robbins Full Width"}`);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalSettings(settings);
    showSavedNotification("Site settings saved successfully!");
  };

  const showSavedNotification = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 3500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}>

      {/* Top Admin Header */}
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/" aria-label="Home" style={{ display: "flex" }}>
              <div style={{ position: "relative", width: "8.5rem", height: "2.25rem" }}>
                <Image
                  src="/brand/logos/logo-horizontal-dark.png"
                  alt="Prince Parfait GANZA"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, background: "rgba(14, 82, 168, 0.1)", color: "var(--color-primary)", padding: "0.25rem 0.625rem", borderRadius: "9999px" }}>
              Admin Dashboard
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/" target="_blank" className="btn btn-outline btn-sm" style={{ gap: "0.375rem" }}>
              Live Site <RiExternalLinkLine size={14} />
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: "#ef4444", gap: "0.375rem" }}>
              <RiLogoutBoxRLine size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Saved Toast Notification */}
      {savedMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 100,
            background: "#16a34a",
            color: "#ffffff",
            padding: "0.875rem 1.25rem",
            borderRadius: "0.875rem",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <RiCheckLine size={18} />
          {savedMessage}
        </div>
      )}

      {/* Main Dashboard Body */}
      <div className="container" style={{ padding: "2rem 1.5rem 4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "15rem 1fr", gap: "2rem" }} className="grid-cols-1 md:grid-cols-[15rem_1fr]">

          {/* Sidebar Nav */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            {[
              { id: "banner", label: "Banner & Hero", icon: RiLayoutGridLine },
              { id: "settings", label: "Site Information", icon: RiSettings4Line },
              { id: "socials", label: "Social Links", icon: RiShareLine },
              { id: "projects", label: "Projects Manager", icon: RiFolderLine },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    border: "none",
                    background: active ? "rgba(14, 82, 168, 0.1)" : "transparent",
                    color: active ? "var(--color-primary)" : "var(--color-text-2)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Tab Contents */}
          <main style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "1.25rem", padding: "2rem", boxShadow: "var(--shadow-sm)" }}>

            {/* TAB 1: Banner & Hero Selector */}
            {activeTab === "banner" && (
              <div>
                <div style={{ marginBottom: "1.75rem" }}>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text)" }}>
                    Hero Banner Layout Manager
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.25rem" }}>
                    Select which Hero design style to present on the homepage in real-time.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="grid-cols-1 md:grid-cols-2">

                  {/* Option 1: Split Hero */}
                  <div
                    onClick={() => handleLayoutChange("split")}
                    style={{
                      border: settings.bannerLayout === "split" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      borderRadius: "1rem",
                      padding: "1.5rem",
                      cursor: "pointer",
                      background: settings.bannerLayout === "split" ? "rgba(14, 82, 168, 0.04)" : "var(--color-bg)",
                      position: "relative",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {settings.bannerLayout === "split" && (
                      <span style={{ position: "absolute", top: "1rem", right: "1rem", background: "var(--color-primary)", color: "#ffffff", padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700 }}>
                        ACTIVE
                      </span>
                    )}
                    <div style={{ position: "relative", width: "100%", height: "9rem", borderRadius: "0.75rem", overflow: "hidden", marginBottom: "1rem", background: "#f1f5f9" }}>
                      <Image
                        src="/images/profile/hero-photo.png"
                        alt="Split Layout Preview"
                        fill
                        className="object-contain object-bottom"
                      />
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)" }}>
                      Layout 1: Split Hero (Photo + Stats)
                    </h3>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", marginTop: "0.375rem", lineHeight: 1.5 }}>
                      Classic split presentation featuring your portrait photo inside an organic arch frame alongside high-converting stats badges.
                    </p>
                  </div>

                  {/* Option 2: Tony Robbins Full Width */}
                  <div
                    onClick={() => handleLayoutChange("tony_robbins")}
                    style={{
                      border: settings.bannerLayout === "tony_robbins" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      borderRadius: "1rem",
                      padding: "1.5rem",
                      cursor: "pointer",
                      background: settings.bannerLayout === "tony_robbins" ? "rgba(14, 82, 168, 0.04)" : "var(--color-bg)",
                      position: "relative",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {settings.bannerLayout === "tony_robbins" && (
                      <span style={{ position: "absolute", top: "1rem", right: "1rem", background: "var(--color-primary)", color: "#ffffff", padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700 }}>
                        ACTIVE
                      </span>
                    )}
                    <div style={{ position: "relative", width: "100%", height: "9rem", borderRadius: "0.75rem", overflow: "hidden", marginBottom: "1rem", background: "linear-gradient(135deg, #0e52a8 0%, #1e1b4b 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                      <div style={{ textAlign: "center", padding: "1rem" }}>
                        <RiSparklingFill size={24} style={{ margin: "0 auto 0.25rem", color: "#60a5fa" }} />
                        <div style={{ fontSize: "0.875rem", fontWeight: 800 }}>TONY ROBBINS STYLE</div>
                        <div style={{ fontSize: "0.65rem", opacity: 0.8 }}>Full-width Banner & Quote Overlay</div>
                      </div>
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)" }}>
                      Layout 2: Tony Robbins Full-Width Banner
                    </h3>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", marginTop: "0.375rem", lineHeight: 1.5 }}>
                      Cinematic executive design with bold typography, high impact dark/light mode presence, direct WhatsApp CTA, and feature highlights.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Site Information */}
            {activeTab === "settings" && (
              <form onSubmit={handleSettingsSave}>
                <div style={{ marginBottom: "1.75rem" }}>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text)" }}>
                    Site & Personal Information
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.25rem" }}>
                    Update your display name, title, bio, and contact info.
                  </p>
                </div>

                <div style={{ display: "grid", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)", marginBottom: "0.375rem" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={settings.siteTitle}
                      onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.875rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)", marginBottom: "0.375rem" }}>
                      Subtitle / Roles
                    </label>
                    <input
                      type="text"
                      value={settings.siteSubtitle}
                      onChange={(e) => setSettings({ ...settings, siteSubtitle: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.875rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)", marginBottom: "0.375rem" }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={settings.location}
                      onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.875rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)", marginBottom: "0.375rem" }}>
                      Bio Summary
                    </label>
                    <textarea
                      rows={3}
                      value={settings.bio}
                      onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.875rem", outline: "none" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)", marginBottom: "0.375rem" }}>
                        WhatsApp Phone Number
                      </label>
                      <input
                        type="text"
                        value={settings.whatsappNumber}
                        onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.875rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)", marginBottom: "0.375rem" }}>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.875rem" }}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: "1.75rem", gap: "0.5rem" }}>
                  <RiSaveLine size={18} /> Save Changes
                </button>
              </form>
            )}

            {/* TAB 3: Social Links */}
            {activeTab === "socials" && (
              <div>
                <div style={{ marginBottom: "1.75rem" }}>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text)" }}>
                    Social Links Directory
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.25rem" }}>
                    Manage canonical URLs for all social platforms across the site.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    { key: "whatsapp", label: "WhatsApp", url: siteConfig.social.whatsapp },
                    { key: "linkedin", label: "LinkedIn", url: siteConfig.social.linkedin },
                    { key: "instagram", label: "Instagram", url: siteConfig.social.instagram },
                    { key: "github", label: "GitHub", url: siteConfig.social.github },
                    { key: "twitter", label: "X / Twitter", url: siteConfig.social.twitter },
                    { key: "tiktok", label: "TikTok", url: siteConfig.social.tiktok },
                    { key: "youtube", label: "YouTube", url: siteConfig.social.youtube },
                    { key: "luma", label: "Luma Events", url: siteConfig.social.luma },
                    { key: "buymeacoffee", label: "Buy Me a Coffee", url: siteConfig.social.buymeacoffee },
                  ].map((s) => (
                    <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.875rem 1rem", borderRadius: "0.75rem", background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                      <span style={{ width: "8rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>{s.label}</span>
                      <input
                        type="text"
                        defaultValue={s.url}
                        style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "0.5rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-2)", fontSize: "0.8125rem" }}
                      />
                      <a href={s.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: "0.5rem" }}>
                        <RiExternalLinkLine size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Projects Manager */}
            {activeTab === "projects" && (
              <div>
                <div style={{ marginBottom: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text)" }}>
                      Featured Projects ({projectsList.length})
                    </h2>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.25rem" }}>
                      Manage portfolio items rendered across the site.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {projectsList.map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderRadius: "0.75rem", background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                      <div>
                        <h4 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text)" }}>{p.title}</h4>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", marginTop: "0.15rem" }}>{p.category.toUpperCase()} • {p.technologies.slice(0, 3).join(", ")}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "9999px", background: p.featured ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.1)", color: p.featured ? "#22c55e" : "#64748b", fontWeight: 600 }}>
                          {p.featured ? "Featured" : "Standard"}
                        </span>
                        {p.links?.live && (
                          <a href={p.links.live} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                            View <RiExternalLinkLine size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
