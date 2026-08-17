"use client";

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
  RiCloseLine,
  RiArrowDownLine,
} from "react-icons/ri";
import { useState, useEffect, useRef } from "react";
import { BrainCircuit } from "lucide-react";
import { siteConfig } from "@/data/site-data";
import { SiteSettings } from "@/lib/supabase";

const primarySocials = [
  { href: siteConfig.social.whatsapp, label: "WhatsApp", icon: RiWhatsappLine },
  { href: siteConfig.social.linkedin, label: "LinkedIn", icon: RiLinkedinFill },
  { href: siteConfig.social.github, label: "GitHub", icon: RiGithubFill },
  { href: siteConfig.social.twitter, label: "X / Twitter", icon: RiTwitterXFill },
  { href: siteConfig.social.instagram, label: "Instagram", icon: RiInstagramLine },
];

export default function SplitHero({ settings }: { settings: SiteSettings }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const roles = settings.siteSubtitle
    ? settings.siteSubtitle.split(" • ")
    : ["Founder", "Software Engineer", "AI Builder", "Speaker", "Entrepreneur"];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 55;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 82, 168, ${p.alpha})`;
        ctx.fill();
      });

      // Lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(14, 82, 168, ${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const delay = (ms: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
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
        background: "var(--color-bg)",
        paddingTop: "6rem",
        paddingBottom: "4rem",
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── LEFT — Text Content ── */}
          <div className="order-2 lg:order-1">

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
                <span style={{ color: "#16a34a" }}>Available for new projects</span>
                <span style={{ width: "1px", height: "0.85rem", background: "rgba(0,0,0,0.12)" }} />
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
                Hi there, I&apos;m
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
                  Prince Parfait
                </span>
                <span style={{ color: "var(--color-text)", display: "block" }}>
                  GANZA
                </span>
              </h1>
            </div>

            {/* Role ticker */}
            <div style={{ marginBottom: "1.75rem", ...delay(220) }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.75rem",
                background: "var(--color-surface)", border: "1px solid var(--color-border)",
                borderRadius: "0.875rem", padding: "0.6rem 1.25rem",
                boxShadow: "var(--shadow-sm)",
              }}>
                <span style={{
                  width: "0.375rem", height: "1.75rem",
                  background: "linear-gradient(180deg, var(--color-primary), #6366f1)",
                  borderRadius: "9999px", flexShrink: 0,
                }} />
                <div style={{
                  position: "relative", height: "1.6rem", overflow: "hidden",
                  minWidth: "15rem", display: "flex", alignItems: "center",
                }}>
                  {roles.map((role, idx) => (
                    <span
                      key={idx}
                      style={{
                        position: "absolute", left: 0, width: "100%",
                        whiteSpace: "nowrap",
                        fontFamily: "var(--font-heading)",
                        fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
                        fontWeight: 700,
                        color: "var(--color-text)",
                        transform: idx === currentRoleIndex
                          ? "translateY(0)" : idx < currentRoleIndex
                            ? "translateY(-110%)" : "translateY(110%)",
                        opacity: idx === currentRoleIndex ? 1 : 0,
                        transition: "all 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {role}
                    </span>
                  ))}
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
                    transition: "border-color 0.2s ease",
                  }}
                >
                  Lerony
                </a>
                , building software that creates lasting impact.
              </p>
            </div>

            {/* Social icons */}
            <div style={{ marginBottom: "2.25rem", ...delay(360) }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
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
              {/* Desktop */}
              <div className="hidden lg:flex" style={{ alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
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

              {/* Mobile */}
              <div className="flex lg:hidden" style={{ alignItems: "center", gap: "0.75rem", width: "100%" }}>
                <Link
                  href="/projects"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", height: "3.25rem", fontWeight: 700 }}
                >
                  View My Work
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
            </div>
          </div>

          {/* ── RIGHT — Photo + floating badges ── */}
          <div
            className="flex justify-center order-1 lg:order-2"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.9s ease 200ms, transform 0.9s ease 200ms",
            }}
          >
            <div style={{
              position: "relative",
              width: "min(72vw, 28rem)",
              height: "min(90vw, 36rem)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}>
              {/* Arch backdrop — light */}
              <div aria-hidden="true" style={{
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
              <div style={{ position: "relative", zIndex: 2, width: "88%", height: "98%", bottom: 0 }}>
                <img
                  src={settings?.heroImageUrl || "/images/profile/hero-photo.png"}
                  alt={`${settings.siteTitle} — ${settings.siteSubtitle}`}
                  className="w-full h-full object-contain object-bottom"
                />
              </div>

              {/* Floating stat — Projects */}
              <div
                className="hero-stat-card animate-float"
                style={{
                  position: "absolute", top: "2rem", right: "-0.5rem",
                  animationDelay: "0.3s", zIndex: 3, minWidth: "7rem",
                  textAlign: "center",
                }}
              >
                <p style={{
                  fontFamily: "var(--font-heading)", fontSize: "1.875rem",
                  fontWeight: 800, color: "var(--color-primary)", lineHeight: 1,
                }}>15+</p>
                <p style={{ fontSize: "0.7rem", color: "var(--color-text-3)", marginTop: "0.25rem", fontWeight: 500 }}>
                  Projects Shipped
                </p>
              </div>

              {/* Floating stat — Years */}
              <div
                className="hero-stat-card animate-float"
                style={{
                  position: "absolute", top: "8rem", left: "-0.5rem",
                  animationDelay: "1s", zIndex: 3, minWidth: "7rem",
                  textAlign: "center",
                }}
              >
                <p style={{
                  fontFamily: "var(--font-heading)", fontSize: "1.875rem",
                  fontWeight: 800, color: "#6366f1", lineHeight: 1,
                }}>3+</p>
                <p style={{ fontSize: "0.7rem", color: "var(--color-text-3)", marginTop: "0.25rem", fontWeight: 500 }}>
                  Years Building
                </p>
              </div>

              {/* Floating tech pill */}
              <div
                className="animate-float"
                style={{
                  position: "absolute", bottom: "3.5rem", left: "-1rem",
                  animationDelay: "1.8s", zIndex: 3,
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "9999px",
                  padding: "0.4rem 1rem",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <BrainCircuit size={15} style={{ color: "#6366f1" }} strokeWidth={2} />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap" }}>
                  AI Builder
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
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
      </div>

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
            Let&apos;s Collaborate
          </Link>
          <a
            href="/resume.pdf"
            download
            className="btn btn-ghost"
            style={{
              justifyContent: "center", width: "100%", height: "3.25rem",
              color: "var(--color-text)", border: "1px solid var(--color-border)", fontWeight: 500,
            }}
          >
            <RiDownloadLine size={18} style={{ marginRight: "0.5rem" }} />
            Download CV
          </a>
        </div>
      </div>
    </section>
  );
}
