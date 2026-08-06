"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  RiDashboardLine,
  RiLayoutGridLine,
  RiSettings4Line,
  RiShareLine,
  RiFolderLine,
  RiBookOpenLine,
  RiLogoutBoxRLine,
  RiCheckLine,
  RiSaveLine,
  RiExternalLinkLine,
  RiUser3Line,
  RiGroupLine,
  RiEyeLine,
  RiTimeLine,
  RiGlobalLine,
  RiEditLine,
  RiAddLine,
  RiSearchLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiMenuLine,
  RiCloseLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
} from "react-icons/ri";

import {
  siteConfig,
  projects as initialProjects,
  blogPosts as initialBlogPosts,
  Project,
  BlogPost,
} from "@/data/site-data";

import {
  getLocalSettings,
  saveLocalSettings,
  SiteSettings,
  HeroLayoutType,
  MOCK_ANALYTICS,
  AnalyticsMetrics,
} from "@/lib/supabase";

import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import AdminProfileModal, { AdminProfile } from "@/components/dashboard/AdminProfileModal";
import BlogEditorModal from "@/components/dashboard/BlogEditorModal";
import ProjectEditorModal from "@/components/dashboard/ProjectEditorModal";
import BannerEditorModal, { BannerItem } from "@/components/dashboard/BannerEditorModal";

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: "b1",
    title: "Prince Parfait GANZA",
    subtitle: "Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
    imageUrl: "/images/profile/hero-photo.png",
    buttonText: "View My Work",
    buttonLink: "/projects",
    pageLocation: "main_hero",
    sortOrder: 1,
    isActive: true,
    layoutStyle: "split_portrait",
  },
  {
    id: "b2",
    title: "Featured Executive Banner",
    subtitle: "Building Software that Creates Impact Across Africa and Beyond",
    imageUrl: "/images/profile/hero-photo.png",
    buttonText: "Let's Collaborate",
    buttonLink: "https://wa.me/250792054846",
    pageLocation: "main_hero",
    sortOrder: 2,
    isActive: true,
    layoutStyle: "featured_overlay",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<"overview" | "banners" | "blogs" | "projects" | "socials" | "settings">("overview");
  
  // Desktop & Mobile Sidebar Toggles (20% sidebar / 80% content ratio)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop collapse toggle
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer toggle
  const [savedMessage, setSavedMessage] = useState("");

  // Search & Global State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Settings & Profile Data
  const [settings, setSettings] = useState<SiteSettings>(getLocalSettings());
  const [profile, setProfile] = useState<AdminProfile>({
    name: "Prince Parfait GANZA",
    email: "ganzaparfait7@gmail.com",
    avatarUrl: "/images/profile/hero-photo.png",
    role: "Super Admin",
  });

  // Content Items (Real-time CRUD)
  const [bannersList, setBannersList] = useState<BannerItem[]>(DEFAULT_BANNERS);
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
  const [blogsList, setBlogsList] = useState<BlogPost[]>(initialBlogPosts);
  const [analytics, setAnalytics] = useState<AnalyticsMetrics>(MOCK_ANALYTICS);

  // Modals Control
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaTargetCallback, setMediaTargetCallback] = useState<((url: string) => void) | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  // Auth Guard
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

  const showNotification = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 3500);
  };

  // Hero Layout Switcher
  const handleLayoutChange = (layout: HeroLayoutType) => {
    const updated = saveLocalSettings({ bannerLayout: layout });
    setSettings(updated);
    showNotification(`Hero layout updated to ${layout === "split_portrait" ? "Split Portrait Layout" : "Gradient Overlay Banner"}`);
  };

  // Header Social Limit
  const handleSocialLimitChange = (limit: number) => {
    const updated = saveLocalSettings({ headerSocialLimit: limit });
    setSettings(updated);
    showNotification(`Primary header social icons limit set to ${limit}`);
  };

  // Settings Submit
  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalSettings(settings);
    showNotification("Site information saved successfully!");
  };

  // Profile Save
  const handleProfileSave = (updated: AdminProfile) => {
    setProfile(updated);
    showNotification("Admin profile updated!");
  };

  // CRUD Handlers — Banners
  const handleSaveBanner = (banner: BannerItem) => {
    const exists = bannersList.find((b) => b.id === banner.id);
    if (exists) {
      setBannersList(bannersList.map((b) => (b.id === banner.id ? banner : b)));
    } else {
      setBannersList([banner, ...bannersList]);
    }
    showNotification("Banner saved!");
  };

  const handleDeleteBanner = (id: string) => {
    setBannersList(bannersList.filter((b) => b.id !== id));
    showNotification("Banner removed.");
  };

  const handleToggleBannerActive = (id: string) => {
    setBannersList(bannersList.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
    showNotification("Banner status updated.");
  };

  // CRUD Handlers — Projects
  const handleSaveProject = (proj: Project) => {
    const exists = projectsList.find((p) => p.id === proj.id);
    if (exists) {
      setProjectsList(projectsList.map((p) => (p.id === proj.id ? proj : p)));
    } else {
      setProjectsList([proj, ...projectsList]);
    }
    showNotification("Project saved!");
  };

  const handleDeleteProject = (id: string) => {
    setProjectsList(projectsList.filter((p) => p.id !== id));
    showNotification("Project deleted.");
  };

  // CRUD Handlers — Blogs
  const handleSaveBlog = (blog: BlogPost) => {
    const exists = blogsList.find((b) => b.id === blog.id);
    if (exists) {
      setBlogsList(blogsList.map((b) => (b.id === blog.id ? blog : b)));
    } else {
      setBlogsList([blog, ...blogsList]);
    }
    showNotification("Blog post saved!");
  };

  const handleDeleteBlog = (id: string) => {
    setBlogsList(blogsList.filter((b) => b.id !== id));
    showNotification("Blog post removed.");
  };

  // Helper for Media Modal callback
  const triggerMediaPicker = (callback: (url: string) => void) => {
    setMediaTargetCallback(() => callback);
    setIsMediaOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTargetCallback) {
      mediaTargetCallback(url);
      setMediaTargetCallback(null);
    }
  };

  // Global Dynamic Search Filter
  const filteredProjects = projectsList.filter(
    (p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredBlogs = blogsList.filter(
    (b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", color: "#0f172a", overflow: "hidden" }}>

      {/* 100% STANDALONE ADMIN TOPBAR */}
      <header
        style={{
          height: "4rem",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem",
          zIndex: 50,
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          flexShrink: 0,
        }}
      >
        {/* Left: Toggler Button (Works on Desktop & Mobile) & Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Desktop Toggler */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex btn btn-ghost btn-sm"
            style={{ padding: "0.375rem", borderRadius: "0.375rem" }}
            title={sidebarCollapsed ? "Expand Sidebar (20%)" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <RiMenuUnfoldLine size={20} /> : <RiMenuFoldLine size={20} />}
          </button>

          {/* Mobile Toggler */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden btn btn-ghost btn-sm"
            style={{ padding: "0.375rem", borderRadius: "0.375rem" }}
            aria-label="Toggle Mobile Navigation"
          >
            {sidebarOpen ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
          </button>

          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ position: "relative", width: "8rem", height: "2rem" }}>
              <Image
                src="/brand/logos/logo-horizontal-dark.png"
                alt="Prince Parfait GANZA"
                fill
                className="object-contain object-left"
              />
            </div>
          </Link>
          <span style={{ height: "1rem", width: "1px", background: "#cbd5e1" }} className="hidden sm:block" />
          <span style={{ fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", background: "#eff6ff", color: "#1d4ed8", padding: "0.15rem 0.5rem", borderRadius: "0.25rem" }} className="hidden sm:inline-block">
            Control Center
          </span>
        </div>

        {/* Center: Dynamic Search with Fallbacks */}
        <div style={{ position: "relative", flex: "0 1 20rem" }}>
          <div style={{ position: "relative" }}>
            <RiSearchLine size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search projects, blogs, site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              style={{
                width: "100%",
                padding: "0.375rem 0.75rem 0.375rem 2.125rem",
                borderRadius: "0.375rem", // Small radius
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                fontSize: "0.8125rem",
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "2.5rem",
                left: 0,
                right: 0,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem", // Small radius
                boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                padding: "0.875rem",
                zIndex: 100,
                maxHeight: "18rem",
                overflowY: "auto",
              }}
            >
              {filteredProjects.length === 0 && filteredBlogs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "1rem", color: "#64748b", fontSize: "0.8125rem" }}>
                  No matches found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {filteredProjects.length > 0 && (
                    <div>
                      <p style={{ fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>Projects</p>
                      {filteredProjects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setEditingProject(p);
                            setIsProjectModalOpen(true);
                          }}
                          style={{ padding: "0.375rem 0.625rem", borderRadius: "0.25rem", cursor: "pointer", background: "#f8fafc", marginBottom: "0.25rem" }}
                        >
                          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>{p.title}</p>
                          <p style={{ fontSize: "0.7rem", color: "#64748b" }}>{p.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredBlogs.length > 0 && (
                    <div>
                      <p style={{ fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>Blogs</p>
                      {filteredBlogs.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setEditingBlog(b);
                            setIsBlogModalOpen(true);
                          }}
                          style={{ padding: "0.375rem 0.625rem", borderRadius: "0.25rem", cursor: "pointer", background: "#f8fafc", marginBottom: "0.25rem" }}
                        >
                          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>{b.title}</p>
                          <p style={{ fontSize: "0.7rem", color: "#64748b" }}>{b.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <Link href="/" target="_blank" className="btn btn-outline btn-sm" style={{ borderRadius: "0.375rem", gap: "0.375rem" }}>
            Live Site <RiExternalLinkLine size={13} />
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: "#ef4444", gap: "0.375rem", borderRadius: "0.375rem" }}>
            <RiLogoutBoxRLine size={15} /> Logout
          </button>
        </div>
      </header>

      {/* Saved Toast Notification */}
      {savedMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 300,
            background: "#16a34a",
            color: "#ffffff",
            padding: "0.75rem 1rem",
            borderRadius: "0.375rem", // Small radius
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.8125rem",
            fontWeight: 700,
          }}
        >
          <RiCheckLine size={16} />
          {savedMessage}
        </div>
      )}

      {/* MAIN CONTAINER BODY (Sidebar ~20% width / Content ~80% width) */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* BOLD DARK NAVY SIDEBAR (20% width on Desktop, Collapsible, Bold Scheme #0b1329) */}
        <aside
          style={{
            width: sidebarCollapsed ? "4.5rem" : "20%", // 20% ratio as requested
            minWidth: sidebarCollapsed ? "4.5rem" : "15rem",
            maxWidth: sidebarCollapsed ? "4.5rem" : "18rem",
            height: "100%",
            background: "#0b1329", // Bold Navy Dark background
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: sidebarCollapsed ? "1.25rem 0.5rem" : "1.25rem 0.875rem",
            flexShrink: 0,
            zIndex: 40,
            transition: "all 0.25s ease",
          }}
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative left-0 top-0 bottom-0`}
        >
          {/* Navigation Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {[
              { id: "overview", label: "Analytics Overview", icon: RiDashboardLine },
              { id: "banners", label: "Banners & Hero Layouts", icon: RiLayoutGridLine },
              { id: "blogs", label: "Blog Articles", icon: RiBookOpenLine },
              { id: "projects", label: "Portfolio Projects", icon: RiFolderLine },
              { id: "socials", label: "Social Links Controls", icon: RiShareLine },
              { id: "settings", label: "Site Information", icon: RiSettings4Line },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSidebarOpen(false);
                  }}
                  title={sidebarCollapsed ? tab.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: sidebarCollapsed ? "0.75rem" : "0.75rem 0.875rem",
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    borderRadius: "0.375rem", // Small radius
                    fontSize: "0.8125rem",
                    fontWeight: active ? 700 : 500,
                    border: "none",
                    background: active ? "#1d4ed8" : "transparent",
                    color: active ? "#ffffff" : "#94a3b8",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={18} />
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Dynamic Admin Profile Footer Button */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              padding: sidebarCollapsed ? "0.5rem" : "0.75rem",
              borderRadius: "0.375rem", // Small radius
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            className="hover:bg-white/10"
            title="Click to update Profile & Avatar"
          >
            <div style={{ position: "relative", width: "2.25rem", height: "2.25rem", borderRadius: "50%", overflow: "hidden", background: "#1e293b", flexShrink: 0 }}>
              <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
            </div>
            {!sidebarCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ffffff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {profile.name}
                </p>
                <p style={{ fontSize: "0.65rem", color: "#94a3b8", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {profile.email}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT VIEW (80% ratio on Desktop, Flush small border radius everywhere) */}
        <main style={{ flex: 1, height: "100%", overflowY: "auto", padding: "1.5rem 1.75rem" }}>
          
          {/* TAB 1: REAL-TIME ANALYTICS OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
                    Analytics & Performance Index
                  </h1>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>
                    Real-time visitor telemetry, geographic country capture, and traffic streams.
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "#ffffff", border: "1px solid #e2e8f0", padding: "0.375rem 0.875rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, color: "#16a34a" }}>
                  <span style={{ width: "0.45rem", height: "0.45rem", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                  Database Telemetry Active
                </div>
              </div>

              {/* Stat Cards Row (Flush layout, small radius 0.375rem) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "1rem" }}>
                {[
                  { label: "Total Site Visitors", value: analytics.totalVisitors.toLocaleString(), icon: RiGroupLine, change: "+14.2% this month", color: "#1d4ed8" },
                  { label: "Unique Visitors", value: analytics.uniqueVisitors.toLocaleString(), icon: RiUser3Line, change: "+8.5% new audience", color: "#6366f1" },
                  { label: "Total Pageviews", value: analytics.totalPageviews.toLocaleString(), icon: RiEyeLine, change: "+22.4% engagement", color: "#0891b2" },
                  { label: "Avg. Session Duration", value: analytics.avgDuration, icon: RiTimeLine, change: "Low bounce rate (34%)", color: "#16a34a" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.375rem", // Small radius
                        padding: "1.125rem",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>{s.label}</span>
                        <div style={{ width: "2rem", height: "2rem", borderRadius: "0.375rem", background: "#f1f5f9", color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={18} />
                        </div>
                      </div>
                      <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: "0.7rem", color: "#16a34a", marginTop: "0.35rem", fontWeight: 700 }}>{s.change}</p>
                    </div>
                  );
                })}
              </div>

              {/* Geographic Country Capture & Device Distribution Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.25rem" }} className="grid-cols-1 lg:grid-cols-[1.6fr_1fr]">
                
                {/* Geographic Country Capture */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.25rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                  <div style={{ marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <RiGlobalLine style={{ color: "#1d4ed8" }} /> Geographic Visitor Capture by Country
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>
                      Real-time country telemetry originating web traffic to princeparfait.com
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {analytics.countryBreakdown.map((c) => (
                      <div key={c.country}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
                          <span style={{ fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <span style={{ fontSize: "1rem" }}>{c.flag}</span> {c.country}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
                            {c.count.toLocaleString()} visits ({c.percentage}%)
                          </span>
                        </div>
                        <div style={{ width: "100%", height: "0.375rem", borderRadius: "0.25rem", background: "#f1f5f9", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${c.percentage}%`,
                              height: "100%",
                              borderRadius: "0.25rem",
                              background: c.country === "Rwanda" ? "#1d4ed8" : "linear-gradient(90deg, #6366f1, #0891b2)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Distribution */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.25rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.1rem" }}>
                    Device Distribution
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
                    Traffic split across hardware platforms
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {analytics.deviceBreakdown.map((d) => (
                      <div key={d.device} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0.875rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <span style={{ fontSize: "1.125rem" }}>{d.icon}</span>
                          <div>
                            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>{d.device}</p>
                            <p style={{ fontSize: "0.65rem", color: "#64748b" }}>Responsive view</p>
                          </div>
                        </div>
                        <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1d4ed8" }}>{d.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Real-time Visitor Stream Log Table */}
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.25rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.875rem" }}>
                  Real-Time Visitor Activity Stream
                </h3>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8125rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <th style={{ padding: "0.625rem 0.875rem" }}>Time</th>
                        <th style={{ padding: "0.625rem 0.875rem" }}>Location</th>
                        <th style={{ padding: "0.625rem 0.875rem" }}>Page Visited</th>
                        <th style={{ padding: "0.625rem 0.875rem" }}>Device / User Agent</th>
                        <th style={{ padding: "0.625rem 0.875rem" }}>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.75rem 0.875rem", color: "#64748b", fontSize: "0.75rem" }}>{log.time}</td>
                          <td style={{ padding: "0.75rem 0.875rem", fontWeight: 700, color: "#0f172a" }}>
                            {log.flag} {log.country}
                          </td>
                          <td style={{ padding: "0.75rem 0.875rem", color: "#1d4ed8", fontWeight: 600 }}>{log.page}</td>
                          <td style={{ padding: "0.75rem 0.875rem", color: "#334155" }}>{log.device}</td>
                          <td style={{ padding: "0.75rem 0.875rem", color: "#64748b", fontFamily: "monospace", fontSize: "0.75rem" }}>{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BANNERS & HERO LAYOUTS MANAGER */}
          {activeTab === "banners" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a" }}>
                    Banners & Hero Layouts Manager
                  </h2>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>
                    Manage home page carousel, executive banners, and presentation layouts.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingBanner(null);
                    setIsBannerModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ gap: "0.375rem", borderRadius: "0.375rem" }}
                >
                  <RiAddLine size={16} /> New Banner
                </button>
              </div>

              {/* Banners List Table */}
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8125rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <th style={{ padding: "0.75rem 1rem" }}>Preview</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Title / Details</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Layout Style</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bannersList.map((banner) => (
                        <tr key={banner.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ position: "relative", width: "2.75rem", height: "2.75rem", borderRadius: "0.25rem", overflow: "hidden", background: "#e2e8f0" }}>
                              <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                            </div>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <p style={{ fontWeight: 700, color: "#0f172a" }}>{banner.title}</p>
                            <p style={{ fontSize: "0.7rem", color: "#64748b" }}>{banner.subtitle}</p>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0.15rem 0.45rem", borderRadius: "0.25rem", background: "#f1f5f9", color: "#334155" }}>
                              {banner.layoutStyle === "split_portrait" ? "Split Portrait" : "Gradient Overlay"}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <button onClick={() => handleToggleBannerActive(banner.id)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "0.25rem", background: banner.isActive ? "rgba(34, 197, 94, 0.1)" : "rgba(100, 116, 139, 0.1)", color: banner.isActive ? "#16a34a" : "#64748b" }}>
                                {banner.isActive ? "ACTIVE" : "HIDDEN"}
                              </span>
                            </button>
                          </td>
                          <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.375rem" }}>
                              <button
                                onClick={() => {
                                  setEditingBanner(banner);
                                  setIsBannerModalOpen(true);
                                }}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: "0.375rem", borderRadius: "0.25rem" }}
                                title="Edit Banner"
                              >
                                <RiEditLine size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(banner.id)}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: "0.375rem", color: "#ef4444", borderRadius: "0.25rem" }}
                                title="Delete Banner"
                              >
                                <RiDeleteBinLine size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BLOG ARTICLES MANAGER */}
          {activeTab === "blogs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a" }}>
                    Blog Articles Manager ({blogsList.length})
                  </h2>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>
                    Write, edit, publish, and delete blog posts across the site.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingBlog(null);
                    setIsBlogModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ gap: "0.375rem", borderRadius: "0.375rem" }}
                >
                  <RiAddLine size={16} /> New Blog Article
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {blogsList.map((post) => (
                  <div key={post.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: "0.375rem", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      <div style={{ position: "relative", width: "3.5rem", height: "2.5rem", borderRadius: "0.25rem", overflow: "hidden", background: "#e2e8f0" }}>
                        <Image src={post.coverImage || "/images/blog/blog-placeholder.png"} alt={post.title} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a" }}>{post.title}</h4>
                        <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.1rem" }}>{post.date} • {post.category}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        onClick={() => {
                          setEditingBlog(post);
                          setIsBlogModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ gap: "0.25rem", borderRadius: "0.25rem" }}
                      >
                        <RiEditLine size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(post.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "#ef4444", padding: "0.375rem", borderRadius: "0.25rem" }}
                        title="Delete Article"
                      >
                        <RiDeleteBinLine size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PORTFOLIO PROJECTS MANAGER */}
          {activeTab === "projects" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a" }}>
                    Portfolio Projects ({projectsList.length})
                  </h2>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>
                    Manage engineering showcase items, live links, and categories.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsProjectModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ gap: "0.375rem", borderRadius: "0.375rem" }}
                >
                  <RiAddLine size={16} /> New Project
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {projectsList.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: "0.375rem", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                    <div>
                      <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a" }}>{p.title}</h4>
                      <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.1rem" }}>
                        {p.category.toUpperCase()} • {p.technologies.slice(0, 4).join(", ")}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        onClick={() => {
                          setEditingProject(p);
                          setIsProjectModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ gap: "0.25rem", borderRadius: "0.25rem" }}
                      >
                        <RiEditLine size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "#ef4444", padding: "0.375rem", borderRadius: "0.25rem" }}
                        title="Delete Project"
                      >
                        <RiDeleteBinLine size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SOCIAL LINKS CONTROLS */}
          {activeTab === "socials" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a" }}>
                  Social Links & Header Controls
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>
                  Limit how many social icons appear in top header before overflow into menu.
                </p>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.25rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
                  Primary Header Social Icons Limit
                </h3>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
                  Select how many primary icons to show directly in top header:
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleSocialLimitChange(num)}
                      style={{
                        padding: "0.5rem 1.125rem",
                        borderRadius: "0.375rem", // Small radius
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        border: "1px solid #cbd5e1",
                        background: (settings.headerSocialLimit || 3) === num ? "#1d4ed8" : "#ffffff",
                        color: (settings.headerSocialLimit || 3) === num ? "#ffffff" : "#0f172a",
                        cursor: "pointer",
                      }}
                    >
                      {num} {num === 1 ? "Icon" : "Icons"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SITE INFORMATION */}
          {activeTab === "settings" && (
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.5rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
              <form onSubmit={handleSettingsSave}>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.15rem" }}>
                  Site & Brand Settings
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1.25rem" }}>
                  Update global founder titles, location, and bio.
                </p>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                      Display Name / Title
                    </label>
                    <input
                      type="text"
                      value={settings.siteTitle}
                      onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: "0.8125rem", color: "#0f172a" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                      Roles & Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.siteSubtitle}
                      onChange={(e) => setSettings({ ...settings, siteSubtitle: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: "0.8125rem", color: "#0f172a" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                      Bio Summary
                    </label>
                    <textarea
                      rows={3}
                      value={settings.bio}
                      onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: "0.8125rem", color: "#0f172a", outline: "none" }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: "1.25rem", gap: "0.375rem", borderRadius: "0.375rem" }}>
                  <RiSaveLine size={16} /> Save Settings
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ALL REUSABLE MODALS */}
      <MediaManagerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
      />

      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleProfileSave}
        onOpenMedia={() => triggerMediaPicker((url) => setProfile((prev) => ({ ...prev, avatarUrl: url })))}
      />

      <BannerEditorModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        banner={editingBanner}
        onSave={handleSaveBanner}
        onOpenMedia={() => triggerMediaPicker((url) => setEditingBanner((prev) => (prev ? { ...prev, imageUrl: url } : null)))}
      />

      <ProjectEditorModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={editingProject}
        onSave={handleSaveProject}
        onOpenMedia={() => triggerMediaPicker((url) => setEditingProject((prev) => (prev ? { ...prev, image: url } : null)))}
      />

      <BlogEditorModal
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        post={editingBlog}
        onSave={handleSaveBlog}
        onOpenMedia={() => triggerMediaPicker((url) => setEditingBlog((prev) => (prev ? { ...prev, coverImage: url } : null)))}
      />

    </div>
  );
}
