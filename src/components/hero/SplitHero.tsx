"use client";

import Link from "next/link";
import Image from "next/image";
import {
  RiArrowRightLine,
  RiMapPinLine,
  RiCloseLine,
  RiArrowDownLine,
} from "react-icons/ri";
import { useState, useEffect } from "react";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import { SiteSettings } from "@/lib/supabase";
import { heroHighlights, heroImageFor, setting, splitDisplayName } from "@/lib/hero";
import { socialIcon, heroSocialsFor } from "@/lib/socials";

export default function SplitHero({
  settings,
  isPreview = false,
}: {
  settings: SiteSettings;
  isPreview?: boolean;
}) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  useHistoryBackClose(isMoreOpen && !isPreview, () => setIsMoreOpen(false));
  const roles = settings.siteSubtitle
    ? settings.siteSubtitle.split(/\s*[•·]\s*/).filter(Boolean)
    : ["Founder", "Entrepreneur", "Technologist"];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const displayName = splitDisplayName(setting(settings, "siteTitle"));
  const greeting = setting(settings, "heroGreeting");
  const availableText = setting(settings, "heroAvailableText");
  const primaryCtaLabel = setting(settings, "heroPrimaryCtaLabel");
  const primaryCtaHref = setting(settings, "heroPrimaryCtaHref");
  const secondaryCtaLabel = setting(settings, "heroSecondaryCtaLabel");
  const secondaryCtaHref = setting(settings, "heroSecondaryCtaHref");
  const splitImage = heroImageFor(settings, "split_portrait");
  const splitIsStatic = splitImage.startsWith("/") && !splitImage.startsWith("//");
  const primarySocials = heroSocialsFor(settings);

  useEffect(() => {
    setVisible(true);
  }, []);

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
          <div className={isPreview ? undefined : "order-2 lg:order-1"} style={isPreview ? { order: 1 } : undefined}>

            {/* Status pill */}
            <div style={{ marginBottom: "1.75rem", ...delay(0) }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: "9999px",
                padding: "0.375rem 1rem",
                fontSize: "0.8125rem", fontWeight: 600,
              }}>
                <span style={{
                  width: "0.45rem", height: "0.45rem", borderRadius: "50%",
                  background: "#22c55e", display: "inline-block",
                  boxShadow: "0 0 6px #22c55e",
                  animation: "pulse 2s infinite",
                }} aria-hidden="true" />
                <span style={{ color: "#16a34a" }}>{availableText}</span>
                <span style={{ width: "1px", height: "0.85rem", background: "var(--color-border)" }} />
                <RiMapPinLine size={12} style={{ color: "var(--color-text-3)" }} />
                <span style={{ color: "var(--color-text-3)" }}>{settings.location}</span>
              </div>
            </div>

            {/* Greeting */}
            <div style={delay(80)}>
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

            {/* Social icons */}
            <div style={{ marginBottom: "2.25rem", ...delay(360) }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
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
            </div>

            {/* CTAs */}
            <div style={delay(440)}>
              <div
                className={isPreview ? undefined : "hidden lg:flex"}
                style={{ alignItems: "center", gap: "1rem", flexWrap: "wrap", display: isPreview ? "flex" : undefined }}
              >
                <Link href={primaryCtaHref} className="btn btn-primary btn-lg" style={{ fontWeight: 700 }}>
                  {primaryCtaLabel}
                  <RiArrowRightLine size={18} />
                </Link>
                <Link href={secondaryCtaHref} className="btn btn-outline btn-lg" style={{ fontWeight: 600 }}>
                  {secondaryCtaLabel}
                </Link>
                <Link
                  href="/experience"
                  className="btn btn-ghost"
                  style={{ color: "var(--color-text-3)", fontWeight: 500 }}
                >
                  Experience
                </Link>
              </div>

              {!isPreview && (
              <div className="flex lg:hidden" style={{ alignItems: "center", gap: "0.75rem", width: "100%" }}>
                <Link
                  href={primaryCtaHref}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", height: "3.25rem", fontWeight: 700 }}
                >
                  {primaryCtaLabel}
                  <RiArrowRightLine size={18} />
                </Link>
                <button
                  onClick={() => setIsMoreOpen(true)}
                  className="btn btn-outline"
                  style={{ height: "3.25rem", paddingLeft: "1.25rem", paddingRight: "1.25rem" }}
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
            className={isPreview ? undefined : "flex justify-center order-1 lg:order-2"}
            style={{
              display: "flex",
              justifyContent: "center",
              order: isPreview ? 2 : undefined,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.9s ease 200ms, transform 0.9s ease 200ms",
            }}
          >
            <div className="hero-split-photo" style={{
              position: "relative",
              width: isPreview ? "32rem" : "min(100%, 32rem)",
              height: isPreview ? "38rem" : "min(72vw, 34rem)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}>
              {/* Arch backdrop — light */}
              <div aria-hidden="true" className="light-arch" style={{
                position: "absolute", bottom: 0, left: "50%",
                transform: "translateX(-50%)",
                width: "90%", height: "95%",
                borderRadius: "50% 50% 0 0 / 55% 55% 0 0",
                background: "linear-gradient(160deg, #dbeafe 0%, #e0e7ff 50%, #ede9fe 100%)",
                zIndex: 0,
              }} />
              {/* Arch backdrop — dark */}
              <div aria-hidden="true" className="dark-arch" style={{
                position: "absolute", bottom: 0, left: "50%",
                transform: "translateX(-50%)",
                width: "90%", height: "95%",
                borderRadius: "50% 50% 0 0 / 55% 55% 0 0",
                background: "linear-gradient(160deg, rgba(14,82,168,0.18) 0%, rgba(99,60,180,0.14) 100%)",
                zIndex: 0, display: "none",
              }} />

              {/* Glow ring */}
              <div aria-hidden="true" style={{
                position: "absolute", bottom: "0", left: "50%",
                transform: "translateX(-50%)",
                width: "88%", height: "92%",
                borderRadius: "50% 50% 0 0 / 55% 55% 0 0",
                border: "1px solid rgba(14,82,168,0.15)",
                zIndex: 1,
                boxShadow: "inset 0 0 30px rgba(14,82,168,0.04)",
              }} />

              {/* Photo */}
              <div className="hero-split-shot" style={{ position: "relative", zIndex: 2, width: "88%", height: "98%", bottom: 0 }}>
                {splitIsStatic ? (
                  <Image
                    src={splitImage}
                    alt={setting(settings, "siteTitle")}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 28rem"
                    className="object-contain object-bottom hero-split-img"
                  />
                ) : (
                  <img
                    src={splitImage}
                    alt={setting(settings, "siteTitle")}
                    className="hero-split-img"
                    style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom" }}
                  />
                )}
              </div>

              {heroHighlights(settings).slice(0, 2).map((item, index) => (
              <div
                key={`${item.value}-${item.label}`}
                className="hero-stat-card animate-float"
                style={{
                  position: "absolute",
                  top: index === 0 ? "2rem" : "8rem",
                  right: index === 0 ? "-0.5rem" : undefined,
                  left: index === 1 ? "-0.5rem" : undefined,
                  animationDelay: index === 0 ? "0.3s" : "1s",
                  zIndex: 3,
                  minWidth: "8.5rem",
                  textAlign: "center",
                }}
              >
                <p style={{
                  fontFamily: "var(--font-heading)", fontSize: "1rem",
                  fontWeight: 800, color: "var(--hover-icon)", lineHeight: 1.2,
                }}>{item.value}</p>
                <p style={{ fontSize: "0.7rem", color: "var(--color-text-3)", marginTop: "0.25rem", fontWeight: 500 }}>
                  {item.label}
                </p>
              </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        {!isPreview && (
        <div
          style={{
            position: "absolute", bottom: "-3rem", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem",
            opacity: visible ? 1 : 0,
            transition: "opacity 1s ease 1200ms",
          }}
        >
          <span style={{ fontSize: "0.7rem", color: "var(--color-text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Scroll
          </span>
          <RiArrowDownLine
            size={16}
            style={{ color: "var(--color-text-3)", animation: "float 2s ease-in-out infinite" }}
          />
        </div>
        )}
      </div>

      {!isPreview && (
      <>
      {/* Mobile More Sheet */}
      <div
        aria-hidden={!isMoreOpen}
        onClick={() => setIsMoreOpen(false)}
        className="lg:hidden"
        style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
          transition: "opacity 0.3s ease",
          opacity: isMoreOpen ? 1 : 0,
          pointerEvents: isMoreOpen ? "auto" : "none",
        }}
      />
      <div
        role="dialog" aria-modal="true" aria-label="More actions"
        className="lg:hidden"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: "var(--color-bg)",
          borderTop: "1px solid var(--color-border)",
          borderRadius: "1.5rem 1.5rem 0 0",
          boxShadow: "0 -12px 50px rgba(0,0,0,0.18)",
          transform: isMoreOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          padding: "1.5rem 1.5rem 2.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text)" }}>More Actions</h3>
          <button
            onClick={() => setIsMoreOpen(false)}
            style={{
              width: "2rem", height: "2rem", display: "flex", alignItems: "center",
              justifyContent: "center", background: "var(--color-surface)",
              borderRadius: "50%", border: "1px solid var(--color-border)", cursor: "pointer",
            }}
          >
            <RiCloseLine size={20} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/contact"
            className="btn btn-outline"
            style={{ justifyContent: "center", width: "100%", height: "3.25rem", fontWeight: 600 }}
          >
            Contact
          </Link>
          <Link
            href="/experience"
            className="btn btn-ghost"
            style={{
              justifyContent: "center", width: "100%", height: "3.25rem",
              color: "var(--color-text)", border: "1px solid var(--color-border)", fontWeight: 500,
            }}
          >
            Experience
          </Link>
        </div>
      </div>
      </>
      )}
    </section>
  );
}
