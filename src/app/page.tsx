import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine, RiWhatsappLine } from "react-icons/ri";
import { Wrench, BrainCircuit, Rocket } from "lucide-react";
import { siteConfig, projects, blogPosts, skills } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import HeroSection from "@/components/hero/HeroSection";
import TechMarquee from "@/components/ui/TechMarquee";
import ImpactSection from "@/components/ui/ImpactSection";
import ProjectShowcase from "@/components/ui/ProjectShowcase";
import FeaturedBlogCards from "@/components/ui/FeaturedBlogCards";

export const metadata: Metadata = {
  title: "Prince Parfait GANZA — Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

const featuredProjects = projects.filter((p) => p.featured);
const featuredPosts    = blogPosts.filter((p) => p.featured);

const pillars = [
  {
    Icon: Wrench,
    title: "Full-Stack Engineering",
    description: "End-to-end web applications with Next.js, TypeScript, and modern backend technologies. Built to scale, optimized to perform.",
    accent: "#0e52a8",
    bg: "rgba(14,82,168,0.06)",
    border: "rgba(14,82,168,0.18)",
  },
  {
    Icon: BrainCircuit,
    title: "AI Integration",
    description: "Embedding AI into products to solve real-world problems and automate complex workflows using LangChain, OpenAI, and custom pipelines.",
    accent: "#6366f1",
    bg: "rgba(99,102,241,0.06)",
    border: "rgba(99,102,241,0.18)",
  },
  {
    Icon: Rocket,
    title: "Product Thinking",
    description: "Building software that solves genuine problems — from validated idea through architecture, design, and shipped product.",
    accent: "#0ea5e9",
    bg: "rgba(14,165,233,0.06)",
    border: "rgba(14,165,233,0.18)",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <HeroSection />

      {/* ─── WHAT I DO ─── */}
      <section className="section" aria-label="Core competencies" style={{ background: "var(--color-bg)" }}>
        <div className="container">
          <AnimatedSection className="text-center" style={{ marginBottom: "4rem" }}>
            <p className="section-label justify-center">What I Do</p>
            <h2 style={{ color: "var(--color-text)", marginBottom: "1rem" }}>
              Engineering with <span className="hero-name-gradient">purpose.</span>
            </h2>
            <p style={{ color: "var(--color-text-2)", maxWidth: "40rem", margin: "0 auto", fontSize: "1.0625rem" }}>
              I combine deep technical expertise with a product mindset to build software that solves real problems across Africa and beyond.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <AnimatedSection key={pillar.title} delay={i * 120} direction="up">
                <div
                  style={{
                    background: "var(--color-surface)",
                    border: `1px solid ${pillar.border}`,
                    borderRadius: "1.25rem",
                    padding: "2.25rem 2rem",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    transition: "all 0.35s ease",
                    boxShadow: "var(--shadow-sm)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  className="pillar-card"
                >
                  {/* Top accent bar */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: "3px",
                    background: `linear-gradient(90deg, ${pillar.accent}, transparent)`,
                    borderRadius: "9999px 9999px 0 0",
                  }} />

                  {/* Icon */}
                  <div style={{
                    width: "3.5rem", height: "3.5rem", borderRadius: "1rem",
                    background: pillar.bg, border: `1px solid ${pillar.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <pillar.Icon size={22} color={pillar.accent} strokeWidth={2} />
                  </div>

                  <h3 style={{ color: "var(--color-text)", fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.3 }}>
                    {pillar.title}
                  </h3>
                  <p style={{ fontSize: "0.9375rem", color: "var(--color-text-2)", lineHeight: 1.75 }}>
                    {pillar.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMPACT NUMBERS ─── */}
      <ImpactSection />

      {/* ─── PROJECTS ─── */}
      <ProjectShowcase projects={featuredProjects} />

      {/* ─── TECH STACK MARQUEE ─── */}
      <TechMarquee skills={skills} />

      {/* ─── BLOG ─── */}
      <FeaturedBlogCards posts={featuredPosts} />

      {/* ─── CTA ─── */}
      <section className="section" aria-label="Call to action" style={{ background: "var(--color-bg)" }}>
        <div className="container">
          <AnimatedSection direction="up">
            <div style={{
              position: "relative",
              borderRadius: "2rem",
              overflow: "hidden",
              background: "linear-gradient(135deg, var(--color-primary) 0%, #4f46e5 100%)",
              padding: "5rem 3rem",
              textAlign: "center",
            }}>
              {/* Decorations */}
              <div aria-hidden="true" style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse 60% 80% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)",
              }} />
              <div aria-hidden="true" style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              }} />
              {/* Floating orb */}
              <div aria-hidden="true" style={{
                position: "absolute", bottom: "-4rem", right: "-4rem",
                width: "20rem", height: "20rem", borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{
                  fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.65)",
                  marginBottom: "1.25rem",
                }}>
                  ✦ Open to collaborate
                </p>
                <h2 style={{
                  color: "#ffffff", fontWeight: 800,
                  fontSize: "clamp(2rem, 4vw, 3.25rem)",
                  lineHeight: 1.05, letterSpacing: "-0.03em",
                  marginBottom: "1.25rem", maxWidth: "32rem", marginLeft: "auto", marginRight: "auto",
                }}>
                  Have a project in mind?
                </h2>
                <p style={{
                  color: "rgba(255,255,255,0.82)",
                  maxWidth: "30rem", margin: "0 auto 2.5rem",
                  fontSize: "1.0625rem", lineHeight: 1.75,
                }}>
                  I&apos;m open to consulting, freelance, and collaboration opportunities. Let&apos;s build something meaningful together.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                  <Link
                    href="/contact"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      background: "#ffffff", color: "var(--color-primary)",
                      padding: "0.9375rem 2.25rem", borderRadius: "0.875rem",
                      fontWeight: 700, textDecoration: "none", fontSize: "1rem",
                      transition: "all 0.2s ease", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    }}
                    id="cta-contact-btn"
                  >
                    Start a Conversation
                    <RiArrowRightLine size={18} />
                  </Link>
                  <a
                    href={siteConfig.social.whatsapp}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      background: "rgba(255,255,255,0.12)",
                      color: "#ffffff", padding: "0.9375rem 2.25rem",
                      borderRadius: "0.875rem", fontWeight: 600, textDecoration: "none",
                      fontSize: "1rem", border: "1.5px solid rgba(255,255,255,0.3)",
                      transition: "all 0.2s ease",
                    }}
                    id="cta-whatsapp-btn"
                  >
                    <RiWhatsappLine size={18} />
                    WhatsApp Me
                  </a>
                </div>
                <p style={{ marginTop: "2rem", color: "rgba(255,255,255,0.55)", fontSize: "0.875rem" }}>
                  Or email me at{" "}
                  <a
                    href="mailto:hello@princeparfait.com"
                    style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "3px" }}
                  >
                    hello@princeparfait.com
                  </a>
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
