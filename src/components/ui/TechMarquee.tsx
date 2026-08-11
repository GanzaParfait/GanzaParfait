"use client";

import { Skill } from "@/data/site-data";

export default function TechMarquee({ skills }: { skills: Skill[] }) {
  // Pure CSS animation — no JS needed for smooth infinite scroll
  return (
    <section
      aria-label="Technology stack"
      style={{
        padding: "5rem 0",
        background: "var(--color-bg-2)",
        overflow: "hidden",
        position: "relative",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Gradient edge masks */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        width: "8rem",
        background: "linear-gradient(90deg, var(--color-bg-2), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: "8rem",
        background: "linear-gradient(270deg, var(--color-bg-2), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />

      <div className="container" style={{ marginBottom: "2.5rem" }}>
        <div style={{ textAlign: "center" }}>
          <p className="section-label justify-center">Technology</p>
          <h2 style={{ color: "var(--color-text)", marginBottom: "0.75rem" }}>
            The tools I work with.
          </h2>
          <p style={{ color: "var(--color-text-2)", maxWidth: "36rem", margin: "0 auto" }}>
            A curated stack built for speed, scale, and real-world impact.
          </p>
        </div>
      </div>

      {/* Row 1 — left to right */}
      <div style={{ marginBottom: "1rem", overflow: "hidden" }}>
        <div className="marquee-track marquee-left">
          {[...skills, ...skills].map((skill, i) => (
            <div key={i} className="marquee-chip">
              <span className="marquee-chip-dot" style={{ background: getCategoryColor(skill.category) }} />
              <span style={{ fontWeight: 600 }}>{skill.name}</span>
              <span style={{ fontSize: "0.7rem", opacity: 0.6, marginLeft: "0.25rem" }}>
                {skill.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — right to left */}
      <div style={{ overflow: "hidden" }}>
        <div className="marquee-track marquee-right">
          {[...skills.slice().reverse(), ...skills.slice().reverse()].map((skill, i) => (
            <div key={i} className="marquee-chip marquee-chip-alt">
              <span className="marquee-chip-dot" style={{ background: getCategoryColor(skill.category) }} />
              <span style={{ fontWeight: 600 }}>{skill.name}</span>
              <span style={{ fontSize: "0.7rem", opacity: 0.6, marginLeft: "0.25rem" }}>
                {skill.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Frontend: "#0e52a8",
    Backend:  "#6366f1",
    "AI/ML":  "#0ea5e9",
    DevOps:   "#10b981",
  };
  return colors[category] ?? "#94a3b8";
}
