"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiWhatsappLine,
  RiMapPinLine,
  RiLinkedinFill,
  RiInstagramLine,
  RiSparklingFill,
  RiCodeSSlashLine,
  RiCpuLine,
} from "react-icons/ri";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { siteConfig } from "@/data/site-data";
import { SiteSettings } from "@/lib/supabase";

export default function FeaturedOverlayHero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-32" aria-label="Hero Section Full Width">
      {/* Full-width Gradient Backdrop & Ambient Orbs */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(14, 82, 168, 0.14) 0%, transparent 80%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        className="hero-orb"
        style={{
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "50rem",
          height: "25rem",
          background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 10, textAlign: "center" }}>

        {/* Top Tagline Pill */}
        <AnimatedSection delay={0} direction="fade">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-md)",
              borderRadius: "9999px",
              padding: "0.5rem 1.25rem",
              marginBottom: "2rem",
            }}
          >
            <RiSparklingFill size={16} style={{ color: "var(--color-primary)" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
              {settings.siteSubtitle}
            </span>
            <span style={{ width: "1px", height: "0.875rem", background: "var(--color-border)" }} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--color-text-3)" }}>
              <RiMapPinLine size={12} /> {settings.location}
            </span>
          </div>
        </AnimatedSection>

        {/* Main Bold Headline */}
        <AnimatedSection delay={100}>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 5.5vw, 4.75rem)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              maxWidth: "60rem",
              margin: "0 auto 1.5rem",
            }}
          >
            Empowering Innovation.
            <br />
            <span className="hero-name-gradient">
              Shaping the Digital Horizon.
            </span>
          </h1>
        </AnimatedSection>

        {/* High-Impact Bio */}
        <AnimatedSection delay={200}>
          <p
            style={{
              fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
              color: "var(--color-text-2)",
              lineHeight: 1.7,
              maxWidth: "44rem",
              margin: "0 auto 2.5rem",
              fontWeight: 400,
            }}
          >
            I&apos;m <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>{settings.siteTitle}</strong> — {settings.bio} Founder of <strong style={{ color: "var(--color-primary)" }}>Lerony</strong>.
          </p>
        </AnimatedSection>

        {/* Action Buttons & Direct WhatsApp */}
        <AnimatedSection delay={300}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "3.5rem" }}>
            <Link href="/projects" className="btn btn-primary btn-lg" style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
              Explore Portfolio
              <RiArrowRightLine size={20} />
            </Link>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-lg"
              style={{ padding: "0.875rem 1.75rem", fontSize: "1rem" }}
            >
              <RiWhatsappLine size={20} style={{ color: "#25D366" }} />
              Message on WhatsApp
            </a>
            <Link href="/contact" className="btn btn-ghost btn-lg" style={{ color: "var(--color-text-2)" }}>
              Get In Touch
            </Link>
          </div>
        </AnimatedSection>

        {/* Centerpiece Image & Quote Card Banner */}
        <AnimatedSection delay={400} direction="fade">
          <div
            style={{
              position: "relative",
              maxWidth: "54rem",
              margin: "0 auto",
              borderRadius: "1.75rem",
              overflow: "hidden",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-xl)",
              background: "var(--color-surface)",
            }}
          >
            {/* Banner Media Container */}
            <div style={{ position: "relative", width: "100%", height: "24rem", background: "linear-gradient(135deg, #0e52a8 0%, #1e1b4b 100%)" }}>
              <img
                src={settings?.heroImageUrl || "/images/profile/hero-photo.png"}
                alt={settings.siteTitle}
                className="w-full h-full object-cover object-top opacity-90"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                }}
              />

              {/* Overlaid Headline & Stats inside Banner */}
              <div
                style={{
                  position: "absolute",
                  bottom: "2rem",
                  left: "2rem",
                  right: "2rem",
                  textAlign: "left",
                  color: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#60a5fa" }}>
                    FOUNDER & EXECUTIVE BUILDER
                  </span>
                  <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffffff", marginTop: "0.25rem" }}>
                    {settings.siteTitle}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#d1d5db", marginTop: "0.25rem" }}>
                    &ldquo;Building high-performance software with purpose, passion, and speed.&rdquo;
                  </p>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", padding: "0.625rem 1.25rem", borderRadius: "0.75rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>15+</div>
                    <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Projects</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", padding: "0.625rem 1.25rem", borderRadius: "0.75rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>3+</div>
                    <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Years Exp.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quick Feature Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                borderTop: "1px solid var(--color-border)",
                background: "var(--color-bg)",
              }}
              className="grid-cols-1 md:grid-cols-3"
            >
              <div style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "0.875rem", borderRight: "1px solid var(--color-border)" }}>
                <RiCodeSSlashLine size={24} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>Full-Stack Engineering</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>Scalable Web & Mobile Architectures</p>
                </div>
              </div>

              <div style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "0.875rem", borderRight: "1px solid var(--color-border)" }}>
                <RiCpuLine size={24} style={{ color: "#6366f1", flexShrink: 0 }} />
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>AI Integration</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>LLMs, Automation & Voice AI</p>
                </div>
              </div>

              <div style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
                <RiSparklingFill size={24} style={{ color: "#0891b2", flexShrink: 0 }} />
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>Tech Leadership</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>Founding, Speaking & Advisory</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
