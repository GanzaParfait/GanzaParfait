import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import { Wrench, Layers, Building2 } from "lucide-react";
import { siteConfig, projects, blogPosts, skills, proofPoints } from "@/data/site-data";
import { PublicEmail } from "@/components/public/PublicContact";
import { buildPageMetadata } from "@/lib/seo";
import { buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import AnimatedSection from "@/components/ui/AnimatedSection";
import HeroSection from "@/components/hero/HeroSection";
import TechMarquee from "@/components/ui/TechMarquee";
import ProjectShowcase from "@/components/ui/ProjectShowcase";
import FeaturedBlogCards from "@/components/ui/FeaturedBlogCards";

export const metadata: Metadata = buildPageMetadata({
  title: "Prince Parfait GANZA | Founder & Software Engineer",
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
  keywords: siteConfig.keywords,
});

const featuredProjects = projects.filter((p) => p.featured);
const featuredPosts = blogPosts.filter((p) => p.featured);

const pillars = [
  {
    Icon: Wrench,
    title: "Software engineering",
    description:
      "Production web applications with authentication, data, APIs, and deployment — built to be used, not demoed.",
  },
  {
    Icon: Layers,
    title: "Business systems",
    description:
      "Operational software for reporting, inventory, administration, and the workflows organizations actually run.",
  },
  {
    Icon: Building2,
    title: "Founder delivery",
    description:
      "Through LERONY Ltd, work moves from a real problem to a shipped system, with a clear commercial path when needed.",
  },
];

export default function HomePage() {
  const homeSchema = buildGraph([
    buildWebPageJsonLd({
      path: "/",
      name: "Prince Parfait GANZA | Founder & Software Engineer",
      description: siteConfig.description,
    }),
  ]);

  return (
    <>
      <JsonLd data={homeSchema} />
      <HeroSection />

      <section className="section" aria-label="Proof" style={{ background: "var(--color-bg-2)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <AnimatedSection className="text-center" style={{ marginBottom: "3rem" }}>
            <p className="section-label justify-center">Proof</p>
            <h2 style={{ color: "var(--color-text)" }}>
              Real work. Named organizations.
            </h2>
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

      <section className="section" aria-label="How I work" style={{ background: "var(--color-bg)" }}>
        <div className="container">
          <AnimatedSection className="text-center" style={{ marginBottom: "4rem" }}>
            <p className="section-label justify-center">How I work</p>
            <h2 style={{ color: "var(--color-text)", marginBottom: "1rem" }}>
              Build. Solve. Deliver.
            </h2>
            <p style={{ color: "var(--color-text-2)", maxWidth: "40rem", margin: "0 auto", fontSize: "1.0625rem" }}>
              I use software to solve organizational and business problems — full-stack products, operational systems, and practical AI where it earns its place.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <AnimatedSection key={pillar.title} delay={i * 100} direction="up">
                <div className="card p-8 h-full pillar-card" style={{ position: "relative", overflow: "hidden" }}>
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                      background: "linear-gradient(90deg, var(--color-primary), transparent)",
                    }}
                  />
                  <div style={{
                    width: "3.25rem", height: "3.25rem", borderRadius: "1rem",
                    background: "rgba(14,82,168,0.08)", border: "1px solid rgba(14,82,168,0.16)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "1.25rem",
                  }}>
                    <pillar.Icon size={22} color="var(--color-primary)" strokeWidth={2} />
                  </div>
                  <h3 style={{ color: "var(--color-text)", fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.75rem" }}>
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

      <ProjectShowcase projects={featuredProjects} />

      <TechMarquee skills={skills} />

      {featuredPosts.length > 0 && <FeaturedBlogCards posts={featuredPosts} />}

      <section className="section" aria-label="Call to action" style={{ background: "var(--color-bg)" }}>
        <div className="container">
          <AnimatedSection direction="up">
            <div className="cta-band">
              <p className="section-label justify-center" style={{ color: "rgba(255,255,255,0.7)" }}>
                Work together
              </p>
              <h2 style={{
                color: "#ffffff",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.1,
                marginBottom: "1rem",
              }}>
                Building something that needs to ship?
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.82)",
                maxWidth: "32rem",
                margin: "0 auto 2rem",
                fontSize: "1.0625rem",
              }}>
                I work with organizations, founders, and teams on software systems, digital products, and practical AI integration. Larger commercial work can run through LERONY Ltd.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem" }}>
                <Link href="/contact" className="btn btn-lg" style={{ background: "#fff", color: "var(--color-primary)", fontWeight: 700 }}>
                  Start a conversation
                  <RiArrowRightLine size={18} />
                </Link>
                <Link href="/projects" className="btn btn-lg" style={{ background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.35)", fontWeight: 600 }}>
                  View selected work
                </Link>
              </div>
              <p style={{ marginTop: "1.75rem", color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>
                <PublicEmail style={{ color: "#fff", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "3px" }} />
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
