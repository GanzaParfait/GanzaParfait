"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { footerNav } from "@/data/site-data";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { socialByPlatform, socialIcon, socialsFor } from "@/lib/socials";
import { setting } from "@/lib/hero";
import type { SiteSettings } from "@/lib/supabase";

const navGroups = footerNav;

export const FOOTER_IMAGE_HEIGHTS = { compact: "10rem", regular: "14rem", tall: "20rem" } as const;

export function footerCompanySrc(settings: { footerCompanyImage?: string; footerCompanyImageDark?: string }, isDark: boolean) {
  const src = isDark
    ? (settings.footerCompanyImageDark || settings.footerCompanyImage)
    : settings.footerCompanyImage;
  if (!src || src.startsWith("blob:")) return "";
  return src;
}

function mediaList(settings: Partial<SiteSettings>, isDark: boolean) {
  const listed = (settings.footerCompanyMedia || []).filter((url) => url && !url.startsWith("blob:"));
  if (listed.length) return listed.slice(0, 3);
  const single = footerCompanySrc(settings, isDark);
  return single ? [single] : [];
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes("/video");
}

export function FooterCompanyBand({
  settings,
  isDark = false,
  emptyHint = false,
  flush = false,
  showGrid = false,
}: {
  settings: Partial<SiteSettings>;
  isDark?: boolean;
  emptyHint?: boolean;
  flush?: boolean;
  showGrid?: boolean;
}) {
  const items = mediaList(settings, isDark);
  const height = FOOTER_IMAGE_HEIGHTS[settings.footerCompanyHeight || "regular"];
  const posX = Math.min(100, Math.max(0, settings.footerCompanyPositionX ?? 50));
  const posY = Math.min(100, Math.max(0, settings.footerCompanyPositionY ?? 40));
  // Cover-based zoom: 100% fills the frame; above 100% crops in. Never scale below 1
  // or the image shrinks inside the band and leaves empty borders.
  const zoom = Math.min(200, Math.max(100, settings.footerCompanyZoom ?? 100));
  const whole = Boolean(settings.footerCompanyWholeImage);
  const mediaType = settings.footerCompanyMediaType || (items.length > 1 ? "carousel" : items[0] && isVideoUrl(items[0]) ? "video" : "image");
  const intervalMs = Math.max(3, settings.footerCompanyCarouselInterval || 5) * 1000;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (mediaType !== "carousel" || items.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [mediaType, items.length, intervalMs]);

  const shell = useMemo(
    () => ({
      display: "block" as const,
      width: "100%",
      overflow: "hidden" as const,
      background: "#0b192c",
      border: emptyHint && !items.length ? "1px dashed #cbd5e1" : "1px solid var(--color-border, #e2e8f0)",
      borderRadius: flush ? 0 : "1rem",
      marginBottom: flush ? 0 : "1.25rem",
      position: "relative" as const,
    }),
    [emptyHint, items.length, flush],
  );

  if (!items.length) {
    if (!emptyHint) return null;
    return (
      <div style={{ ...shell, height, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, background: "#fff" }}>
        Add up to 3 images or one video for this band
      </div>
    );
  }

  const href = settings.footerCompanyHref || "https://lerony.com";
  const fit = whole ? "contain" : settings.footerCompanyFit || "cover";
  const frameHeight = whole ? "auto" : height;

  const mediaStyle = (index: number): CSSProperties => ({
    position: mediaType === "carousel" ? "absolute" : "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
    maxHeight: whole ? "28rem" : undefined,
    objectFit: fit,
    objectPosition: `${posX}% ${posY}%`,
    transform: whole ? undefined : `scale(${zoom / 100})`,
    transformOrigin: `${posX}% ${posY}%`,
    opacity: mediaType === "carousel" ? (index === active ? 1 : 0) : 1,
    transition: mediaType === "carousel" ? "opacity 0.7s ease" : undefined,
    pointerEvents: "none",
    userSelect: "none",
  } as CSSProperties);

  const inner = (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: frameHeight,
        minHeight: whole ? undefined : height,
        background: "#0b192c",
        overflow: "hidden",
      }}
    >
      {items.map((src, index) =>
        mediaType === "video" || isVideoUrl(src) ? (
          <video
            key={src}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            draggable={false}
            style={mediaStyle(index)}
          />
        ) : (
          <img
            key={src}
            src={src}
            alt=""
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            style={mediaStyle(index)}
          />
        ),
      )}
      {showGrid ? (
        <div
          aria-hidden="true"
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.22) 1px, transparent 1px)",
            backgroundSize: "12.5% 12.5%",
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,.55)",
            zIndex: 2,
          }}
        />
      ) : null}
    </div>
  );

  if (showGrid) {
    return <div style={shell}>{inner}</div>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Featured media" style={shell}>
      {inner}
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const settings = useSiteSettings();
  const [isDark, setIsDark] = useState(false);
  const socialLinks = socialsFor(settings, "footer").filter((link) => link.platform !== "buymeacoffee");
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

        <div className="container" style={{ padding: "3rem 1.5rem 0" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2.25rem",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
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

              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-2)",
                  lineHeight: 1.75,
                  marginBottom: "1rem",
                }}
              >
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
                      data-tip={link.label}
                      className="footer-social-icon social-tip"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="footer-nav-groups" style={{ display: "flex", gap: "4rem", flexWrap: "wrap", flex: "1 1 auto", justifyContent: "flex-end" }}>
              {navGroups.map((group) => (
                <div key={group.label} className="footer-nav-group" style={{ minWidth: "8rem" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "var(--color-text)",
                      marginBottom: "1.25rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
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

        <div className="footer-media-band" style={{ width: "100%", padding: "0 0 1rem" }}>
          <FooterCompanyBand settings={settings} isDark={isDark} flush />
        </div>

        <div className="container" style={{ padding: "0 1.5rem 1.5rem" }}>
          <div
            className="footer-legal"
            style={{
              paddingTop: "1.15rem",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", fontWeight: 500 }}>
              © {year}{" "}
              <Link href="/" style={{ color: "var(--color-text)", textDecoration: "none", fontWeight: 700 }}>
                {setting(settings, "siteTitle")}
              </Link>
              . All rights reserved.
            </p>
            <div className="footer-legal-actions" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <Link href="/contact" style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textDecoration: "none", fontWeight: 500 }}>
                Privacy
              </Link>
              {coffee ? (
                <a
                  href={coffee.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-coffee"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.75rem",
                    color: "var(--color-text)",
                    textDecoration: "none",
                    fontWeight: 600,
                    padding: "0.375rem 0.75rem",
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "2rem",
                  }}
                >
                  ☕ Buy me a coffee
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
