import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiDownloadLine,
  RiGithubFill,
  RiLinkedinFill,
} from "react-icons/ri";
import { siteConfig, timeline, skills } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Prince Parfait GANZA — software engineer, AI builder, founder of Lerony, and technology entrepreneur based in Kigali, Rwanda.",
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: "About — Prince Parfait GANZA",
    description:
      "Learn about Prince Parfait GANZA — software engineer, AI builder, and founder of Lerony.",
    url: `${siteConfig.url}/about`,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "Prince Parfait GANZA",
    description:
      "Software Engineer, AI Builder, and Founder of Lerony based in Kigali, Rwanda.",
    url: siteConfig.url,
  },
};

const values = [
  {
    title: "Impact First",
    description:
      "Every line of code I write should create measurable value for real people.",
  },
  {
    title: "Craft Matters",
    description:
      "Clean, performant, accessible code is not optional — it&apos;s the standard.",
  },
  {
    title: "Think Long Term",
    description:
      "Building things that last and scale requires patience and architectural discipline.",
  },
  {
    title: "Keep Learning",
    description:
      "Technology evolves rapidly. Staying curious and humble is a non-negotiable.",
  },
];

const skillCategories = ["Frontend", "Backend", "AI/ML", "DevOps"];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Header */}
      <section
        className="section pt-32 pb-16 relative overflow-hidden dot-grid"
        aria-label="About header"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-radial pointer-events-none"
        />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <AnimatedSection>
                <p className="section-label">About Me</p>
                <h1
                  className="text-white mb-5"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Building from Kigali,
                  <br />
                  <span className="text-[#0E52A8]">for the world.</span>
                </h1>
                <p className="text-slate-400 leading-relaxed mb-6 text-lg">
                  I&apos;m <strong className="text-white">Prince Parfait GANZA</strong> — a software
                  engineer, AI builder, and founder based in Kigali, Rwanda. I
                  build full-stack web applications and AI-powered tools that
                  solve real problems across Africa and beyond.
                </p>
                <p className="text-slate-400 leading-relaxed mb-8">
                  As the founder of{" "}
                  <a
                    href="https://lerony.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#60a5fa] hover:underline"
                  >
                    Lerony
                  </a>
                  , I&apos;m building a technology company focused on creating impactful
                  software products for local and global markets. My journey is
                  driven by the belief that code is one of the most powerful tools
                  for social and economic change.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact" className="btn btn-primary">
                    Work With Me
                    <RiArrowRightLine size={16} />
                  </Link>
                  <a
                    href="/resume.pdf"
                    download
                    className="btn btn-outline"
                    aria-label="Download résumé (PDF)"
                  >
                    <RiDownloadLine size={16} />
                    Résumé
                  </a>
                  <a
                    href={siteConfig.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost text-slate-400"
                    aria-label="GitHub profile"
                  >
                    <RiGithubFill size={18} />
                  </a>
                  <a
                    href={siteConfig.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost text-slate-400"
                    aria-label="LinkedIn profile"
                  >
                    <RiLinkedinFill size={18} />
                  </a>
                </div>
              </AnimatedSection>
            </div>

            {/* Logo/Visual */}
            <AnimatedSection delay={200} direction="right">
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-72 h-72 rounded-3xl overflow-hidden glass border border-[rgba(14,82,168,0.3)] flex items-center justify-center p-8">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(14,82,168,0.2) 0%, transparent 60%)",
                    }}
                  />
                  <Image
                    src="/brand/logos/logo-vertical-blue.png"
                    alt="Prince Parfait GANZA logo"
                    width={220}
                    height={220}
                    className="object-contain relative z-10"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-mesh" aria-label="Personal values">
        <div className="container">
          <AnimatedSection className="text-center mb-12">
            <p className="section-label justify-center">Principles</p>
            <h2 className="text-white" style={{ fontFamily: "var(--font-heading)" }}>
              What I stand for.
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((val, i) => (
              <AnimatedSection key={val.title} delay={i * 80}>
                <div className="card glass-hover p-6 h-full">
                  <div className="w-2 h-2 rounded-full bg-[#0E52A8] mb-4" />
                  <h3
                    className="text-white font-semibold mb-2 text-base"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {val.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="section" aria-label="Technical skills">
        <div className="container max-w-4xl">
          <AnimatedSection className="mb-12">
            <p className="section-label">Skills</p>
            <h2 className="text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              My technical toolkit.
            </h2>
          </AnimatedSection>

          <div className="space-y-8">
            {skillCategories.map((category, ci) => {
              const categorySkills = skills.filter((s) => s.category === category);
              return (
                <AnimatedSection key={category} delay={ci * 100}>
                  <div>
                    <h3
                      className="text-xs uppercase tracking-widest font-semibold text-[#0E52A8] mb-3"
                    >
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((skill) => (
                        <span key={skill.name} className="tech-tag">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section bg-mesh" aria-label="Career timeline">
        <div className="container max-w-3xl">
          <AnimatedSection className="mb-12">
            <p className="section-label">Journey</p>
            <h2 className="text-white" style={{ fontFamily: "var(--font-heading)" }}>
              How I got here.
            </h2>
          </AnimatedSection>

          <ol className="relative border-l border-[rgba(14,82,168,0.2)] pl-8 space-y-8">
            {timeline.map((item, i) => (
              <AnimatedSection
                as="li"
                key={`${item.year}-${item.title}`}
                delay={i * 80}
                className="relative"
              >
                {/* Dot */}
                <div
                  className="absolute -left-[2.3rem] top-1 w-4 h-4 rounded-full border-2 border-[#0E52A8] bg-[#050816] flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0E52A8]" />
                </div>

                <div className="card p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3
                      className="text-white font-semibold"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.title}
                    </h3>
                    <time
                      className="text-xs text-[#0E52A8] font-semibold flex-shrink-0 mt-0.5"
                      dateTime={item.year}
                    >
                      {item.year}
                    </time>
                  </div>
                  <p className="text-sm text-[#60a5fa] mb-2 font-medium">
                    {item.organization}
                  </p>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="section" aria-label="Connect">
        <div className="container">
          <AnimatedSection className="text-center">
            <p className="section-label justify-center">Ready to build?</p>
            <h2
              className="text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Let&apos;s work together.
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Whether you have a project, a question, or just want to connect —
              my inbox is always open.
            </p>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Get In Touch
              <RiArrowRightLine size={18} />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
