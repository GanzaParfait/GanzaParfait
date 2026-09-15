"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiGithubFill,
  RiLinkedinFill,
  RiTwitterXFill,
  RiWhatsappLine,
  RiInstagramLine,
  RiFacebookFill,
  RiShareLine,
  RiFileCopyLine,
  RiCheckLine,
  RiCloseLine,
  RiMore2Line,
} from "react-icons/ri";
import { siteConfig, primaryNav } from "@/data/site-data";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { socialIcon, socialsFor } from "@/lib/socials";
import AnnouncementBar from "@/components/layout/AnnouncementBar";

const navLinks = primaryNav;

export default function Navbar() {
  const pathname   = usePathname();
  const [isOpen,    setIsOpen]    = useState(false);
  const [isScrolled,setIsScrolled]= useState(false);
  const [isDark,    setIsDark]    = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [homeCue, setHomeCue] = useState(false);
  const settings = useSiteSettings();
  const headerRef = useRef<HTMLElement>(null);
  const headerSocials = socialsFor(settings, "header");
  const primarySocials = headerSocials.slice(0, settings.headerSocialLimit || 3);
  const overflowSocials = headerSocials.slice(settings.headerSocialLimit || 3);
  const isPill = (settings.navbarStyle || "pill") === "pill";

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Sync dark state for logo switching
  useEffect(() => {
    const update = () => setIsDark(
      document.documentElement.getAttribute("data-theme") === "dark"
    );
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setIsOpen(false);
      setShareOpen(false);
      setMoreOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    if (!shareOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShareOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shareOpen]);

  useEffect(() => {
    if (pathname === "/") setHomeCue(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.setAttribute("data-navbar", isPill ? "pill" : "full");
    const el = headerRef.current;
    if (!el) return;

    const applyOffset = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      // Buffer so page content never sits under the fixed announcement + nav.
      const px = Math.max(height + 4, isPill ? 70 : 64);
      document.documentElement.style.setProperty("--public-nav-offset", `${px}px`);
    };

    applyOffset();
    const observer = new ResizeObserver(applyOffset);
    observer.observe(el);
    window.addEventListener("resize", applyOffset);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", applyOffset);
    };
  }, [isPill, settings.announcementIsActive, settings.announcementText, settings.announcementBarPosition]);

  const barPosition = settings.announcementBarPosition === "bottom" ? "bottom" : "top";
  const showTopBar = settings.announcementIsActive && Boolean(settings.announcementText?.trim()) && barPosition === "top";
  const showBottomBar = settings.announcementIsActive && Boolean(settings.announcementText?.trim()) && barPosition === "bottom";

  const logoSrc = isDark
    ? "/brand/logos/logo-horizontal-light.png"
    : "/brand/logos/logo-horizontal-blue.png";

  // Theme-adaptive pill colors
  const pillBg = isDark ? "rgba(10, 22, 40, 0.92)" : "rgba(255, 255, 255, 0.97)";
  const pillBorder = isDark ? "rgba(14, 82, 168, 0.2)" : "rgba(0, 0, 0, 0.06)";
  const pillShadow = isScrolled
    ? isDark
      ? "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)"
      : "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)"
    : isDark
      ? "0 2px 12px rgba(0,0,0,0.3)"
      : "0 2px 12px rgba(0,0,0,0.06)";

  const navLinkColor = (active: boolean) =>
    active ? "var(--color-primary)" : "var(--color-text-2)";
  const getShareDetails = () => {
    const url = window.location.href.split("?")[0];
    const title = document.title || "Prince Parfait GANZA";
    return { url, title, encodedUrl: encodeURIComponent(url), encodedTitle: encodeURIComponent(title) };
  };

  const copyPageLink = async () => {
    const { url } = getShareDetails();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const openNativeShare = async () => {
    const { url, title } = getShareDetails();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        setShareOpen(false);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyPageLink();
  };

  const shareOptions = !shareOpen || typeof window === "undefined" ? [] : (() => {
    const { encodedUrl, encodedTitle } = getShareDetails();
    return [
      { label: "WhatsApp", icon: RiWhatsappLine, href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
      { label: "LinkedIn", icon: RiLinkedinFill, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
      { label: "X", icon: RiTwitterXFill, href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
      { label: "Facebook", icon: RiFacebookFill, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    ];
  })();

  return (
    <>
      {/* ── TOP BAR ── */}
      <header
        ref={headerRef}
        role="banner"
        onMouseEnter={() => setHomeCue(pathname !== "/")}
        onMouseLeave={() => setHomeCue(false)}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          transition: "all 0.3s ease",
          padding: 0,
        }}
      >
        {showTopBar ? <AnnouncementBar settings={settings} /> : null}
        <div style={{ padding: isPill ? "0.45rem clamp(1.1rem, 3vw, 2.75rem) 0" : 0 }}>
        <div
          style={{
            background: pillBg,
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            border: isPill ? `1px solid ${pillBorder}` : "none",
            borderBottom: isPill ? "none" : `1px solid ${pillBorder}`,
            borderRadius: isPill ? "9999px" : 0,
            boxShadow: pillShadow,
            maxWidth: isPill ? "92rem" : undefined,
            margin: isPill ? "0 auto" : undefined,
            transition: "box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease, border-radius 0.3s ease",
          }}
        >
          <div
            className={isPill ? undefined : "container"}
          style={{
            minHeight: isPill ? "3.55rem" : "3.75rem",
            padding: isPill ? "0.35rem 1rem" : "0.45rem 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            width: "100%",
            maxWidth: isPill ? "none" : undefined,
          }}
        >

          {/* Logo is the home link. There is no Home item in the nav. */}
          <Link
            href="/"
            aria-label="Prince Parfait GANZA — Home"
            className="home-logo"
            data-home-cue={pathname !== "/" && homeCue ? "true" : undefined}
            style={{ display: "flex", flexShrink: 0 }}
          >
            <div style={{ position: "relative", width: "clamp(7.5rem, 17vw, 10.75rem)", height: "2.3rem" }}>
              <Image
                src={logoSrc}
                alt="Prince Parfait GANZA"
                fill
                sizes="200px"
                className="object-contain object-left"
                priority
              />
              </div>
              <span className="home-logo-cue">Home</span>
            </Link>

          <nav
            aria-label="Main navigation"
            className="hidden md:flex"
            style={{ flex: 1, justifyContent: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive ? "nav-link is-active" : "nav-link"}
                  style={{
                    padding: "0.4rem 0.65rem",
                    borderRadius: 0,
                    fontSize: "0.85rem",
                    fontWeight: isActive ? 700 : 600,
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    color: navLinkColor(isActive),
                    background: "transparent",
                    letterSpacing: isActive ? "-0.01em" : "0",
                    position: "relative",
                  }}
                >
                  {link.label}
                </Link>
                );
              })}
            </div>
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexShrink: 0 }}>

            <div className="hidden lg:flex" style={{ alignItems: "center", gap: "0.125rem", position: "relative" }}>
              {primarySocials.map((link) => {
                const Icon = socialIcon(link.platform);
                return (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label} data-tip={link.label} data-tip-place="below" className="nav-social-icon navbar-social-link social-tip">
                  <Icon size={15} />
                </a>
                );
              })}
              {overflowSocials.length > 0 && (
                <div style={{ position: "relative" }}>
                  <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-label="More social links" aria-expanded={moreOpen} className="nav-social-icon navbar-social-link">
                    <RiMore2Line size={15} />
                  </button>
                  {moreOpen && (
                    <div className="navbar-more-menu" role="menu">
                      {overflowSocials.map((link) => {
                        const Icon = socialIcon(link.platform);
                        return (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" role="menuitem" className="nav-more-item navbar-more-item">
                          <Icon size={15} /> {link.label}
                        </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="nav-desktop-only">
              <ThemeToggle />
            </span>

            <Link href="/contact" className="btn btn-primary nav-talk" style={{ fontWeight: 700, letterSpacing: "-0.01em", padding: "0.48rem 1.05rem", fontSize: "0.84rem" }}>
              Let&apos;s Talk
            </Link>

            {/* Desktop share occupies the old desktop hamburger position */}
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="navbar-icon-button hidden md:inline-flex"
              aria-label="Share this page"
              aria-haspopup="dialog"
              aria-expanded={shareOpen}
              title="Share this page"
            >
              <RiShareLine size={17} />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex md:hidden"
              style={{
                width: "1.9rem",
                height: "1.9rem",
                borderRadius: "0.5rem",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
              }}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <RiMenuFoldLine size={18} /> : <RiMenuUnfoldLine size={18} />}
            </button>
          </div>
        </div>
        </div>
        </div>
      </header>

      {shareOpen && (
        <div className="share-overlay" role="presentation" onMouseDown={() => setShareOpen(false)}>
          <section
            className="share-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="share-panel-handle" aria-hidden="true" />
            <div className="share-panel-header">
              <div>
                <p className="section-label">Spread the word</p>
                <h2 id="share-dialog-title">Share this page</h2>
              </div>
              <button type="button" className="navbar-icon-button" onClick={() => setShareOpen(false)} aria-label="Close share options">
                <RiCloseLine size={19} />
              </button>
            </div>

            <div className="share-social-grid">
              {shareOptions.map(({ label, icon: Icon, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="share-social-option">
                  <span><Icon size={22} /></span>
                  {label}
                </a>
              ))}
            </div>

            <div className="share-native-actions">
              <button type="button" className="btn btn-primary" onClick={openNativeShare}>
                <RiShareLine size={17} />
                More sharing options
              </button>
              <button type="button" className="btn btn-outline" onClick={copyPageLink}>
                {copied ? <RiCheckLine size={17} /> : <RiFileCopyLine size={17} />}
                {copied ? "Link copied" : "Copy link"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ── MOBILE BOTTOM SHEET ── */}
      {/* Backdrop */}
      <div
        aria-hidden={!isOpen}
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        className="md:hidden"
      />

      {/* Sheet */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="md:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--color-bg)",
          borderTop: "1px solid var(--color-border)",
          borderRadius: "1.25rem 1.25rem 0 0",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          maxHeight: "55dvh",
          overflowY: "auto",
          padding: "0 1rem 1.25rem",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "0.5rem 0 0.625rem" }}>
          <div style={{ width: "2rem", height: "3px", borderRadius: "2px", background: "var(--color-border)" }} />
        </div>

        {/* Nav links — compact grid for very small screens */}
        <nav aria-label="Mobile navigation">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.0625rem" }}>
            {navLinks.map((link, i) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.55rem 0.75rem",
                  borderRadius: 0,
                  fontSize: "0.875rem",
                  fontWeight: active ? 700 : 500,
                  textDecoration: "none",
                  transitionDelay: isOpen ? `${i * 30}ms` : "0ms",
                  color: active ? "var(--color-primary)" : "var(--color-text-2)",
                  background: "transparent",
                  borderLeft: active ? "2px solid var(--color-primary)" : "2px solid transparent",
                }}
              >
                {link.label}
              </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)", display: "grid", gap: "0.55rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-2)" }}>Appearance</span>
            <ThemeToggle />
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => { setIsOpen(false); setShareOpen(true); }}
            style={{ width: "100%", justifyContent: "center" }}
          >
            <RiShareLine size={16} /> Share this page
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {socialsFor(settings, "header").map((link) => {
              const Icon = socialIcon(link.platform);
              return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                data-tip={link.label}
                data-tip-place="below"
                className="footer-social-icon social-tip"
              >
                <Icon size={16} />
              </a>
              );
            })}
          </div>
        </div>
      </div>
      {showBottomBar ? <AnnouncementBar settings={settings} /> : null}
    </>
  );
}
