"use client";

import AnimatedSection from "@/components/ui/AnimatedSection";
import { proofPoints } from "@/data/site-data";

export default function ImpactSection() {
  return (
    <section
      aria-label="Proof"
      className="section"
      style={{ background: "var(--color-bg-2)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="container">
        <AnimatedSection className="text-center" style={{ marginBottom: "3rem" }}>
          <p className="section-label justify-center">Proof</p>
          <h2 style={{ color: "var(--color-text)" }}>Named work, not invented metrics.</h2>
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {proofPoints.map((point, i) => (
            <AnimatedSection key={point.label} delay={i * 80} direction="up">
              <div className="card p-6 h-full">
                <p className="section-label" style={{ marginBottom: "0.75rem" }}>{point.label}</p>
                <p style={{ color: "var(--color-text)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.35rem" }}>
                  {point.value}
                </p>
                <p style={{ color: "var(--color-text-3)", fontSize: "0.875rem" }}>{point.detail}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
