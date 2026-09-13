import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import { siteConfig, projects, blogPosts, identity, timeline } from "@/data/site-data";
import { buildPageMetadata } from "@/lib/seo";
import { PORTRAIT_PATH, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import AnimatedSection from "@/components/ui/AnimatedSection";
import HeroSection from "@/components/hero/HeroSection";
import ProjectShowcase from "@/components/ui/ProjectShowcase";
import FeaturedBlogCards from "@/components/ui/FeaturedBlogCards";
import BookCall from "@/components/ui/BookCall";

export const metadata: Metadata = buildPageMetadata({
  title: identity.pageTitle,
  description: identity.description,
  path: "/",
  absoluteTitle: true,
  keywords: siteConfig.keywords,
});

const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);
const featuredPosts = blogPosts.filter((p) => p.featured);
const pathSteps = [
  { n: "01", title: "Who", body: "Founder, entrepreneur, and technologist in Kigali. Software engineer and AI builder is the work that brings projects." },
  { n: "02", title: "Proof", body: "Selected work shows the problem, the contribution, and the status. No invented metrics." },
  { n: "03", title: "Venture", body: "LERONY Ltd is the company. This site remains the person." },
  { n: "04", title: "Start", body: "A brief, a WhatsApp note, or a proposed time on Google Calendar." },
];

export default function HomePage() {
  const homeSchema = buildGraph([
    buildWebPageJsonLd({
      path: "/",
      name: identity.pageTitle,
      description: identity.description,
    }),
  ]);

  return (
    <>
      <JsonLd data={homeSchema} />
      <HeroSection />

      <section className="section path-section" aria-label="How to read this site">
        <div className="container">
          <AnimatedSection style={{ maxWidth: "40rem", marginBottom: "1.75rem" }}>
            <p className="section-label">The path</p>
            <h2>Four steps. Then a conversation.</h2>
          </AnimatedSection>
          <ol className="path-grid">
            {pathSteps.map((step) => (
              <li key={step.n} className="path-step">
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ProjectShowcase projects={featuredProjects} />

      <section className="stage-band" aria-label="Positioning">
        <img
          src={PORTRAIT_PATH}
          alt="Prince Parfait GANZA"
          width={1024}
          height={919}
          className="stage-band-photo"
        />
        <div className="container stage-band-copy">
          <p className="section-label">Kigali</p>
          <h2>{identity.positioning}</h2>
          <p>{identity.shortBio}</p>
          <Link href="/about" className="btn btn-primary">
            About the person
            <RiArrowRightLine size={16} />
          </Link>
        </div>
      </section>

      <section className="section" aria-label="Timeline" style={{ background: "var(--color-bg)" }}>
        <div className="container">
          <AnimatedSection style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <div>
              <p className="section-label">Timeline</p>
              <h2>The record, in order.</h2>
            </div>
            <Link href="/experience" className="btn btn-outline">
              Full experience
              <RiArrowRightLine size={16} />
            </Link>
          </AnimatedSection>
          <ol className="home-timeline">
            {timeline.map((item) => (
              <li key={`${item.year}-${item.title}`}>
                <p>{item.year}</p>
                <h3>{item.title}</h3>
                <p className="home-timeline-org">{item.organization}</p>
                <p>{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-label="Ventures" style={{ background: "var(--color-bg-2)" }}>
        <div className="container venture-split">
          <div>
            <p className="section-label">Ventures</p>
            <h2>Ownership, not a service menu.</h2>
            <p style={{ color: "var(--color-text-2)", marginTop: "0.85rem" }}>
              {siteConfig.company.role} of {siteConfig.company.name}. The company is the commercial home. This site remains the person.
            </p>
          </div>
          <article className="venture-card">
            <p className="section-label">{siteConfig.company.established} · Kigali</p>
            <h3>{siteConfig.company.name}</h3>
            <p>{siteConfig.company.summary}</p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/ventures" className="btn btn-primary">
                The venture
                <RiArrowRightLine size={16} />
              </Link>
              <a href={siteConfig.company.url} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
                lerony.com
              </a>
            </div>
          </article>
        </div>
      </section>

      {featuredPosts.length > 0 && <FeaturedBlogCards posts={featuredPosts} />}

      <section className="section book-section" aria-label="Book a call">
        <div className="container book-panel">
          <div>
            <p className="section-label">Book a call</p>
            <h2>Propose a time, or start with a brief.</h2>
            <p>
              Google Calendar opens a call with Prince Parfait GANZA and invites hello@princeparfait.com. WhatsApp is the faster path for a short question.
            </p>
          </div>
          <BookCall />
        </div>
      </section>
    </>
  );
}
