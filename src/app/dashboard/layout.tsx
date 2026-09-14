"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  RiDashboardLine,
  RiLayoutGridLine,
  RiSettings4Line,
  RiFolderLine,
  RiBookOpenLine,
  RiLogoutBoxRLine,
  RiExternalLinkLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiImageLine,
  RiSearchLine,
  RiHome5Line,
} from "react-icons/ri";

import {
  projects as initialProjects,
  blogPosts as initialBlogPosts,
  Project,
  BlogPost,
} from "@/data/site-data";
import { SIDEBAR_STORAGE_KEY } from "@/lib/supabase";

import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { DashboardFeedbackProvider } from "@/components/dashboard/DashboardFeedback";
export interface AdminProfile {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}
import BlogEditorModal from "@/components/dashboard/BlogEditorModal";
import ProjectEditorModal from "@/components/dashboard/ProjectEditorModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  if (typeof window !== "undefined") {
    try {
      if (localStorage.getItem("ppg_admin_auth") === "true") {
        document.cookie = "ppg_admin_auth=true; path=/; max-age=86400; SameSite=Lax";
      }
    } catch {}
  }

  // Navigation & UI States
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Search & Global State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Profile Data
  const [profile, setProfile] = useState<AdminProfile>({
    name: "Prince Parfait GANZA",
    email: "ganzaparfait7@gmail.com",
    avatarUrl: "/images/profile/prince-parfait-ganza-kigali-rwanda.webp",
    role: "Super Admin",
  });

  // Load settings + sidebar state client-side only
  useEffect(() => {
    try {
      const savedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (savedSidebar !== null) {
        setSidebarOpen(savedSidebar === "true");
      }
    } catch {}

    const loadProfile = () => {
      try {
        const stored = localStorage.getItem("ppg_admin_profile");
        if (stored) {
          setProfile(JSON.parse(stored));
        }
      } catch {}
    };
    loadProfile();
    window.addEventListener("ppg_profile_updated", loadProfile);
    return () => window.removeEventListener("ppg_profile_updated", loadProfile);
  }, []);

  // Modals Control for Layout (Profile & Search)
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaTargetCallback, setMediaTargetCallback] = useState<((url: string) => void) | null>(null);

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

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next)); } catch {}
  };

  const triggerMediaPicker = (callback: (url: string) => void) => {
    setMediaTargetCallback(() => callback);
    setIsMediaOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (url.startsWith("blob:")) return;
    if (mediaTargetCallback) {
      mediaTargetCallback(url);
      setMediaTargetCallback(null);
    }
  };

  // Global Dynamic Search Filter (using static data for simplicity, as originally done)
  const filteredProjects = initialProjects.filter(
    (p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredBlogs = initialBlogPosts.filter(
    (b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (pathname === "/dashboard/login") {
    return <>{children}</>;
  }

  return (
    <DashboardFeedbackProvider>
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", color: "#0f172a", overflow: "hidden" }}>
      <header
        style={{
          height: "5rem",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          zIndex: 50,
          boxShadow: "0 1px 8px rgba(11,25,44,0.06)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={toggleSidebar}
            style={{ padding: "0.375rem", borderRadius: "0.375rem", border: "none", background: "none", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center" }}
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {sidebarOpen ? <RiMenuFoldLine size={20} /> : <RiMenuUnfoldLine size={20} />}
          </button>

          <Link href="/dashboard" style={{ display: "flex", alignItems: "center" }}>
            <div style={{ position: "relative", width: "11rem", height: "2.6rem" }}>
              <img
                src="/brand/logos/logo-horizontal-blue.png"
                alt="Prince Parfait GANZA"
                style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left" }}
              />
            </div>
          </Link>
          <span style={{ height: "1rem", width: "1px", background: "#cbd5e1" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", background: "#eff6ff", color: "#0e52a8", padding: "0.3rem 0.65rem", borderRadius: "0.4rem" }}>
            Control Center
          </span>
        </div>

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
                borderRadius: "0.375rem",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                fontSize: "0.8125rem",
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>

          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "2.5rem", left: 0, right: 0,
                background: "#ffffff", border: "1px solid #e2e8f0",
                borderRadius: "0.375rem", boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                padding: "0.875rem", zIndex: 100, maxHeight: "18rem", overflowY: "auto",
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

        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <Link href="/" target="_blank" className="btn btn-outline btn-sm" style={{ borderRadius: "0.375rem", gap: "0.375rem" }}>
            Live Site <RiExternalLinkLine size={13} />
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: "#ef4444", gap: "0.375rem", borderRadius: "0.375rem" }}>
            <RiLogoutBoxRLine size={15} /> Logout
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        <aside
          style={{
            width: sidebarOpen ? "17.5rem" : "4.75rem",
            minWidth: sidebarOpen ? "17.5rem" : "4.75rem",
            height: "100%",
            background: "#07111f",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "1.35rem 0.8rem",
            flexShrink: 0,
            zIndex: 40,
            transition: "width 0.25s ease, min-width 0.25s ease",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {[
              { id: "overview", path: "/dashboard", label: "Analytics Overview", icon: RiDashboardLine },
              { id: "banners", path: "/dashboard/banners", label: "Banners & Hero Layouts", icon: RiLayoutGridLine },
              { id: "blogs", path: "/dashboard/blogs", label: "Blog Articles", icon: RiBookOpenLine },
              { id: "projects", path: "/dashboard/projects", label: "Projects", icon: RiFolderLine },
              { id: "media", path: "/dashboard/media", label: "Media Library", icon: RiImageLine },
              { id: "homepage", path: "/dashboard/homepage", label: "Homepage", icon: RiHome5Line },
              { id: "settings", path: "/dashboard/settings", label: "Site Settings", icon: RiSettings4Line },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = tab.path === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(tab.path);
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  title={tab.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.85rem 0.9rem",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    borderRadius: "0.65rem",
                    fontSize: "0.9rem",
                    fontWeight: active ? 700 : 600,
                    textDecoration: "none",
                    background: active ? "#0e52a8" : "transparent",
                    color: active ? "#ffffff" : "#94a3b8",
                    width: "100%",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{tab.label}</span>}
                </Link>
              );
            })}
          </div>

          <Link
            href="/dashboard/profile"
            style={{
              padding: "0.75rem",
              borderRadius: "0.375rem",
              background: pathname === "/dashboard/profile" ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.06)",
              border: pathname === "/dashboard/profile" ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textDecoration: "none",
            }}
            title="Update Profile & Avatar"
          >
            <div style={{ position: "relative", width: "2.25rem", height: "2.25rem", borderRadius: "50%", overflow: "hidden", background: "#1e293b", flexShrink: 0 }}>
              <img src={profile.avatarUrl} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ffffff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {profile.name}
              </p>
              <p style={{ fontSize: "0.65rem", color: "#94a3b8", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {profile.email}
              </p>
            </div>
          </Link>
        </aside>

        <main style={{
          flex: 1,
          height: "100%",
          minHeight: 0,
          overflowY: pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/media") ? "hidden" : "auto",
          padding: pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/media") ? "1.1rem 1.25rem" : "1.75rem 2rem",
          background: "#eef2f7",
          display: pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/media") ? "flex" : undefined,
          flexDirection: pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/media") ? "column" : undefined,
        }}>
          {children}
        </main>
      </div>

      <MediaManagerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
      />

      <ProjectEditorModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={editingProject}
        onSave={(proj) => { /* Only for search edit */ }}
        onPickMedia={(apply) => triggerMediaPicker(apply)}
      />

      <BlogEditorModal
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        post={editingBlog}
        onSave={(blog) => { /* Only for search edit */ }}
        onOpenMedia={() => triggerMediaPicker((url) => setEditingBlog((prev) => (prev ? { ...prev, coverImage: url } : null)))}
      />
    </div>
    </DashboardFeedbackProvider>
  );
}
