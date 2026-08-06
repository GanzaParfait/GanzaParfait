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
} from "react-icons/ri";
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
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24" aria-label="Hero Section">
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

      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          {/* ── LEFT — Text Content ── */}
          <div>
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
                Hi, I&apos;m 👋
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
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                  fontWeight: 500,
                  color: "var(--color-text-2)",
                  marginBottom: "1.25rem",
                  letterSpacing: "0.01em",
                }}
              >
                {settings.siteSubtitle}
              </p>
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
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
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
            </AnimatedSection>
          </div>

          {/* ── RIGHT — Person Photo ── */}
          <AnimatedSection delay={200} direction="fade" className="hidden lg:flex">
            <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", width: "100%", minHeight: "30rem" }}>
              {/* Arch background shape */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "22rem",
                  height: "26rem",
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
                  width: "22rem",
                  height: "26rem",
                  borderRadius: "50% 50% 0 0 / 60% 60% 0 0",
                  background: "linear-gradient(135deg, rgba(14,82,168,0.15) 0%, rgba(99,60,180,0.12) 100%)",
                  zIndex: 0,
                  display: "none",
                }}
              />

              {/* Photo */}
              <div style={{ position: "relative", zIndex: 1, width: "21rem", height: "27rem" }}>
                <Image
                  src="/images/profile/hero-photo.png"
                  alt={`${settings.siteTitle} — ${settings.siteSubtitle}`}
                  fill
                  className="object-contain object-bottom"
                  priority
                  sizes="(max-width: 1024px) 0px, 336px"
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
    </section>
  );
}
