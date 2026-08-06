import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  RiArrowRightLine,
  RiDownloadLine,
  RiMapPinLine,
  RiCodeSSlashLine,
  RiBrainLine,
  RiRocketLine,
} from "react-icons/ri";
import { siteConfig, projects, blogPosts, skills } from "@/data/site-data";
import ProjectCard from "@/components/ui/ProjectCard";
import BlogCard from "@/components/ui/BlogCard";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Prince Parfait GANZA — Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

const featuredProjects = projects.filter((p) => p.featured);
const featuredPosts = blogPosts.filter((p) => p.featured);

const stats = [
  { value: "3+", label: "Years Building" },
  { value: "15+", label: "Projects Shipped" },
  { value: "5+", label: "Products Live" },
  { value: "1", label: "Company Founded" },
];

const pillars = [
  {
    icon: RiCodeSSlashLine,
    title: "Full-Stack Engineering",
    description:
      "Building end-to-end web applications with Next.js, TypeScript, and modern backend technologies.",
  },
  {
    icon: RiBrainLine,
    title: "AI Integration",
    description:
      "Embedding AI capabilities into products to solve real-world problems and automate complex tasks.",
  },
  {
    icon: RiRocketLine,
    title: "Product Thinking",
    description:
      "Building software that solves genuine problems — from concept to shipped product with measurable impact.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden dot-grid"
        aria-label="Hero — Introduction"
      >
        {/* Background radial glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-radial pointer-events-none"
        />

        {/* Blue sphere glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, #0E52A8 0%, transparent 70%)",
          }}
        />

        <div className="container relative z-10 pt-28 pb-16 text-center">
          {/* Status badge */}
          <AnimatedSection delay={0} direction="fade">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 text-sm">
              <span
                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                aria-hidden="true"
              />
              <span className="text-slate-400">
                Available for freelance &amp; consulting
              </span>
              <RiMapPinLine size={13} className="text-[#0E52A8]" />
              <span className="text-slate-500 text-xs">Kigali, Rwanda</span>
            </div>
          </AnimatedSection>

          {/* Headline */}
          <AnimatedSection delay={100}>
            <h1
              className="font-bold leading-tight tracking-tight text-white mb-5 max-w-4xl mx-auto"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Building software
              <br />
              <span className="text-[#0E52A8] glow-text">that creates impact.</span>
            </h1>
          </AnimatedSection>

          {/* Subheadline */}
          <AnimatedSection delay={200}>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
              I&apos;m <strong className="text-white font-medium">Prince Parfait GANZA</strong> — software engineer,
              AI builder, and founder of{" "}
              <a
                href="https://lerony.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#60a5fa] hover:underline"
              >
                Lerony
              </a>
              . I build full-stack products and integrate AI to solve real-world problems across Africa.
            </p>
          </AnimatedSection>

          {/* CTAs */}
          <AnimatedSection delay={300}>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              <Link href="/projects" className="btn btn-primary btn-lg">
                View My Work
                <RiArrowRightLine size={18} />
              </Link>
              <Link href="/contact" className="btn btn-outline btn-lg">
                Let&apos;s Collaborate
              </Link>
            </div>
          </AnimatedSection>

          {/* Logo */}
          <AnimatedSection delay={400} direction="fade">
            <div className="flex justify-center mb-16">
              <div className="relative w-72 sm:w-96 h-24 opacity-60 hover:opacity-90 transition-opacity duration-300">
                <Image
                  src="/brand/logos/wordmark-horizontal-light.png"
                  alt="Prince Parfait GANZA wordmark"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection delay={500} direction="fade">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-xl p-4 text-center"
                >
                  <p
                    className="text-3xl font-bold text-white mb-0.5"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
          aria-hidden="true"
        >
          <span className="text-xs text-slate-600 uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#0E52A8] to-transparent" />
        </div>
      </section>

      {/* ============================================================
          WHAT I DO
          ============================================================ */}
      <section className="section bg-mesh" aria-label="Core competencies">
        <div className="container">
          <AnimatedSection className="text-center mb-14">
            <p className="section-label justify-center">What I Do</p>
            <h2
              className="text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Engineering with purpose.
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              I combine deep technical expertise with a product mindset to
              build software that solves real problems and creates lasting impact.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <AnimatedSection key={pillar.title} delay={i * 100} direction="up">
                <div className="card glass-hover p-8 text-center h-full flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(14,82,168,0.15)] border border-[rgba(14,82,168,0.25)] flex items-center justify-center mb-5 text-[#60a5fa]">
                    <pillar.icon size={26} />
                  </div>
                  <h3
                    className="text-white text-lg font-semibold mb-3"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
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
          <AnimatedSection className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="section-label">Featured Projects</p>
              <h2
                className="text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Things I&apos;ve built.
              </h2>
            </div>
            <Link
              href="/projects"
              className="btn btn-ghost text-slate-400 hover:text-white"
            >
              All Projects
              <RiArrowRightLine size={16} />
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
            <h2
              className="text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              The tools I work with.
            </h2>
          </AnimatedSection>

          <AnimatedSection direction="fade" delay={100}>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
              {skills.map((skill) => (
                <span key={skill.name} className="tech-tag text-sm px-3 py-1.5">
                  {skill.name}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================
          BLOG POSTS
          ============================================================ */}
      <section className="section" aria-label="Recent blog posts">
        <div className="container">
          <AnimatedSection className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="section-label">Blog</p>
              <h2
                className="text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Thoughts &amp; ideas.
              </h2>
            </div>
            <Link
              href="/blog"
              className="btn btn-ghost text-slate-400 hover:text-white"
            >
              All Posts
              <RiArrowRightLine size={16} />
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
          CTA — WORK TOGETHER
          ============================================================ */}
      <section className="section" aria-label="Call to action">
        <div className="container">
          <AnimatedSection direction="up">
            <div className="relative rounded-2xl overflow-hidden">
              {/* Background */}
              <div
                className="absolute inset-0 bg-[#0B192C]"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(14, 82, 168, 0.2) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0E52A8] to-transparent opacity-50" aria-hidden="true" />

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-center">
                {/* PPG Icon */}
                <div className="inline-flex mb-6">
                  <div className="relative w-16 h-16">
                    <Image
                      src="/brand/icons/icon-blue.png"
                      alt="Prince Parfait GANZA"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <h2
                  className="text-white mb-4 max-w-2xl mx-auto"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Have a project in mind?
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">
                  I&apos;m open to consulting, freelance, and collaboration
                  opportunities. Let&apos;s build something meaningful together.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/contact" className="btn btn-primary btn-lg">
                    Start a Conversation
                    <RiArrowRightLine size={18} />
                  </Link>
                  <a
                    href="/resume.pdf"
                    download
                    className="btn btn-outline btn-lg"
                    aria-label="Download CV (PDF)"
                  >
                    <RiDownloadLine size={18} />
                    Download CV
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
