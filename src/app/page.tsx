import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  RiArrowRightLine,
  RiDownloadLine,
  RiWhatsappLine,
  RiGithubFill,
  RiLinkedinFill,
  RiTwitterXFill,
  RiYoutubeFill,
  RiInstagramLine,
  RiTiktokFill,
  RiMapPinLine,
} from "react-icons/ri";
import { siteConfig, projects, blogPosts, skills } from "@/data/site-data";
import ProjectCard from "@/components/ui/ProjectCard";
import BlogCard from "@/components/ui/BlogCard";
import AnimatedSection from "@/components/ui/AnimatedSection";

import HeroSection from "@/components/hero/HeroSection";

export const metadata: Metadata = {
  title: "Prince Parfait GANZA — Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

const featuredProjects = projects.filter((p) => p.featured);
const featuredPosts    = blogPosts.filter((p) => p.featured);

const pillars = [
  {
    icon: "🛠️",
    title: "Full-Stack Engineering",
    description: "End-to-end web applications with Next.js, TypeScript, and modern backend technologies.",
  },
  {
    icon: "🤖",
    title: "AI Integration",
    description: "Embedding AI into products to solve real-world problems and automate complex workflows.",
  },
  {
    icon: "🚀",
    title: "Product Thinking",
    description: "Building software that solves genuine problems — from concept to shipped product.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Dynamic Hero — Swappable between Split & Tony Robbins layouts */}
      <HeroSection />

      {/* ============================================================
          WHAT I DO
          ============================================================ */}
      <section className="section bg-mesh" aria-label="Core competencies">
        <div className="container">
          <AnimatedSection className="text-center mb-14">
            <p className="section-label justify-center">What I Do</p>
            <h2 style={{ color: "var(--color-text)", marginBottom: "1rem" }}>
              Engineering with purpose.
            </h2>
            <p style={{ color: "var(--color-text-2)", maxWidth: "38rem", margin: "0 auto" }}>
              I combine deep technical expertise with a product mindset to build software that solves real problems.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <AnimatedSection key={pillar.title} delay={i * 100} direction="up">
                <div className="card glass-hover" style={{ padding: "2rem", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "1rem",
                    background: "rgba(14,82,168,0.08)",
                    border: "1px solid rgba(14,82,168,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                    fontSize: "1.5rem",
                  }}>
                    {pillar.icon}
                  </div>
                  <h3 style={{ color: "var(--color-text)", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                    {pillar.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-text-2)", lineHeight: 1.7 }}>
                    {pillar.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED PROJECTS
          ============================================================ */}
      <section className="section" aria-label="Featured projects">
        <div className="container">
          <AnimatedSection style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p className="section-label">Featured Projects</p>
              <h2 style={{ color: "var(--color-text)" }}>Things I&apos;ve built.</h2>
            </div>
            <Link href="/projects" className="btn btn-ghost" style={{ color: "var(--color-text-2)" }}>
              All Projects <RiArrowRightLine size={16} />
            </Link>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, i) => (
              <AnimatedSection key={project.id} delay={i * 80}>
                <ProjectCard project={project} featured />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SKILLS
          ============================================================ */}
      <section className="section bg-mesh" aria-label="Technical skills">
        <div className="container">
          <AnimatedSection className="text-center mb-12">
            <p className="section-label justify-center">Technology</p>
            <h2 style={{ color: "var(--color-text)", marginBottom: "1rem" }}>The tools I work with.</h2>
          </AnimatedSection>
          <AnimatedSection direction="fade" delay={100}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.625rem", maxWidth: "48rem", margin: "0 auto" }}>
              {skills.map((skill) => (
                <span key={skill.name} className="tech-tag" style={{ fontSize: "0.8125rem", padding: "0.35rem 0.875rem" }}>
                  {skill.name}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================
          BLOG
          ============================================================ */}
      <section className="section" aria-label="Recent blog posts">
        <div className="container">
          <AnimatedSection style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p className="section-label">Blog</p>
              <h2 style={{ color: "var(--color-text)" }}>Thoughts &amp; ideas.</h2>
            </div>
            <Link href="/blog" className="btn btn-ghost" style={{ color: "var(--color-text-2)" }}>
              All Posts <RiArrowRightLine size={16} />
            </Link>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.map((post, i) => (
              <AnimatedSection key={post.id} delay={i * 100}>
                <BlogCard post={post} featured />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA
          ============================================================ */}
      <section className="section" aria-label="Call to action">
        <div className="container">
          <AnimatedSection direction="up">
            <div style={{
              position: "relative",
              borderRadius: "1.5rem",
              overflow: "hidden",
              background: "var(--color-primary)",
              padding: "4rem 3rem",
              textAlign: "center",
            }}>
              {/* Decoration */}
              <div aria-hidden="true" style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
              }} />
              <div aria-hidden="true" style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
                  <div style={{ position: "relative", width: "4rem", height: "4rem" }}>
                    <Image src="/brand/icons/icon-white.png" alt="Prince Parfait GANZA" fill className="object-contain" />
                  </div>
                </div>
                <h2 style={{ color: "#ffffff", marginBottom: "1rem", maxWidth: "30rem", margin: "0 auto 1rem" }}>
                  Have a project in mind?
                </h2>
                <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: "30rem", margin: "0 auto 2rem", fontSize: "1.0625rem" }}>
                  I&apos;m open to consulting, freelance, and collaboration opportunities. Let&apos;s build something meaningful.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                  <Link href="/contact" style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#ffffff",
                    color: "var(--color-primary)",
                    padding: "0.875rem 2rem",
                    borderRadius: "0.75rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: "1rem",
                    transition: "all 0.2s ease",
                  }}>
                    Start a Conversation
                    <RiArrowRightLine size={18} />
                  </Link>
                  <a
                    href={siteConfig.social.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      padding: "0.875rem 2rem",
                      borderRadius: "0.75rem",
                      fontWeight: 500,
                      textDecoration: "none",
                      fontSize: "1rem",
                      border: "1px solid rgba(255,255,255,0.25)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <RiWhatsappLine size={18} />
                    WhatsApp Me
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
