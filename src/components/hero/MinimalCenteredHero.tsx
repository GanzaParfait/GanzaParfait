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
import { useState, useEffect } from "react";
import { siteConfig } from "@/data/site-data";
import { SiteSettings } from "@/lib/supabase";

const primarySocials = [
  { href: siteConfig.social.whatsapp,  label: "WhatsApp",    icon: RiWhatsappLine },
  { href: siteConfig.social.linkedin,  label: "LinkedIn",    icon: RiLinkedinFill },
  { href: siteConfig.social.github,    label: "GitHub",      icon: RiGithubFill },
  { href: siteConfig.social.twitter,   label: "X / Twitter", icon: RiTwitterXFill },
  { href: siteConfig.social.instagram, label: "Instagram",   icon: RiInstagramLine },
];

export default function MinimalCenteredHero({ settings }: { settings: SiteSettings }) {
  const roles = settings.siteSubtitle
    ? settings.siteSubtitle.split(" • ")
    : ["Founder", "Software Engineer", "AI Builder", "Speaker", "Entrepreneur"];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [roles.length]);

  const delay = (ms: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.7s ease ${ms}ms, transform 0.7s ease ${ms}ms`,
  });

  return (
    <section
      className="relative overflow-hidden"
      aria-label="Hero Section"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "var(--color-bg)",
        paddingTop: "5rem",
        paddingBottom: "3rem",
        textAlign: "center",
      }}
    >
      {/* Subtle gradient orbs */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "-20%", left: "50%",
        transform: "translateX(-50%)",
        width: "60rem", height: "60rem", borderRadius: "50%",
        background: "radial-gradient(circle, var(--hero-orb-1) 0%, transparent 60%)",
        zIndex: 0, pointerEvents: "none",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: "-25%", right: "-10%",
        width: "40rem", height: "40rem", borderRadius: "50%",
        background: "radial-gradient(circle, var(--hero-orb-2) 0%, transparent 60%)",
        zIndex: 0, pointerEvents: "none",
      }} />

      {/* Dot grid */}
      <div aria-hidden="true" className="dot-grid" style={{
        position: "absolute", inset: 0, zIndex: 0, opacity: 0.3,
      }} />

      <div className="container" style={{ position: "relative", zIndex: 10, maxWidth: "52rem" }}>

        {/* Avatar circle */}
        <div style={{ marginBottom: "1.75rem", ...delay(0) }}>
          <div style={{
            width: "6.5rem", height: "6.5rem",
            borderRadius: "50%",
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
            border: "3px solid var(--color-primary)",
            boxShadow: "0 0 30px rgba(14,82,168,0.2), 0 0 60px rgba(14,82,168,0.1)",
          }}>
            <Image
              src="/images/profile/hero-photo-v3.png"
              alt={settings.siteTitle}
              fill
              className="object-cover object-top"
              priority
              sizes="104px"
            />
          </div>
        </div>

        {/* Status pill */}
        <div style={{ marginBottom: "1.5rem", ...delay(80) }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "9999px",
            padding: "0.3rem 0.875rem",
            fontSize: "0.75rem", fontWeight: 600,
          }}>
            <span style={{
              width: "0.4rem", height: "0.4rem", borderRadius: "50%",
              background: "#22c55e", display: "inline-block",
              boxShadow: "0 0 6px #22c55e",
              animation: "pulse 2s infinite",
            }} aria-hidden="true" />
            <span style={{ color: "#16a34a" }}>Available for new projects</span>
            <span style={{ width: "1px", height: "0.75rem", background: "var(--color-border)" }} />
            <RiMapPinLine size={11} style={{ color: "var(--color-text-3)" }} />
            <span style={{ color: "var(--color-text-3)" }}>{settings.location}</span>
          </div>
        </div>

        {/* Name — large centered */}
        <div style={delay(150)}>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: "clamp(2.25rem, 5.5vw, 4rem)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            marginBottom: "1rem",
          }}>
            <span className="hero-name-gradient">{settings.siteTitle.split(" ").slice(0, -1).join(" ")}</span>
            <br />
            <span style={{ color: "var(--color-text)" }}>{settings.siteTitle.split(" ").slice(-1)[0]}</span>
          </h1>
        </div>

        {/* Role ticker */}
        <div style={{ marginBottom: "1.5rem", ...delay(220) }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            height: "1.75rem", overflow: "hidden",
            position: "relative",
            minWidth: "16rem",
          }}>
            {roles.map((role, idx) => (
              <span
                key={idx}
                style={{
                  position: "absolute", width: "100%",
                  textAlign: "center",
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  transform: idx === currentRoleIndex
                    ? "translateY(0)" : idx < currentRoleIndex
                    ? "translateY(-120%)" : "translateY(120%)",
                  opacity: idx === currentRoleIndex ? 1 : 0,
                  transition: "all 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: "2rem", ...delay(290) }}>
          <p style={{
            fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
            color: "var(--color-text-2)",
            lineHeight: 1.8,
            maxWidth: "36rem",
            margin: "0 auto",
          }}>
            {settings.bio}{" "}
            Founder of{" "}
            <a
              href="https://lerony.com"
              target="_blank" rel="noopener noreferrer"
              style={{
                color: "var(--color-primary)", fontWeight: 700,
                textDecoration: "none",
                borderBottom: "2px solid rgba(14,82,168,0.3)",
                paddingBottom: "1px",
              }}
            >
              Lerony
            </a>
            , building software that creates lasting impact.
          </p>
        </div>

        {/* Social icons */}
        <div style={{ marginBottom: "2rem", ...delay(360) }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {primarySocials.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank" rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="social-icon-btn"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={delay(440)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/projects" className="btn btn-primary btn-lg" style={{ fontWeight: 700 }}>
              View My Work
              <RiArrowRightLine size={18} />
            </Link>
            <Link href="/contact" className="btn btn-outline btn-lg" style={{ fontWeight: 600 }}>
              Let&apos;s Collaborate
            </Link>
            <a
              href="/resume.pdf"
              download
              className="btn btn-ghost"
              style={{ color: "var(--color-text-3)", fontWeight: 500 }}
            >
              <RiDownloadLine size={16} />
              CV
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
