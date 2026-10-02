"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import ResilientCover from "@/components/work/ResilientCover";
import {
  RiArrowRightLine,
  RiMapPinLine,
  RiArrowDownLine,
} from "react-icons/ri";
import { useState, useEffect, useRef } from "react";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import { useSheetDrag } from "@/hooks/useSheetDrag";
import { SiteSettings } from "@/lib/supabase";
import { heroHighlights, heroImageFor, heroPortraitAlt, heroRoles, setting, splitDisplayName } from "@/lib/hero";
import { socialIcon, heroSocialsFor } from "@/lib/socials";

export default function SplitHero({
  settings,
  isPreview = false,
}: {
  settings: SiteSettings;
  isPreview?: boolean;
}) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const moreSheetRef = useRef<HTMLDivElement>(null);
  useHistoryBackClose(isMoreOpen && !isPreview, () => setIsMoreOpen(false));
  useSheetDrag(isMoreOpen && !isPreview, () => setIsMoreOpen(false), moreSheetRef, { maxWidth: 1023, variable: true });
  const roles = heroRoles(settings);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const displayName = splitDisplayName(setting(settings, "siteTitle"));
  const greeting = setting(settings, "heroGreeting");
  const availableText = String(settings.heroAvailableText ?? "").trim();
  const locationText = String(settings.location ?? "").trim();
  const primaryCtaLabel = setting(settings, "heroPrimaryCtaLabel");
  const primaryCtaHref = setting(settings, "heroPrimaryCtaHref");
  const secondaryCtaLabel = setting(settings, "heroSecondaryCtaLabel");
  const secondaryCtaHref = setting(settings, "heroSecondaryCtaHref");
  const splitImage = heroImageFor(settings, "split_portrait");
  const primarySocials = heroSocialsFor(settings);
  const highlights = heroHighlights(settings).slice(0, 2);
  const portraitAnimate = settings.heroSplitPortraitAnimate !== false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if (isPreview) return;
    document.body.classList.toggle("hero-more-open", isMoreOpen);
    return () => document.body.classList.remove("hero-more-open");
  }, [isMoreOpen, isPreview]);

  useEffect(() => {
    if (roles.length <= 1) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const interval = window.setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [roles.length]);

  const delay = (ms: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.7s ease ${ms}ms, transform 0.7s ease ${ms}ms`,
  });

  return (
    <section
      className={isPreview ? "relative overflow-hidden hero-layout-preview hero-split" : "relative overflow-hidden hero-split"}
      aria-label="Hero Section"
      style={isPreview ? {
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "var(--color-bg)",
        paddingTop: "3rem",
        paddingBottom: "2rem",
      } : undefined}
    >
      {/* Ambient orbs */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "-15%", right: "-8%",
        width: "52rem", height: "52rem", borderRadius: "50%",
        background: "radial-gradient(circle, var(--hero-orb-1) 0%, transparent 65%)",
        zIndex: 0,
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: "-10%", left: "-10%",
        width: "45rem", height: "45rem", borderRadius: "50%",
        background: "radial-gradient(circle, var(--hero-orb-2) 0%, transparent 65%)",
        zIndex: 0,
      }} />

      {/* Grid pattern */}
      <div aria-hidden="true" className="dot-grid" style={{
        position: "absolute", inset: 0, zIndex: 0, opacity: 0.4,
      }} />

      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        <div
          className={isPreview ? "hero-split-grid is-preview" : "hero-split-grid grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"}
          style={isPreview ? {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          } : undefined}
        >

          {/* ── LEFT — Text Content ── */}
          <div className={isPreview ? undefined : "hero-split-copy order-2 lg:order-1"} style={isPreview ? { order: 1 } : undefined}>

            {/* Status pill — availability and/or location, no orphan icons */}
            {availableText || locationText ? (
            <div className="hero-split-status-wrap" style={{ marginBottom: "1.75rem", ...delay(0) }}>
              <div className="hero-split-status">
                {availableText ? (
                  <>
                    <span className="hero-split-status-dot" aria-hidden="true" />
                    <span className="hero-split-status-available">{availableText}</span>
                  </>
                ) : null}
                {availableText && locationText ? (
                  <span className="hero-split-status-divider" aria-hidden="true" />
                ) : null}
                {locationText ? (
                  <>
                    <RiMapPinLine size={12} className="hero-split-status-pin" aria-hidden="true" />
                    <span className="hero-split-status-location">{locationText}</span>
                  </>
                ) : null}
              </div>
            </div>
            ) : null}

            {/* Greeting */}
            <div className="hero-split-greeting" style={delay(80)}>
              <p style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                color: "var(--color-text-3)",
                marginBottom: "0.5rem",
                fontWeight: 400,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                {greeting}
              </p>
            </div>

            {/* Name — big and bold */}
            <div style={delay(150)}>
              <h1 style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                marginBottom: "1.5rem",
              }}>
                <span className="hero-name-gradient" style={{ display: "block" }}>
                  {displayName.first}
                </span>
                {displayName.last ? (
                  <span style={{ color: "var(--color-text)", display: "block" }}>
                    {displayName.last}
                  </span>
                ) : null}
              </h1>
            </div>

            {/* Role ticker */}
            <div style={{ marginBottom: "1.75rem", ...delay(220) }}>
              <div className="hero-role-chip">
                <span className="hero-role-chip-bar" aria-hidden="true" />
                <div className="hero-role-ticker" aria-live="polite">
                  <span key={currentRoleIndex} className="hero-role-ticker-item">
                    {roles[currentRoleIndex]}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: "2rem", ...delay(290) }}>
              <p style={{
                fontSize: "clamp(1rem, 1.5vw, 1.1rem)",
                color: "var(--color-text-2)",
                lineHeight: 1.8,
                maxWidth: "40rem",
              }}>
                {settings.bio}
              </p>
            </div>

            {/* Socials + CTAs — socials sit directly above the action row */}
            <div className="hero-split-cta-wrap" style={delay(360)}>
              <div className="hero-split-socials">
                {primarySocials.map((link) => {
                  const Icon = socialIcon(link.platform);
                  return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank" rel="noopener noreferrer"
                    data-tip={link.label}
                    aria-label={link.label}
                    className="social-icon-btn social-tip"
                  >
                    <Icon size={17} />
                  </a>
                  );
                })}
              </div>

              <div
                className={isPreview ? "hero-split-actions" : "hero-split-actions hidden lg:flex"}
                style={{ alignItems: "center", gap: "0.85rem", flexWrap: "wrap", display: isPreview ? "flex" : undefined }}
              >
                <Link href={primaryCtaHref} className="btn btn-primary btn-lg hero-split-cta">
                  {primaryCtaLabel}
                  <RiArrowRightLine size={18} />
                </Link>
                <Link href={secondaryCtaHref} className="btn btn-outline btn-lg hero-split-cta">
                  {secondaryCtaLabel}
                </Link>
                <Link
                  href="/cv?source=homepage"
                  className="btn btn-ghost btn-lg hero-split-cta hero-split-cv"
                >
                  View CV
                </Link>
              </div>

              {!isPreview && (
              <div className="hero-split-mobile-actions flex lg:hidden">
                <Link href={primaryCtaHref} className="btn btn-primary hero-split-cta">
                  {primaryCtaLabel}
                  <RiArrowRightLine size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(true)}
                  className="btn btn-outline hero-split-cta"
                  aria-label="More actions"
                >
                  More
                </button>
              </div>
              )}
            </div>
          </div>

          {/* ── RIGHT — Photo + floating badges ── */}
          <div
            className={isPreview ? "hero-split-media" : "hero-split-media flex justify-center order-1 lg:order-2"}
            style={{
              display: "flex",
              justifyContent: "center",
              order: isPreview ? 2 : undefined,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.9s ease 200ms, transform 0.9s ease 200ms",
            }}
          >
            <div
              className="hero-split-photo"
              style={isPreview ? {
                position: "relative",
                width: "30rem",
                height: "34rem",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              } : {
                position: "relative",
              }}
            >
              {/* Portal stage — soft niche, rings, sparks; person stands taller */}
              <div className="hero-split-stage" aria-hidden="true">
                <div className="hero-split-halo" />
                <div className="hero-split-portal light-arch" />
                <div className="hero-split-portal dark-arch" />
                <div className="hero-split-ring is-outer" />
                <div className="hero-split-ring is-mid" />
                <div className="hero-split-ring is-inner" />
                <span className="hero-split-spark is-a" />
                <span className="hero-split-spark is-b" />
                <span className="hero-split-spark is-c" />
              </div>

              {/* Photo sits in front and taller than the portal */}
              <div className={portraitAnimate ? "hero-split-shot is-bobbing" : "hero-split-shot"}>
                <ResilientCover
                  src={splitImage}
                  alt={heroPortraitAlt(settings)}
                  priority
                  sizes="(max-width: 767px) 100vw, (max-width: 1100px) 70vw, 28rem"
                  className="hero-split-img"
                />
              </div>

              {highlights.map((item, index) => (
              <div
                key={`${item.value}-${item.label}`}
                className={`hero-split-chip is-${index === 0 ? "right" : "left"}`}
                style={{ animationDelay: index === 0 ? "0.4s" : "1.1s" }}
              >
                <span className="hero-split-chip-accent" aria-hidden="true" />
                <div className="hero-split-chip-copy">
                  <p className="hero-split-chip-value">{item.value}</p>
                  <p className="hero-split-chip-label">{item.label}</p>
                </div>
              </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator — hidden when THE STORY cue is present (avoids overlap) */}
        {!isPreview && (
        <div className="hero-split-scroll" aria-hidden="true">
          <span>Scroll</span>
          <RiArrowDownLine size={16} />
        </div>
        )}
      </div>

      {!isPreview && mounted
        ? createPortal(
            <>
              <div
                aria-hidden={!isMoreOpen}
                onClick={() => setIsMoreOpen(false)}
                className="hero-more-backdrop lg:hidden"
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 12040,
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(6px)",
                  transition: "opacity 0.3s ease",
                  opacity: isMoreOpen ? 1 : 0,
                  pointerEvents: isMoreOpen ? "auto" : "none",
                }}
              />
              <div
                ref={moreSheetRef}
                role="dialog"
                aria-modal="true"
                aria-label="More actions"
                className="hero-more-sheet lg:hidden"
                style={{
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 12050,
                  pointerEvents: isMoreOpen ? "auto" : "none",
                  transform: `translateY(calc(${isMoreOpen ? "0px" : "100%"} + var(--sheet-drag, 0px)))`,
                  transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
                }}
              >
                <div className="hero-more-handle" aria-hidden="true" />
                <p className="hero-more-title">More actions</p>
                <div className="hero-more-list">
                  <Link href="/experience" className="hero-more-item" onClick={() => setIsMoreOpen(false)}>
                    Experience
                  </Link>
                  <Link href="/contact" className="hero-more-item" onClick={() => setIsMoreOpen(false)}>
                    Contact
                  </Link>
                  <Link href="/cv?source=homepage" className="hero-more-item" onClick={() => setIsMoreOpen(false)}>
                    View CV
                  </Link>
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </section>
  );
}
