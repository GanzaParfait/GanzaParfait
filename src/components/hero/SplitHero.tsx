"use client";

import Image from "next/image";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiDownloadLine,
  RiMapPinLine,
  RiWhatsappLine,
  RiLinkedinFill,
  RiInstagramLine,
  RiGithubFill,
  RiTwitterXFill,
  RiMore2Line,
  RiCloseLine,
} from "react-icons/ri";
import { useState, useEffect } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { siteConfig } from "@/data/site-data";
import { SiteSettings } from "@/lib/supabase";

const primarySocials = [
  { href: siteConfig.social.whatsapp,  label: "WhatsApp",  icon: RiWhatsappLine },
  { href: siteConfig.social.linkedin,  label: "LinkedIn",  icon: RiLinkedinFill },
  { href: siteConfig.social.instagram, label: "Instagram", icon: RiInstagramLine },
  { href: siteConfig.social.github,    label: "GitHub",    icon: RiGithubFill },
  { href: siteConfig.social.twitter,   label: "X / Twitter", icon: RiTwitterXFill },
];

export default function SplitHero({ settings }: { settings: SiteSettings }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const roles = settings.siteSubtitle ? settings.siteSubtitle.split(" • ") : ["Founder", "Software Engineer", "AI Builder"];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <section className="relative overflow-hidden min-h-[100dvh] flex items-center pt-24 pb-16 lg:pt-28 lg:pb-24" aria-label="Hero Section">
      {/* Glow Orbs */}
      <div
        aria-hidden="true"
        className="hero-orb"
        style={{
          top: "-10%",
          right: "-5%",
          width: "40rem",
          height: "40rem",
          background: "radial-gradient(circle, var(--hero-orb-1) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="hero-orb"
        style={{
          bottom: "0%",
          left: "-8%",
          width: "35rem",
          height: "35rem",
          background: "radial-gradient(circle, var(--hero-orb-2) 0%, transparent 65%)",
        }}
      />

      <div className="container w-full" style={{ position: "relative", zIndex: 10 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ── LEFT — Text Content ── */}
          <div className="order-2 lg:order-1">
            {/* Status badge */}
            <AnimatedSection delay={0} direction="fade">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(14,82,168,0.08)",
                  border: "1px solid rgba(14,82,168,0.2)",
                  borderRadius: "9999px",
                  padding: "0.375rem 1rem",
                  marginBottom: "1.5rem",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                }}
              >
                <span
                  style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }}
                  aria-hidden="true"
                />
                <span style={{ color: "var(--color-primary)" }}>Available for new projects</span>
                <RiMapPinLine size={12} style={{ color: "var(--color-text-3)" }} />
                <span style={{ color: "var(--color-text-3)", fontSize: "0.75rem" }}>{settings.location}</span>
              </div>
            </AnimatedSection>

            {/* Greeting */}
            <AnimatedSection delay={80}>
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                  color: "var(--color-text-2)",
                  marginBottom: "0.25rem",
                  fontWeight: 400,
                }}
              >
                Hi, I&apos;m
              </p>
            </AnimatedSection>

            {/* Name */}
            <AnimatedSection delay={150}>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  marginBottom: "0.5rem",
                }}
              >
                <span className="hero-name-gradient">{settings.siteTitle.split(" ")[0]} {settings.siteTitle.split(" ")[1] || ""}</span>
                <br />
                <span style={{ color: "var(--color-text)" }}>{settings.siteTitle.split(" ").slice(2).join(" ") || "GANZA"}</span>
              </h1>
            </AnimatedSection>

            {/* Role */}
            <AnimatedSection delay={220}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "9999px",
                  padding: "0.375rem 1.25rem",
                  marginBottom: "1.25rem",
                  boxShadow: "var(--shadow-sm)",
                  color: "var(--color-text-2)",
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                }}
              >
                <div style={{ position: "relative", height: "1.5rem", overflow: "hidden", minWidth: "14rem", display: "flex", alignItems: "center" }}>
                  {roles.map((role, idx) => (
                    <span
                      key={idx}
                      style={{
                        position: "absolute",
                        left: 0,
                        width: "100%",
                        whiteSpace: "nowrap",
                        transform: idx === currentRoleIndex ? "translateY(0)" : idx < currentRoleIndex ? "translateY(-100%)" : "translateY(100%)",
                        opacity: idx === currentRoleIndex ? 1 : 0,
                        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Description */}
            <AnimatedSection delay={290}>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-text-2)",
                  lineHeight: 1.75,
                  maxWidth: "38rem",
                  marginBottom: "2rem",
                }}
              >
                {settings.bio}{" "}
                Founder of{" "}
                <a
                  href="https://lerony.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}
                >
                  Lerony
                </a>
                , building software that creates lasting impact.
              </p>
            </AnimatedSection>

            {/* Social links */}
            <AnimatedSection delay={350} direction="fade">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                {primarySocials.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="social-icon-btn"
                    title={label}
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </AnimatedSection>

            {/* CTAs */}
            <AnimatedSection delay={420}>
              {/* Desktop CTAs */}
              <div className="hidden lg:flex items-center gap-4 flex-wrap">
                <Link href="/projects" className="btn btn-primary btn-lg">
                  View My Work
                  <RiArrowRightLine size={18} />
                </Link>
                <Link href="/contact" className="btn btn-outline btn-lg">
                  Let&apos;s Collaborate
                </Link>
                <a
                  href="/resume.pdf"
                  download
                  className="btn btn-ghost"
                  aria-label="Download CV"
                  style={{ color: "var(--color-text-3)" }}
                >
                  <RiDownloadLine size={16} />
                  CV
                </a>
              </div>

              {/* Mobile CTAs */}
              <div className="flex lg:hidden items-center gap-2 w-full mt-2">
                <Link href="/projects" className="btn btn-primary flex-1 justify-center" style={{ height: "3rem" }}>
                  View My Work
                  <RiArrowRightLine size={18} />
                </Link>
                <button
                  onClick={() => setIsMoreOpen(true)}
                  className="btn btn-outline"
                  style={{ padding: "0 1rem", height: "3rem" }}
                  aria-label="More actions"
                >
                  <RiMore2Line size={20} />
                </button>
              </div>
            </AnimatedSection>
          </div>

          {/* ── RIGHT — Person Photo ── */}
          <AnimatedSection delay={200} direction="fade" className="flex justify-center order-1 lg:order-2 mb-2 lg:mb-0">
            <div className="relative flex items-end justify-center w-full min-h-[24rem] lg:min-h-[35rem]">
              {/* Arch background shape */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "min(75vw, 28rem)",
                  height: "min(85vw, 32rem)",
                  borderRadius: "50% 50% 0 0 / 60% 60% 0 0",
                  background: "linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)",
                  zIndex: 0,
                }}
              />
              {/* Arch — dark mode variant */}
              <div
                aria-hidden="true"
                className="dark-arch"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "min(75vw, 28rem)",
                  height: "min(85vw, 32rem)",
                  borderRadius: "50% 50% 0 0 / 60% 60% 0 0",
                  background: "linear-gradient(135deg, rgba(14,82,168,0.15) 0%, rgba(99,60,180,0.12) 100%)",
                  zIndex: 0,
                  display: "none",
                }}
              />

              {/* Photo */}
              <div style={{ position: "relative", zIndex: 1, width: "min(70vw, 26rem)", height: "min(90vw, 34rem)" }}>
                <Image
                  src="/images/profile/hero-photo-v3.png"
                  alt={`${settings.siteTitle} — ${settings.siteSubtitle}`}
                  fill
                  className="object-contain object-bottom"
                  priority
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>

              {/* Stat badge — Projects (top-right) */}
              <div
                className="hero-stat-card animate-float"
                style={{
                  position: "absolute",
                  top: "3rem",
                  right: "0",
                  animationDelay: "0.5s",
                  zIndex: 2,
                }}
              >
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)", lineHeight: 1 }}>15+</p>
                <p style={{ fontSize: "0.7rem", color: "var(--color-text-3)", marginTop: "0.15rem" }}>Projects Shipped</p>
              </div>

              {/* Stat badge — Years (left) */}
              <div
                className="hero-stat-card animate-float"
                style={{
                  position: "absolute",
                  top: "8rem",
                  left: "0",
                  animationDelay: "1.1s",
                  zIndex: 2,
                }}
              >
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, color: "#6366f1", lineHeight: 1 }}>3+</p>
                <p style={{ fontSize: "0.7rem", color: "var(--color-text-3)", marginTop: "0.15rem" }}>Years Building</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Mobile Actions Bottom Sheet */}
      <div
        aria-hidden={!isMoreOpen}
        onClick={() => setIsMoreOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease",
          opacity: isMoreOpen ? 1 : 0,
          pointerEvents: isMoreOpen ? "auto" : "none",
        }}
        className="lg:hidden"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="More actions"
        className="lg:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "var(--color-bg)",
          borderTop: "1px solid var(--color-border)",
          borderRadius: "1.5rem 1.5rem 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          transform: isMoreOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          padding: "1.25rem 1.25rem 2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)" }}>More Actions</h3>
          <button
            onClick={() => setIsMoreOpen(false)}
            style={{ width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-surface)", borderRadius: "50%", border: "1px solid var(--color-border)" }}
          >
            <RiCloseLine size={20} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link href="/contact" className="btn btn-outline" style={{ justifyContent: "center", width: "100%", height: "3rem" }}>
            Let&apos;s Collaborate
          </Link>
          <a
            href="/resume.pdf"
            download
            className="btn btn-ghost"
            style={{ justifyContent: "center", width: "100%", height: "3rem", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
          >
            <RiDownloadLine size={18} style={{ marginRight: "0.5rem" }} />
            Download CV
          </a>
        </div>
      </div>
    </section>
  );
}
