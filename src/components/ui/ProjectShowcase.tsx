"use client";

import Link from "next/link";
import { RiArrowRightLine, RiExternalLinkLine, RiGithubFill } from "react-icons/ri";
import { Building2, Sprout, Shield, Package } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import type { Project } from "@/data/site-data";

const projectMeta: Record<string, {
  accent: string;
  bg: string;
  tag: string;
  Icon: React.ElementType;
  iconColor: string;
}> = {
  lerony: {
    accent: "#0e52a8",
    bg: "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)",
    tag: "SaaS Platform",
    Icon: Building2,
    iconColor: "#0e52a8",
  },
  agrivoice: {
    accent: "#10b981",
    bg: "linear-gradient(135deg, #d1fae5 0%, #e0f2fe 100%)",
    tag: "AI Product",
    Icon: Sprout,
    iconColor: "#10b981",
  },
  "tut-labs": {
    accent: "#6366f1",
    bg: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)",
    tag: "Security Tech",
    Icon: Shield,
    iconColor: "#6366f1",
  },
};

const statusLabel: Record<string, { label: string; color: string }> = {
  live:        { label: "Live", color: "#10b981" },
  "in-progress": { label: "In Progress", color: "#f59e0b" },
  archived:    { label: "Archived", color: "#94a3b8" },
};

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  return (
    <section className="section" aria-label="Featured projects" style={{ background: "var(--color-bg-2)" }}>
      <div className="container">
        <AnimatedSection style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "3.5rem", flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <p className="section-label">Featured Projects</p>
            <h2 style={{ color: "var(--color-text)" }}>
              Things I&apos;ve <span className="hero-name-gradient">built.</span>
            </h2>
          </div>
          <Link href="/projects" className="btn btn-ghost" style={{ color: "var(--color-text-2)", fontWeight: 600 }}>
            All Projects <RiArrowRightLine size={16} />
          </Link>
        </AnimatedSection>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {projects.map((project, i) => {
            const meta = projectMeta[project.id] ?? {
              accent: "#0e52a8",
              bg: "linear-gradient(135deg, #f0f6ff 0%, #e8f4fe 100%)",
              tag: project.category,
              Icon: Package,
              iconColor: "#0e52a8",
            };
            const { Icon, iconColor } = meta;
            const isReversed = i % 2 === 1;
            const status = statusLabel[project.status] ?? { label: project.status, color: "#94a3b8" };

            return (
              <AnimatedSection key={project.id} delay={i * 100} direction="up">
                <div
                  className="project-row-card grid grid-cols-1 lg:grid-cols-2"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "1.5rem",
                    overflow: "hidden",
                    transition: "all 0.4s ease",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {/* Visual side */}
                  <div
                    style={{
                      background: meta.bg,
                      padding: "3rem 2.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "16rem",
                      order: isReversed ? 2 : 1,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Decorative rings */}
                    <div aria-hidden="true" style={{
                      position: "absolute",
                      width: "18rem", height: "18rem", borderRadius: "50%",
                      border: `1px solid ${meta.accent}20`,
                      top: "-4rem", right: "-4rem",
                    }} />
                    <div aria-hidden="true" style={{
                      position: "absolute",
                      width: "12rem", height: "12rem", borderRadius: "50%",
                      border: `1px solid ${meta.accent}15`,
                      bottom: "-3rem", left: "-3rem",
                    }} />

                    {/* Icon + tag */}
                    <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                      {/* Icon circle */}
                      <div style={{
                        width: "5.5rem", height: "5.5rem", borderRadius: "1.5rem",
                        background: `${meta.accent}15`,
                        border: `2px solid ${meta.accent}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 1.25rem",
                        boxShadow: `0 8px 24px ${meta.accent}20`,
                      }}>
                        <Icon size={32} color={iconColor} strokeWidth={1.75} />
                      </div>

                      {/* Category tag */}
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        background: `${meta.accent}15`,
                        border: `1px solid ${meta.accent}30`,
                        borderRadius: "9999px",
                        padding: "0.375rem 1rem",
                        fontSize: "0.75rem", fontWeight: 700,
                        color: meta.accent, letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}>
                        {meta.tag}
                      </div>
                    </div>
                  </div>

                  {/* Content side */}
                  <div style={{
                    padding: "2.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "1rem",
                    order: isReversed ? 1 : 2,
                  }}>
                    {/* Status + year */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      fontSize: "0.75rem", fontWeight: 600,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      <span style={{
                        width: "0.5rem", height: "0.5rem", borderRadius: "50%",
                        background: status.color, display: "inline-block",
                      }} />
                      <span style={{ color: status.color }}>{status.label}</span>
                      <span style={{ color: "var(--color-border)" }}>|</span>
                      <span style={{ color: "var(--color-text-3)" }}>{project.year}</span>
                    </div>

                    <h3 style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "clamp(1.375rem, 2.5vw, 1.875rem)",
                      fontWeight: 800, color: "var(--color-text)",
                      lineHeight: 1.2, letterSpacing: "-0.02em",
                    }}>
                      {project.title}
                    </h3>

                    <p style={{ color: "var(--color-text-2)", lineHeight: 1.8, fontSize: "1rem" }}>
                      {project.description}
                    </p>

                    {/* Tech tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span key={tech} className="tech-tag" style={{ fontSize: "0.75rem" }}>
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="tech-tag" style={{ fontSize: "0.75rem" }}>
                          +{project.technologies.length - 5}
                        </span>
                      )}
                    </div>

                    {/* Links */}
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                      {project.links.live && (
                        <a
                          href={project.links.live}
                          target="_blank" rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ fontWeight: 700 }}
                        >
                          Visit Project
                          <RiExternalLinkLine size={14} />
                        </a>
                      )}
                      {project.links.github && (
                        <a
                          href={project.links.github}
                          target="_blank" rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ fontWeight: 600 }}
                        >
                          <RiGithubFill size={14} />
                          View Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
