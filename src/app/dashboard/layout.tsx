"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  RiMailLine,
  RiContactsBook2Line,
  RiPagesLine,
  RiArrowDownSLine,
  RiUser3Line,
  RiUserHeartLine,
  RiFileTextLine,
  RiSparklingLine,
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

  // Navigation & UI States — start closed to avoid mobile overlay flash
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(
    () =>
      pathname.startsWith("/dashboard/homepage") ||
      pathname.startsWith("/dashboard/contact") ||
      pathname.startsWith("/dashboard/about") ||
      pathname.startsWith("/dashboard/services") ||
      pathname.startsWith("/dashboard/intro"),
  );

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

  useEffect(() => {
    if (
      pathname.startsWith("/dashboard/homepage") ||
      pathname.startsWith("/dashboard/contact") ||
      pathname.startsWith("/dashboard/about") ||
      pathname.startsWith("/dashboard/services") ||
      pathname.startsWith("/dashboard/intro")
    ) {
      setPagesOpen(true);
    }
  }, [pathname]);

  // Close drawer after navigation on mobile
  useEffect(() => {
    if (isMobileNav) setSidebarOpen(false);
  }, [pathname, isMobileNav]);

  // Load settings + sidebar state; mobile always starts closed
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 980px)");
    const syncSidebar = () => {
      const mobile = mq.matches;
      setIsMobileNav(mobile);
      if (mobile) {
        setSidebarOpen(false);
        return;
      }
      try {
        const savedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        setSidebarOpen(savedSidebar === null ? true : savedSidebar === "true");
      } catch {
        setSidebarOpen(true);
      }
    };
    syncSidebar();
    mq.addEventListener("change", syncSidebar);

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
    return () => {
      mq.removeEventListener("change", syncSidebar);
      window.removeEventListener("ppg_profile_updated", loadProfile);
    };
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
    setLogoutConfirmOpen(false);
    router.push("/dashboard/login");
  };

  const requestLogout = () => {
    if (isMobileNav) {
      setLogoutConfirmOpen(true);
      return;
    }
    handleLogout();
  };

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    if (!isMobileNav) {
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
    }
  };

  const closeMobileSidebar = () => {
    if (isMobileNav) setSidebarOpen(false);
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

  const showNavLabels = sidebarOpen || isMobileNav;
  const sidebarClass = [
    "dash-sidebar",
    showNavLabels ? "is-open" : "",
    isMobileNav && sidebarOpen ? "is-drawer-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DashboardFeedbackProvider>
    <div className="dash-shell">
      {isMobileNav && sidebarOpen ? (
        <button
          type="button"
          className="dash-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={closeMobileSidebar}
        />
      ) : null}
      <aside className={sidebarClass} aria-hidden={isMobileNav && !sidebarOpen ? true : undefined}>
        <div className="dash-sidebar-top">
          <Link
            href="/dashboard"
            className="dash-brand"
            title="Prince Parfait GANZA"
            onClick={closeMobileSidebar}
          >
            {showNavLabels ? (
              <img
                src="/brand/logos/logo-horizontal-light.png"
                alt="Prince Parfait GANZA"
                className="dash-brand-logo"
              />
            ) : (
              <img
                src="/brand/icons/icon-white.png"
                alt="Prince Parfait GANZA"
                className="dash-brand-mark"
              />
            )}
          </Link>

          <nav className="dash-nav" aria-label="Dashboard">
            {[
              { id: "overview", path: "/dashboard", label: "Analytics", icon: RiDashboardLine },
              { id: "banners", path: "/dashboard/banners", label: "Banners & Hero", icon: RiLayoutGridLine },
              { id: "blogs", path: "/dashboard/blogs", label: "Blog Articles", icon: RiBookOpenLine },
              { id: "projects", path: "/dashboard/projects", label: "Projects", icon: RiFolderLine },
              { id: "cv", path: "/dashboard/cv", label: "CV / Resume", icon: RiFileTextLine },
              { id: "media", path: "/dashboard/media", label: "Media Library", icon: RiImageLine },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = tab.path === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(tab.path);
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  title={tab.label}
                  className={active ? "dash-nav-link is-active" : "dash-nav-link"}
                  onClick={closeMobileSidebar}
                >
                  <Icon size={17} />
                  {showNavLabels ? <span>{tab.label}</span> : null}
                </Link>
              );
            })}

            <div
              className={
                pagesOpen ||
                pathname.startsWith("/dashboard/homepage") ||
                pathname.startsWith("/dashboard/contact") ||
                pathname.startsWith("/dashboard/about") ||
                pathname.startsWith("/dashboard/services") ||
                pathname.startsWith("/dashboard/intro")
                  ? "dash-nav-group is-open"
                  : "dash-nav-group"
              }
            >
              <button
                type="button"
                className={
                  pathname.startsWith("/dashboard/homepage") ||
                  pathname.startsWith("/dashboard/contact") ||
                  pathname.startsWith("/dashboard/about") ||
                  pathname.startsWith("/dashboard/services") ||
                  pathname.startsWith("/dashboard/intro")
                    ? "dash-nav-link is-active"
                    : "dash-nav-link"
                }
                title="Pages"
                aria-expanded={pagesOpen}
                onClick={() => setPagesOpen((current) => !current)}
              >
                <RiPagesLine size={17} />
                {showNavLabels ? <span>Pages</span> : null}
                {showNavLabels ? <RiArrowDownSLine size={16} className="dash-nav-caret" /> : null}
              </button>
              {pagesOpen || !showNavLabels ? (
                <div className="dash-nav-sub" hidden={!pagesOpen && showNavLabels}>
                  {[
                    { id: "homepage", path: "/dashboard/homepage", label: "Homepage", icon: RiHome5Line },
                    { id: "intro", path: "/dashboard/intro", label: "Intro Experience", icon: RiSparklingLine },
                    { id: "about", path: "/dashboard/about", label: "About", icon: RiUser3Line },
                    { id: "services", path: "/dashboard/services", label: "Services", icon: RiLayoutGridLine },
                    { id: "contact", path: "/dashboard/contact", label: "Contact", icon: RiContactsBook2Line },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = pathname.startsWith(tab.path);
                    return (
                      <Link
                        key={tab.id}
                        href={tab.path}
                        title={tab.label}
                        className={active ? "dash-nav-link is-sub is-active" : "dash-nav-link is-sub"}
                        onClick={closeMobileSidebar}
                      >
                        <Icon size={17} />
                        {showNavLabels ? <span>{tab.label}</span> : null}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {[
              { id: "messages", path: "/dashboard/messages", label: "Messages", icon: RiMailLine },
              { id: "subscribers", path: "/dashboard/subscribers", label: "Subscribers", icon: RiUserHeartLine },
              { id: "settings", path: "/dashboard/settings", label: "Site Settings", icon: RiSettings4Line },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = pathname.startsWith(tab.path);
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  title={tab.label}
                  className={active ? "dash-nav-link is-active" : "dash-nav-link"}
                  onClick={closeMobileSidebar}
                >
                  <Icon size={17} />
                  {showNavLabels ? <span>{tab.label}</span> : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/dashboard/profile"
          className={pathname === "/dashboard/profile" ? "dash-profile is-active" : "dash-profile"}
          title="Update Profile & Avatar"
          onClick={closeMobileSidebar}
        >
          <div className="dash-avatar">
            <img src={profile.avatarUrl} alt={profile.name} />
          </div>
          {showNavLabels ? (
            <div className="dash-profile-copy">
              <p>{profile.name}</p>
              <span>{profile.email}</span>
            </div>
          ) : null}
        </Link>
      </aside>

      <div className="dash-column">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <button
              type="button"
              onClick={toggleSidebar}
              className="dash-icon-btn"
              title={
                isMobileNav
                  ? sidebarOpen
                    ? "Close menu"
                    : "Open menu"
                  : sidebarOpen
                    ? "Collapse Sidebar"
                    : "Expand Sidebar"
              }
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <RiMenuFoldLine size={20} /> : <RiMenuUnfoldLine size={20} />}
            </button>
            <span className="dash-badge">Control Center</span>
          </div>

          <div className="dash-search">
            <div className="dash-search-field">
              <RiSearchLine size={16} className="dash-search-icon" />
              <input
                type="text"
                placeholder={isMobileNav ? "Search…" : "Search sections, content, media..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
            </div>

            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="dash-search-results">
                {filteredProjects.length === 0 && filteredBlogs.length === 0 ? (
                  <div className="dash-search-empty">
                    No matches found for &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  <div className="dash-search-groups">
                    {filteredProjects.length > 0 && (
                      <div>
                        <p className="dash-search-label">Projects</p>
                        {filteredProjects.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="dash-search-item"
                            onClick={() => {
                              setEditingProject(p);
                              setIsProjectModalOpen(true);
                            }}
                          >
                            <strong>{p.title}</strong>
                            <span>{p.description}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredBlogs.length > 0 && (
                      <div>
                        <p className="dash-search-label">Blogs</p>
                        {filteredBlogs.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            className="dash-search-item"
                            onClick={() => {
                              setEditingBlog(b);
                              setIsBlogModalOpen(true);
                            }}
                          >
                            <strong>{b.title}</strong>
                            <span>{b.excerpt}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="dash-topbar-right">
            <Link href="/" target="_blank" className="btn btn-outline btn-sm dash-live-btn" title="View live site">
              <span className="dash-live-label">Live</span>
              <span className="dash-live-label-full">View Live Site</span>
              <RiExternalLinkLine size={13} />
            </Link>
            <button
              type="button"
              onClick={requestLogout}
              className="btn btn-ghost btn-sm dash-logout-btn"
              title="Logout"
              aria-label="Logout"
            >
              <RiLogoutBoxRLine size={16} />
              <span className="dash-logout-label">Logout</span>
            </button>
          </div>
        </header>

        <main
          className={
            pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/media")
              ? "dash-main is-flush"
              : "dash-main"
          }
        >
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
        onSave={() => { /* Only for search edit */ }}
        onPickMedia={(apply) => triggerMediaPicker(apply)}
      />

      <BlogEditorModal
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        post={editingBlog}
        onSave={() => { /* Only for search edit */ }}
        onOpenMedia={() => triggerMediaPicker((url) => setEditingBlog((prev) => (prev ? { ...prev, coverImage: url } : null)))}
      />

      {logoutConfirmOpen ? (
        <div className="dash-sheet-layer" role="presentation">
          <button
            type="button"
            className="dash-sheet-backdrop"
            aria-label="Dismiss logout confirmation"
            onClick={() => setLogoutConfirmOpen(false)}
          />
          <div className="dash-sheet" role="dialog" aria-modal="true" aria-labelledby="dash-logout-title">
            <div className="dash-sheet-handle" aria-hidden="true" />
            <h2 id="dash-logout-title">Log out?</h2>
            <p>You will need to sign in again to open the control center.</p>
            <div className="dash-sheet-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setLogoutConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary dash-logout-confirm" onClick={handleLogout}>
                <RiLogoutBoxRLine size={16} /> Log out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
    </DashboardFeedbackProvider>
  );
}
