"use client";

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { RiArrowRightLine, RiMailLine, RiMapPinLine, RiPhoneLine } from "react-icons/ri";
import { defaultFooterQuote, footerNav } from "@/data/site-data";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { socialByPlatform, socialIcon, socialsFor } from "@/lib/socials";
import { setting } from "@/lib/hero";
import { submitSubscribe } from "@/lib/subscribe-client";
import type { SiteSettings } from "@/lib/supabase";

const navGroups = footerNav;

export const FOOTER_IMAGE_HEIGHTS = { compact: "12rem", regular: "16rem", tall: "22rem" } as const;

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
  /** When set, lock carousel to this slide (dashboard focus editing). */
  forceIndex,
}: {
  settings: Partial<SiteSettings>;
  isDark?: boolean;
  emptyHint?: boolean;
  flush?: boolean;
  showGrid?: boolean;
  forceIndex?: number | null;
}) {
  const items = mediaList(settings, isDark);
  const height = FOOTER_IMAGE_HEIGHTS[settings.footerCompanyHeight || "regular"];
  const focusList = settings.footerCompanyMediaFocus || [];
  const zoomGlobal = Math.min(200, Math.max(100, settings.footerCompanyZoom ?? 100));
  const whole = Boolean(settings.footerCompanyWholeImage);
  const mediaType = settings.footerCompanyMediaType || (items.length > 1 ? "carousel" : items[0] && isVideoUrl(items[0]) ? "video" : "image");
  const intervalMs = Math.max(3, settings.footerCompanyCarouselInterval || 5) * 1000;
  const [active, setActive] = useState(0);

  const showCopy = Boolean(settings.footerShowFeaturedCopy);
  const featuredTitle = settings.footerFeaturedTitle?.trim() || "";
  const featuredDetail = settings.footerFeaturedDetail?.trim() || "";
  const featuredEyebrow = settings.footerFeaturedEyebrow?.trim() || "Featured";
  const featuredCta = settings.footerFeaturedCtaLabel?.trim() || "Follow the journey";
  const hasOverlay = showCopy && Boolean(featuredTitle);

  useEffect(() => {
    if (typeof forceIndex === "number" && forceIndex >= 0) {
      setActive(Math.min(forceIndex, Math.max(0, items.length - 1)));
      return;
    }
    if (mediaType !== "carousel" || items.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [mediaType, items.length, intervalMs, forceIndex]);

  const shell = useMemo(
    () => ({
      display: "block" as const,
      width: "100%",
      overflow: "hidden" as const,
      background: "#0b192c",
      border: emptyHint && !items.length ? "1px dashed #cbd5e1" : "1px solid var(--color-border, #e2e8f0)",
      borderRadius: flush ? "1.15rem" : "1.15rem",
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

  const focusFor = (index: number) => {
    const slot = focusList[index];
    return {
      x: Math.min(100, Math.max(0, slot?.x ?? settings.footerCompanyPositionX ?? 50)),
      y: Math.min(100, Math.max(0, slot?.y ?? settings.footerCompanyPositionY ?? 40)),
      zoom: Math.min(200, Math.max(100, slot?.zoom ?? zoomGlobal)),
    };
  };

  const mediaStyle = (index: number): CSSProperties => {
    const focus = focusFor(index);
    return {
      position: "absolute",
      inset: 0,
      display: "block",
      width: "100%",
      height: "100%",
      maxHeight: whole ? "28rem" : undefined,
      objectFit: fit,
      objectPosition: `${focus.x}% ${focus.y}%`,
      transform: whole ? undefined : `scale(${focus.zoom / 100})`,
      transformOrigin: `${focus.x}% ${focus.y}%`,
      opacity: mediaType === "carousel" ? (index === active ? 1 : 0) : 1,
      transition: mediaType === "carousel" ? "opacity 0.7s ease" : undefined,
      pointerEvents: "none",
      userSelect: "none",
    } as CSSProperties;
  };

  const overlay = hasOverlay ? (
    <div className="footer-band-overlay" aria-hidden={showGrid}>
      <div className="footer-band-copy">
        <p className="footer-band-eyebrow">
          <span />
          {featuredEyebrow}
        </p>
        <p className="footer-band-title">{featuredTitle}</p>
        {featuredDetail ? <p className="footer-band-detail">{featuredDetail}</p> : null}
        <span className="footer-band-cta">
          {featuredCta} <RiArrowRightLine size={15} />
        </span>
      </div>
      {settings.footerShowLocation !== false && settings.location ? (
        <p className="footer-band-place">
          <RiMapPinLine size={14} /> {settings.location}
        </p>
      ) : null}
    </div>
  ) : null;

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
      {hasOverlay ? <div className="footer-band-shade" aria-hidden="true" /> : null}
      {overlay}
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
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={featuredTitle || "Featured media"} style={shell}>
      {inner}
    </a>
  );
}

function FooterSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      await submitSubscribe(email, "footer");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="footer-subscribe" onSubmit={handleSubmit} noValidate>
      <p className="footer-subscribe-label">Stay updated</p>
      {status === "success" ? (
        <p className="footer-subscribe-ok" role="status">
          You&apos;re on the list. Watch for a note at this address.
        </p>
      ) : (
        <>
          <div className="footer-subscribe-row">
            <label className="sr-only" htmlFor="footer-subscribe-email">
              Email address
            </label>
            <input
              id="footer-subscribe-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Your email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status === "error") setStatus("idle");
              }}
              required
              disabled={status === "loading"}
            />
            <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
              {status === "loading" ? "…" : "Join"}
            </button>
          </div>
          {status === "error" ? (
            <p className="footer-subscribe-error" role="alert">
              Could not subscribe. Try again.
            </p>
          ) : null}
        </>
      )}
    </form>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const settings = useSiteSettings();
  const [isDark, setIsDark] = useState(false);
  const socialLinks = socialsFor(settings, "footer").filter((link) => link.platform !== "buymeacoffee");
  const coffee = socialByPlatform(settings, "buymeacoffee");
  const location = setting(settings, "location");
  const email = setting(settings, "contactEmail");
  const phone = settings.phoneNumber?.trim() || "";
  const quote = settings.footerQuote?.trim() || defaultFooterQuote.text;
  const quoteBy =
    settings.footerQuoteAttribution?.trim() || defaultFooterQuote.attribution || setting(settings, "siteTitle");
  const showBio = settings.footerShowBio !== false;
  const showEmail = settings.footerShowEmail !== false;
  const showPhone = settings.footerShowPhone !== false && Boolean(phone);
  const showLocation = settings.footerShowLocation !== false && Boolean(location);
  const showQuote = settings.footerShowQuote !== false && Boolean(quote);
  const showPrivacy = settings.footerShowPrivacy !== false;
  const showSitemap = settings.footerShowSitemap !== false;

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <footer role="contentinfo" className="site-footer">
      <div className="container site-footer-top">
          <div className={`site-footer-grid${showQuote ? " has-quote" : ""}`}>
            <div className="site-footer-brand">
              <Link href="/" className="site-footer-logo" aria-label="Home">
                <img
                  src="/brand/logos/logo-horizontal-blue.png"
                  alt={setting(settings, "siteTitle")}
                  className="footer-logo-dark"
                />
                <img
                  src="/brand/logos/logo-horizontal-light.png"
                  alt={setting(settings, "siteTitle")}
                  className="footer-logo-light"
                />
              </Link>

              {showBio ? (
                <p className="site-footer-bio">{settings.bio || setting(settings, "bio")}</p>
              ) : null}

              {(showEmail || showPhone || showLocation) ? (
                <ul className="site-footer-contact">
                  {showEmail ? (
                    <li>
                      <RiMailLine size={15} aria-hidden="true" />
                      <a href={`mailto:${email}`}>{email}</a>
                    </li>
                  ) : null}
                  {showPhone ? (
                    <li>
                      <RiPhoneLine size={15} aria-hidden="true" />
                      <span>{phone}</span>
                    </li>
                  ) : null}
                  {showLocation ? (
                    <li>
                      <RiMapPinLine size={15} aria-hidden="true" />
                      <span>{location}</span>
                    </li>
                  ) : null}
                </ul>
              ) : null}

              {socialLinks.length ? (
                <div className="site-footer-socials" aria-label="Social media links">
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
              ) : null}
            </div>

            <div className="site-footer-nav">
              {navGroups.map((group) => (
                <div key={group.label} className="footer-nav-group">
                  <h3>{group.label}</h3>
                  <ul role="list">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="footer-nav-link">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <FooterSubscribe />
                </div>
              ))}
            </div>

            {showQuote ? (
              <div className="site-footer-quote">
                <span className="site-footer-quote-rule" aria-hidden="true" />
                <p>{quote}</p>
                <cite>— {quoteBy}</cite>
              </div>
            ) : null}
          </div>
      </div>

      <div className="container site-footer-band">
        <FooterCompanyBand settings={settings} isDark={isDark} flush />
      </div>

      <div className="container site-footer-legal-wrap">
        <div className="footer-legal">
          <p>
            © {year}{" "}
            <Link href="/">{setting(settings, "siteTitle")}</Link>
            . All rights reserved.
          </p>
          <div className="footer-legal-actions">
            {(showPrivacy || showSitemap) ? (
              <span className="footer-legal-links">
                {showPrivacy ? (
                  <Link href="/contact">Privacy</Link>
                ) : null}
                {showPrivacy && showSitemap ? <span aria-hidden="true">·</span> : null}
                {showSitemap ? <Link href="/sitemap.xml">Sitemap</Link> : null}
              </span>
            ) : null}
            {coffee ? (
              <>
                {(showPrivacy || showSitemap) ? <span className="footer-legal-divider" aria-hidden="true" /> : null}
                <a
                  href={coffee.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-coffee"
                >
                  ☕ Buy me a coffee
                </a>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
