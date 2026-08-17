"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RiGithubFill,
  RiLinkedinFill,
  RiTwitterXFill,
  RiYoutubeFill,
  RiInstagramFill,
  RiTiktokFill,
  RiWhatsappLine,
  RiCupLine,
  RiThreadsLine,
  RiArrowRightLine
} from "react-icons/ri";
import { siteConfig } from "@/data/site-data";
import BackToTop from "@/components/ui/BackToTop";
import { getLocalSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/supabase";

const navGroups = [
  {
    label: "Pages",
    links: [
      { label: "Home",     href: "/" },
      { label: "About",    href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "Blog",     href: "/blog" },
    ],
  },
  {
    label: "Work with me",
    links: [
      { label: "Services", href: "/services" },
      { label: "Speaking", href: "/speaking" },
      { label: "Contact",  href: "/contact" },
    ],
  },
];

const socialLinks = [
  { href: siteConfig.social.github,       label: "GitHub",          icon: RiGithubFill },
  { href: siteConfig.social.linkedin,     label: "LinkedIn",        icon: RiLinkedinFill },
  { href: siteConfig.social.twitter,      label: "X / Twitter",     icon: RiTwitterXFill },
  { href: siteConfig.social.youtube,      label: "YouTube",         icon: RiYoutubeFill },
  { href: siteConfig.social.instagram,    label: "Instagram",       icon: RiInstagramFill },
  { href: siteConfig.social.tiktok,       label: "TikTok",          icon: RiTiktokFill },
  { href: siteConfig.social.whatsapp,     label: "WhatsApp",        icon: RiWhatsappLine },
  { href: siteConfig.social.threads,      label: "Threads",         icon: RiThreadsLine },
  { href: siteConfig.social.buymeacoffee, label: "Buy Me a Coffee", icon: RiCupLine },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getLocalSettings());
    const handleSettingsChange = (e: any) => {
      setSettings(e.detail);
    };
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("site-settings-changed", handleSettingsChange);
  }, []);

  return (
    <>
      <footer
        role="contentinfo"
        style={{
          background: "var(--color-bg-2)",
          borderTop: "1px solid var(--color-border)",
          position: "relative",
        }}
      >
        {/* Top accent */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "20rem",
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
            opacity: 0.5,
          }}
        />

        <div className="container" style={{ padding: "4rem 1.5rem 2rem" }}>
          {/* Main Top Flex */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "3rem",
            justifyContent: "space-between",
            marginBottom: "3rem"
          }}>
            {/* First Section: Brand */}
            <div style={{ flex: "1 1 300px", maxWidth: "28rem" }}>
              <Link
                href="/"
                style={{ display: "inline-flex", alignItems: "center", marginBottom: "1.25rem", textDecoration: "none" }}
                aria-label="Home"
              >
                <div style={{ position: "relative", width: "11rem", height: "2.75rem" }}>
                  <img
                    src="/brand/logos/logo-horizontal-blue.png"
                    alt={settings.siteTitle}
                    className="footer-logo-dark"
                    style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left" }}
                  />
                  <img
                    src="/brand/logos/logo-horizontal-light.png"
                    alt={settings.siteTitle}
                    className="footer-logo-light"
                    style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left", display: "none" }}
                  />
                </div>
              </Link>

              <p style={{
                fontSize: "0.875rem",
                color: "var(--color-text-2)",
                lineHeight: 1.75,
                marginBottom: "2rem",
              }}>
                {settings.bio}
              </p>

              {/* Social icons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }} aria-label="Social media links">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="footer-social-icon"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Second & Third Sections: Nav groups */}
            <div style={{ display: "flex", gap: "4rem", flexWrap: "wrap", flex: "1 1 auto", justifyContent: "flex-end" }} className="md:justify-start">
              {navGroups.map((group) => (
                <div key={group.label} style={{ minWidth: "8rem" }}>
                  <h3 style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    marginBottom: "1.25rem",
                    letterSpacing: "-0.01em",
                  }}>
                    {group.label}
                  </h3>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }} role="list">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="footer-nav-link"
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--color-text-2)",
                            textDecoration: "none",
                            transition: "color 0.15s ease",
                            display: "inline-block",
                          }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Middle Section */}
          <div style={{
            position: "relative",
            width: "100%",
            borderRadius: "1rem",
            overflow: "hidden",
            background: "linear-gradient(135deg, #0e52a8 0%, #050816 100%)",
            marginBottom: "3rem",
            boxShadow: "0 10px 30px -10px rgba(14,82,168,0.3)"
          }}>
            <div style={{ 
              display: "flex", 
              flexDirection: "column",
              gap: "2rem",
              padding: "2rem"
            }} className="md:flex-row md:items-center md:justify-between md:padding-3rem">
              
              <div style={{ flex: 1, zIndex: 10, maxWidth: "26rem", textAlign: "left" }}>
                <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", background: "rgba(255,255,255,0.1)", color: "#ffffff", borderRadius: "1rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1rem" }}>
                  Featured Insight
                </span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", marginBottom: "1.25rem", lineHeight: 1.2 }}>
                  Building Scalable AI Solutions
                </h3>
                <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#ffffff", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", padding: "0.625rem 1.25rem", background: "var(--color-primary)", borderRadius: "0.5rem", transition: "transform 0.2s ease" }} className="hover:scale-105">
                  Read Article <RiArrowRightLine />
                </Link>
              </div>

              {/* Big Image right side / background */}
              <div style={{ flex: 1, position: "relative", minHeight: "12rem", borderRadius: "0.75rem", overflow: "hidden" }} className="md:min-height-[16rem]">
                <img 
                  src="/images/blog/blog-placeholder.png" 
                  alt="Featured Article Foreground" 
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.75rem", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }} 
                  className="scale-95 origin-right hover:scale-100 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", fontWeight: 500 }}>
              © {year}{" "}
              <Link href="/" style={{ color: "var(--color-text)", textDecoration: "none", fontWeight: 700 }}>
                {settings.siteTitle}
              </Link>
              . All rights reserved.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <Link href="/contact" style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textDecoration: "none", fontWeight: 500 }} className="hover:text-primary">
                Privacy
              </Link>
              <a
                href={siteConfig.social.buymeacoffee}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--color-text)", textDecoration: "none", fontWeight: 600, padding: "0.375rem 0.75rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "2rem" }}
                className="hover:border-primary transition-colors"
              >
                ☕ Buy me a coffee
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating back-to-top button */}
      <BackToTop />
    </>
  );
}
