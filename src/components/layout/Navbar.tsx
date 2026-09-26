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
  RiSearchLine,
  RiLink,
  RiArrowRightSLine,
} from "react-icons/ri";
import { siteConfig, primaryNav } from "@/data/site-data";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { socialIcon, socialsFor } from "@/lib/socials";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import { openSiteSearch } from "@/components/ui/CommandPalette";
import LetsTalkChooser from "@/components/ui/LetsTalkChooser";
import { CANONICAL_NAME } from "@/lib/identity";

const navLinks = primaryNav;

function shareDisplayUrl(href: string) {
  try {
    const url = new URL(href);
    return `${url.host.replace(/^www\./, "")}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return href;
  }
}

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
  useHistoryBackClose(isOpen, () => setIsOpen(false));
  useHistoryBackClose(shareOpen, () => setShareOpen(false));

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
    const header = headerRef.current;
    if (!header) return;

    const applyOffset = () => {
      const nav = header.querySelector<HTMLElement>("[data-public-nav]");
      // Only top bars push content; bottom bars are fixed and must not inflate hero padding.
      const bar = header.querySelector<HTMLElement>(".announcement-bar.is-top");
      const navHeight = Math.ceil((nav || header).getBoundingClientRect().height);
      const barHeight = bar ? Math.ceil(bar.getBoundingClientRect().height) : 0;
      const chrome = navHeight + barHeight;
      const px = Math.max(chrome, isPill ? 60 : 52);
      document.documentElement.style.setProperty("--public-nav-offset", `${px}px`);
      document.documentElement.style.setProperty("--announcement-bar-height", `${barHeight}px`);
    };

    applyOffset();
    const observer = new ResizeObserver(applyOffset);
    observer.observe(header);
    window.addEventListener("resize", applyOffset);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", applyOffset);
    };
  }, [isPill, settings.announcementIsActive, settings.announcementText, settings.announcementHeadline, settings.announcementBarPosition]);

  const barText =
    settings.announcementText?.trim() ||
    settings.announcementHeadline?.trim() ||
    settings.announcementEyebrow?.trim() ||
    "";
  const barPosition = settings.announcementBarPosition === "bottom" ? "bottom" : "top";
  const showTopBar = Boolean(settings.announcementIsActive && barText && barPosition === "top");
  const showBottomBar = Boolean(settings.announcementIsActive && barText && barPosition === "bottom");

  const logoSrc = isDark
    ? "/brand/logos/logo-horizontal-light.webp"
    : "/brand/logos/logo-horizontal-blue.webp";

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
      { label: "WhatsApp", icon: RiWhatsappLine, href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, brand: "whatsapp" as const },
      { label: "LinkedIn", icon: RiLinkedinFill, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, brand: "linkedin" as const },
      { label: "X", icon: RiTwitterXFill, href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, brand: "x" as const },
      { label: "Facebook", icon: RiFacebookFill, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, brand: "facebook" as const },
    ];
  })();

  const sharePageUrl = shareOpen && typeof window !== "undefined" ? getShareDetails().url : "";
  const sharePageDisplay = sharePageUrl ? shareDisplayUrl(sharePageUrl) : "";
  const shareNameParts = CANONICAL_NAME.split(" ");
  const shareNameLast = shareNameParts[shareNameParts.length - 1] || "GANZA";
  const shareNameFirst = shareNameParts.slice(0, -1).join(" ");

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
        <div data-public-nav style={{ padding: isPill ? "0.45rem max(0.65rem, env(safe-area-inset-left, 0px)) 0 max(0.65rem, env(safe-area-inset-right, 0px))" : 0, maxWidth: "100%", boxSizing: "border-box" }}>
        <div
          style={{
            background: pillBg,
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            border: isPill ? `1px solid ${pillBorder}` : "none",
            borderBottom: isPill ? "none" : `1px solid ${pillBorder}`,
            borderRadius: isPill ? "9999px" : 0,
            boxShadow: pillShadow,
            maxWidth: isPill ? "min(92rem, 100%)" : undefined,
            margin: isPill ? "0 auto" : undefined,
            transition: "box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease, border-radius 0.3s ease",
            boxSizing: "border-box",
            width: isPill ? "100%" : undefined,
          }}
        >
          <div
            className={isPill ? undefined : "container"}
          style={{
            minHeight: isPill ? "3.55rem" : "3.75rem",
            padding: isPill ? "0.35rem 0.85rem" : "0.45rem 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            width: "100%",
            maxWidth: isPill ? "none" : undefined,
            minWidth: 0,
            overflow: "hidden",
          }}
        >

          {/* Logo is the home link. There is no Home item in the nav. */}
          <Link
            href="/"
            aria-label="Prince Parfait GANZA — Home"
            className="home-logo"
            data-home-cue={pathname !== "/" && homeCue ? "true" : undefined}
            style={{ display: "flex", flexShrink: 1, minWidth: 0 }}
          >
            <div style={{ position: "relative", width: "clamp(6.75rem, 34vw, 10.75rem)", height: "2.3rem", maxWidth: "100%" }}>
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
            className="hidden lg:flex"
            style={{ flex: 1, justifyContent: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive ? "nav-link is-active" : "nav-link"}
                  style={{
                    padding: "0.45rem 0.35rem",
                    borderRadius: 0,
                    fontSize: "0.875rem",
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, minWidth: 0 }}>

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

            <LetsTalkChooser />

            {settings.siteSearch?.enabled !== false ? (
              <button
                type="button"
                onClick={() => openSiteSearch()}
                className="navbar-icon-button nav-search-btn"
                aria-label="Search this site"
                aria-haspopup="dialog"
                title="Search (⌘K / Ctrl+K)"
              >
                <RiSearchLine size={17} />
                <kbd className="nav-search-kbd" aria-hidden="true">
                  ⌘K
                </kbd>
              </button>
            ) : null}

            {/* Desktop only — mobile share lives in the bottom sheet */}
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="navbar-icon-button nav-share-desktop"
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
              className="inline-flex lg:hidden"
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

            <div className="share-panel-top">
              <p className="share-panel-kicker">
                <RiLink size={14} aria-hidden />
                Share page
              </p>
              <button
                type="button"
                className="share-panel-close"
                onClick={() => setShareOpen(false)}
                aria-label="Close share options"
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            <div className="share-panel-intro">
              <h2 id="share-dialog-title">
                Share {shareNameFirst} <span>{shareNameLast}</span>
              </h2>
              <p>Send this page to someone or copy the link.</p>
            </div>

            <div className="share-social-grid">
              {shareOptions.map(({ label, icon: Icon, href, brand }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`share-social-option is-${brand}`}
                >
                  <span>
                    <Icon size={22} />
                  </span>
                  {label}
                </a>
              ))}
            </div>

            <div className="share-copy-row">
              <div className="share-copy-url" title={sharePageUrl}>
                <RiLink size={15} aria-hidden />
                <span>{sharePageDisplay}</span>
              </div>
              <button type="button" className="share-copy-btn" onClick={copyPageLink}>
                {copied ? <RiCheckLine size={16} /> : <RiFileCopyLine size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <button type="button" className="share-more-bar" onClick={openNativeShare}>
              <RiShareLine size={16} aria-hidden />
              <span>More sharing options</span>
              <RiArrowRightSLine size={18} aria-hidden />
            </button>
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
        className="lg:hidden"
      />

      {/* Sheet */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="lg:hidden"
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
