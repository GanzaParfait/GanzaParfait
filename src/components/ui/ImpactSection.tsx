"use client";

import AnimatedSection from "@/components/ui/AnimatedSection";
import { Rocket, Wrench, Building2, Globe } from "lucide-react";

const stats = [
  {
    Icon: Rocket,
    value: "15+",
    label: "Projects Shipped",
    description: "From SaaS to AI tools",
    accent: "#0e52a8",
    bg: "rgba(14,82,168,0.07)",
  },
  {
    Icon: Wrench,
    value: "3+",
    label: "Years Building",
    description: "Full-stack & AI engineering",
    accent: "#6366f1",
    bg: "rgba(99,102,241,0.07)",
  },
  {
    Icon: Building2,
    value: "3",
    label: "Companies Founded",
    description: "Including Lerony & TUT Labs",
    accent: "#0ea5e9",
    bg: "rgba(14,165,233,0.07)",
  },
  {
    Icon: Globe,
    value: "🌍",
    label: "African Impact",
    description: "Building for Africa & beyond",
    accent: "#10b981",
    bg: "rgba(16,185,129,0.07)",
  },
];

export default function ImpactSection() {
  return (
    <section
      aria-label="Impact statistics"
      className="section bg-mesh"
      style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="container">
        <AnimatedSection className="text-center" style={{ marginBottom: "3.5rem" }}>
          <p className="section-label justify-center">Impact</p>
          <h2 style={{ color: "var(--color-text)" }}>
            Building with <span className="hero-name-gradient">intention.</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 80} direction="up">
              <div
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "1.25rem",
                  padding: "2rem 1.5rem",
                  textAlign: "center",
                  transition: "all 0.35s ease",
                  boxShadow: "var(--shadow-sm)",
                  position: "relative",
                  overflow: "hidden",
                }}
                className="impact-card"
              >
                {/* Top accent */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                  background: `linear-gradient(90deg, ${stat.accent}, transparent)`,
                }} />

                {/* Icon */}
                <div style={{
                  width: "3rem", height: "3rem", borderRadius: "0.875rem",
                  background: stat.bg,
                  border: `1px solid ${stat.accent}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1rem",
                }}>
                  {stat.value === "🌍"
                    ? <Globe size={20} color={stat.accent} strokeWidth={2} />
                    : <stat.Icon size={20} color={stat.accent} strokeWidth={2} />
                  }
                </div>

                <p style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
                  fontWeight: 800, color: stat.accent,
                  lineHeight: 1, marginBottom: "0.5rem",
                  letterSpacing: "-0.03em",
                }}>
                  {stat.value === "🌍" ? "∞" : stat.value}
                </p>
                <p style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-3)" }}>
                  {stat.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Quote */}
        <AnimatedSection style={{ marginTop: "3.5rem" }}>
          <div style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "1.5rem",
            padding: "2.5rem 2.5rem 2.5rem 3rem",
            position: "relative",
            overflow: "hidden",
          }}>
            <div aria-hidden="true" style={{
              position: "absolute", top: 0, left: 0, bottom: 0,
              width: "4px",
              background: "linear-gradient(180deg, var(--color-primary), #6366f1)",
              borderRadius: "4px 0 0 4px",
            }} />
            <div aria-hidden="true" style={{
              position: "absolute", top: "-2rem", right: "-1rem",
              fontSize: "8rem", fontFamily: "Georgia, serif",
              color: "rgba(14,82,168,0.06)", lineHeight: 1,
              pointerEvents: "none", userSelect: "none",
            }}>
              &ldquo;
            </div>
            <blockquote>
              <p style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
                fontWeight: 700, color: "var(--color-text)",
                lineHeight: 1.5, letterSpacing: "-0.02em",
                marginBottom: "1rem",
              }}>
                &ldquo;I believe code is one of the most powerful tools for social change. Every line written with purpose can ripple across communities, economies, and generations.&rdquo;
              </p>
              <footer style={{ fontSize: "0.875rem", color: "var(--color-text-3)", fontWeight: 600 }}>
                — Prince Parfait GANZA
              </footer>
            </blockquote>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
