"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  RiMenuLine,
  RiCloseLine,
  RiGithubFill,
  RiLinkedinFill,
  RiTwitterXFill,
  RiWhatsappLine,
  RiInstagramLine,
  RiMore2Line,
} from "react-icons/ri";
import { siteConfig } from "@/data/site-data";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { getLocalSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/supabase";

const navLinks = [
  { href: "/",         label: "Home" },
  { href: "/about",    label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog",     label: "Blog" },
  { href: "/services", label: "Services" },
  { href: "/speaking", label: "Speaking" },
  { href: "/contact",  label: "Contact" },
];

const allSocials = [
  { href: siteConfig.social.whatsapp,     label: "WhatsApp",        icon: RiWhatsappLine },
  { href: siteConfig.social.linkedin,     label: "LinkedIn",        icon: RiLinkedinFill },
  { href: siteConfig.social.instagram,    label: "Instagram",       icon: RiInstagramLine },
  { href: siteConfig.social.github,       label: "GitHub",          icon: RiGithubFill },
  { href: siteConfig.social.twitter,      label: "X / Twitter",     icon: RiTwitterXFill },
];

export default function Navbar() {
  const pathname   = usePathname();
  const [isOpen,    setIsOpen]    = useState(false);
  const [isScrolled,setIsScrolled]= useState(false);
  const [isDark,    setIsDark]    = useState(false);
  const [moreOpen,  setMoreOpen]  = useState(false);
  const [settings,  setSettings]  = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getLocalSettings());
    const onUpdate = (e: CustomEvent<SiteSettings>) => {
      if (e.detail) setSettings(e.detail);
    };
    window.addEventListener("site-settings-changed" as any, onUpdate);
    return () => window.removeEventListener("site-settings-changed" as any, onUpdate);
  }, []);

  const limit = settings.headerSocialLimit || 3;
  const primarySocials = allSocials.slice(0, limit);
  const overflowSocials = allSocials.slice(limit);

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

  useEffect(() => { setIsOpen(false); setMoreOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const logoSrc = isDark
    ? "/brand/logos/logo-horizontal-light.png"
    : "/brand/logos/logo-horizontal-dark.png";

  return (
    <>
      {/* ── TOP BAR ── */}
      <header
        role="banner"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          transition: "all 0.3s ease",
          padding: isScrolled ? "0.625rem 0" : "1rem 0",
          background: isScrolled ? "var(--nav-bg)" : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(20px)" : "none",
          borderBottom: isScrolled ? "1px solid var(--nav-border)" : "none",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>

          {/* Logo — horizontal, theme-aware, no text */}
          <Link href="/" aria-label="Prince Parfait GANZA — Home" style={{ display: "flex", flexShrink: 0 }}>
            <div style={{ position: "relative", width: "9rem", height: "2.5rem" }}>
              <Image
                src={logoSrc}
                alt="Prince Parfait GANZA"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex" style={{ flex: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.125rem" }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  style={{
                    padding: "0.5rem 0.875rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    color: pathname === link.href ? "var(--color-primary)" : "var(--color-text-2)",
                    background: pathname === link.href ? "rgba(14,82,168,0.07)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>

            {/* 3 primary social links + "more" — desktop only */}
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: "0.25rem", position: "relative" }}>
              {primarySocials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "0.5rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-2)",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  className="nav-social-icon"
                >
                  <Icon size={17} />
                </a>
              ))}

              {/* More dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  aria-label="More social links"
                  aria-expanded={moreOpen}
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "0.5rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-2)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  className="nav-social-icon"
                >
                  <RiMore2Line size={17} />
                </button>

                {moreOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.5rem)",
                      right: 0,
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.75rem",
                      padding: "0.5rem",
                      boxShadow: "var(--shadow-lg)",
                      minWidth: "10rem",
                      zIndex: 100,
                    }}
                    role="menu"
                  >
                    {[
                      { href: siteConfig.social.github,       label: "GitHub" },
                      { href: siteConfig.social.twitter,      label: "X / Twitter" },
                      { href: siteConfig.social.youtube,      label: "YouTube" },
                      { href: siteConfig.social.tiktok,       label: "TikTok" },
                      { href: siteConfig.social.threads,      label: "Threads" },
                      { href: siteConfig.social.luma,         label: "Luma Events" },
                      { href: siteConfig.social.buymeacoffee, label: "Buy Me a Coffee" },
                    ].map(({ href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        style={{
                          display: "block",
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.8125rem",
                          color: "var(--color-text-2)",
                          textDecoration: "none",
                          borderRadius: "0.5rem",
                          transition: "all 0.15s ease",
                          whiteSpace: "nowrap",
                        }}
                        className="nav-more-item"
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block" style={{ width: "1px", height: "1.25rem", background: "var(--color-border)" }} />

            {/* Theme toggle */}
            <ThemeToggle />

            {/* CTA */}
            <Link href="/contact" className="btn btn-primary btn-sm hidden sm:inline-flex">
              Let&apos;s Talk
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden"
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "0.5rem",
                display: "inline-flex",
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
              {isOpen ? <RiCloseLine size={20} /> : <RiMenuLine size={20} />}
            </button>
          </div>
        </div>
      </header>

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
          borderRadius: "1.5rem 1.5rem 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "0 1.25rem 2rem",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "0.75rem 0 1.25rem" }}>
          <div style={{ width: "2.5rem", height: "4px", borderRadius: "2px", background: "var(--color-border)" }} />
        </div>

        {/* Nav links */}
        <nav aria-label="Mobile navigation">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.875rem 1rem",
                  borderRadius: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  transitionDelay: isOpen ? `${i * 30}ms` : "0ms",
                  color: pathname === link.href ? "var(--color-primary)" : "var(--color-text-2)",
                  background: pathname === link.href ? "rgba(14,82,168,0.07)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Bottom actions */}
        <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)" }}>
          <Link href="/contact" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: "1rem" }}>
            Let&apos;s Talk
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {[
              { href: siteConfig.social.whatsapp,  label: "WhatsApp",  icon: RiWhatsappLine },
              { href: siteConfig.social.linkedin,   label: "LinkedIn",  icon: RiLinkedinFill },
              { href: siteConfig.social.instagram,  label: "Instagram", icon: RiInstagramLine },
              { href: siteConfig.social.twitter,    label: "X",         icon: RiTwitterXFill },
              { href: siteConfig.social.github,     label: "GitHub",    icon: RiGithubFill },
            ].map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="footer-social-icon"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Close "more" dropdown when clicking outside */}
      {moreOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 45 }}
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
