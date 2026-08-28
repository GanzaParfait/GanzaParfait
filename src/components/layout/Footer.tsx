"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { footerNav } from "@/data/site-data";
import BackToTop from "@/components/ui/BackToTop";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { socialByPlatform, socialIcon, socialsFor } from "@/lib/socials";
import { setting } from "@/lib/hero";

const navGroups = footerNav;

export const FOOTER_IMAGE_HEIGHTS = { compact: "10rem", regular: "16rem", tall: "22rem" } as const;

export function footerCompanySrc(settings: { footerCompanyImage?: string; footerCompanyImageDark?: string }, isDark: boolean) {
  const src = isDark
    ? (settings.footerCompanyImageDark || settings.footerCompanyImage)
    : settings.footerCompanyImage;
  if (!src || src.startsWith("blob:")) return "";
  return src;
}

export function FooterCompanyBand({
  settings,
  isDark = false,
  emptyHint = false,
  flush = false,
}: {
  settings: Parameters<typeof footerCompanySrc>[0] & {
    footerCompanyHref?: string;
    footerCompanyFit?: "contain" | "cover";
    footerCompanyHeight?: "compact" | "regular" | "tall";
  };
  isDark?: boolean;
  emptyHint?: boolean;
  flush?: boolean;
}) {
  const src = footerCompanySrc(settings, isDark);
  const height = FOOTER_IMAGE_HEIGHTS[settings.footerCompanyHeight || "regular"];
  const shell = {
    display: "block" as const,
    width: "100%",
    overflow: "hidden" as const,
    background: "#ffffff",
    border: emptyHint && !src ? "1px dashed #cbd5e1" : "1px solid var(--color-border, #e2e8f0)",
    borderRadius: flush ? 0 : "1rem",
    marginBottom: flush ? 0 : "2.5rem",
  };

  if (!src) {
    if (!emptyHint) return null;
    return (
      <div style={{ ...shell, height, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600 }}>
        Add a public image URL to fill this band
      </div>
    );
  }

  return (
    <a
      href={settings.footerCompanyHref || "https://lerony.com"}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LERONY Ltd"
      style={shell}
    >
      <img
        src={src}
        alt="LERONY Ltd"
        style={{
          display: "block",
          width: "100%",
          height,
          objectFit: settings.footerCompanyFit || "cover",
          objectPosition: "center",
        }}
      />
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const settings = useSiteSettings();
  const [isDark, setIsDark] = useState(false);
  const socialLinks = socialsFor(settings, "footer");
  const coffee = socialByPlatform(settings, "buymeacoffee");

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
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

        <div className="container" style={{ padding: "4rem 1.5rem 0" }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "3rem",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
          }}>
            <div style={{ flex: "1 1 300px", maxWidth: "28rem" }}>
              <Link
                href="/"
                style={{ display: "inline-flex", alignItems: "center", marginBottom: "1.25rem", textDecoration: "none" }}
                aria-label="Home"
              >
                <div style={{ position: "relative", width: "11rem", height: "2.75rem" }}>
                  <img
                    src="/brand/logos/logo-horizontal-blue.png"
                    alt={setting(settings, "siteTitle")}
                    className="footer-logo-dark"
                    style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left" }}
                  />
                  <img
                    src="/brand/logos/logo-horizontal-light.png"
                    alt={setting(settings, "siteTitle")}
                    className="footer-logo-light"
                    style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left", display: "none" }}
                  />
                </div>
              </Link>

              <p style={{
                fontSize: "0.875rem",
                color: "var(--color-text-2)",
                lineHeight: 1.75,
                marginBottom: "1rem",
              }}>
                {settings.bio || setting(settings, "bio")}
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-3)", marginBottom: "1.5rem" }}>
                <a href={`mailto:${setting(settings, "contactEmail")}`} style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
                  {setting(settings, "contactEmail")}
                </a>
                {settings.phoneNumber ? <> · {settings.phoneNumber}</> : null}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }} aria-label="Social media links">
                {socialLinks.map((link) => {
                  const Icon = socialIcon(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      title={link.label}
                      className="footer-social-icon"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>

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

        </div>

        <div style={{ width: "100%", padding: "0 0 2.25rem" }}>
          <FooterCompanyBand settings={settings} isDark={isDark} flush />
        </div>

        <div className="container" style={{ padding: "0 1.5rem 2rem" }}>
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
                {setting(settings, "siteTitle")}
              </Link>
              . All rights reserved.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <Link href="/contact" style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textDecoration: "none", fontWeight: 500 }} className="hover:text-primary">
                Privacy
              </Link>
              {coffee ? (
                <a
                  href={coffee.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--color-text)", textDecoration: "none", fontWeight: 600, padding: "0.375rem 0.75rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "2rem" }}
                  className="hover:border-primary transition-colors"
                >
                  ☕ Buy me a coffee
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
    </>
  );
}
