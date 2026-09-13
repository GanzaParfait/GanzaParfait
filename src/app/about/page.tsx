import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiGithubFill,
  RiLinkedinFill,
} from "react-icons/ri";
import { siteConfig, timeline, skills, education } from "@/data/site-data";
import { PublicSocialAnchor } from "@/components/public/PublicContact";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildProfilePageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = buildPageMetadata({
  title: "About Prince Parfait GANZA | Founder, Entrepreneur & Technologist",
  description:
    "The founder story of Prince Parfait GANZA: leading Lerony from Kigali, building technology, products and ventures, with software engineering as evidence rather than the ceiling.",
  path: "/about",
  ogType: "profile",
  absoluteTitle: true,
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

const values = [
  {
    title: "Evidence over claims",
    description: "Work should stand on real systems, named organizations, and clear contribution — not adjectives.",
  },
  {
    title: "Ship what operations need",
    description: "The useful product is the one staff can log into, report from, and run a process on.",
  },
  {
    title: "Separate person and company",
    description: "This site is the person. LERONY Ltd is the commercial brand for larger delivery.",
  },
  {
    title: "Keep learning visible",
    description: "University Computer Science is ongoing. That is stated plainly, not dressed up as a finished credential.",
  },
];

const skillCategories = ["Frontend", "Backend", "Data", "Infrastructure"];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildProfilePageJsonLd({
            path: "/about",
            name: "About Prince Parfait GANZA | Founder, Entrepreneur & Technologist",
            description: metadata.description as string,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/about"),
        ])}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <section className="section page-intro" aria-label="About header">
        <div className="container page-intro-grid">
          <div>
            <p className="section-label">About</p>
            <h1 className="page-title">Founder, entrepreneur, and the person who builds the system.</h1>
            <p className="theme-copy leading-relaxed mb-6 text-lg">{siteConfig.shortIntro}</p>
                <p className="theme-copy leading-relaxed mb-6">
                  Founder names the authority: he leads {siteConfig.company.name} and decides what gets built. Entrepreneur names the form of the work: ideas are turned into ventures with a commercial path, not left as tasks. Technologist names the instrument. Software Engineer and AI Builder name the work that brings projects: the software and AI systems he builds.
                </p>
                <ul className="flex flex-wrap gap-2 mb-8" aria-label="Roles and positions">
                  {siteConfig.positioning.split(/\s*[•·]\s*/).map((role) => (
                    <li
                      key={role}
                      className="text-sm font-semibold"
                      style={{
                        padding: "0.35rem 0.75rem",
                        borderRadius: "999px",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                      }}
                    >
                      {role}
                    </li>
                  ))}
                  <li
                    className="text-sm font-semibold"
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "999px",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-2)",
                    }}
                  >
                    {siteConfig.company.role}, {siteConfig.company.name} · {siteConfig.company.established}
                  </li>
                  <li
                    className="text-sm font-semibold"
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "999px",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-2)",
                    }}
                  >
                    {siteConfig.contact.location}
                  </li>
                </ul>
                <p className="theme-copy leading-relaxed mb-8">
                  In 2025 I founded{" "}
                  <a href={siteConfig.company.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                    {siteConfig.company.name}
                  </a>
                  , a technology and innovation company in Kigali. This site is about the person, the work, and the evidence. The company brand lives at lerony.com.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact" className="btn btn-primary">
                    Work with me
                    <RiArrowRightLine size={16} />
                  </Link>
                  <Link href="/experience" className="btn btn-outline">
                    Experience
                  </Link>
                  <PublicSocialAnchor platform="github" className="btn btn-ghost">
                    <RiGithubFill size={18} />
                  </PublicSocialAnchor>
                  <PublicSocialAnchor platform="linkedin" className="btn btn-ghost">
                    <RiLinkedinFill size={18} />
                  </PublicSocialAnchor>
                </div>
            </div>

            <AnimatedSection delay={160} direction="right">
              <figure className="portrait-frame">
                <Image
                  src="/images/profile/prince-parfait-ganza-kigali-rwanda.webp"
                  alt="Prince Parfait GANZA"
                  width={1024}
                  height={919}
                  sizes="(max-width: 900px) 100vw, 28rem"
                  priority
                />
                <figcaption>Prince Parfait GANZA</figcaption>
              </figure>
            </AnimatedSection>
          </div>
      </section>

      <section className="section" aria-label="Education" style={{ background: "var(--color-bg-2)" }}>
        <div className="container max-w-4xl">
          <AnimatedSection className="mb-10">
            <p className="section-label">Education</p>
            <h2 className="theme-heading">Where the craft was trained.</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {education.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 80}>
                <article className="card p-6 h-full">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>
                    {item.period}
                  </p>
                  <h3 className="theme-heading text-lg mt-2 mb-1">{item.program}</h3>
                  <p className="theme-copy mb-2">{item.institution}</p>
                  <p className="text-sm theme-muted">{item.status}{item.note ? ` · ${item.note}` : ""}</p>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-label="How I work">
        <div className="container">
          <AnimatedSection className="text-center mb-12">
            <p className="section-label justify-center">Principles</p>
            <h2 className="theme-heading">How the work is judged.</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((val, i) => (
              <AnimatedSection key={val.title} delay={i * 80}>
                <div className="card p-6 h-full">
                  <div className="w-2 h-2 rounded-full bg-[#0E52A8] mb-4" />
                  <h3 className="theme-heading font-semibold mb-2 text-base">{val.title}</h3>
                  <p className="text-sm theme-copy leading-relaxed">{val.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Technical skills" style={{ background: "var(--color-bg-2)" }}>
        <div className="container max-w-4xl">
          <AnimatedSection className="mb-12">
            <p className="section-label">Capabilities</p>
            <h2 className="theme-heading mb-2">Tools used in shipped work.</h2>
            <p className="theme-copy max-w-2xl">
              This is a working toolkit, not an expert-level claim for every item. Depth shows up in the systems, not the list.
            </p>
          </AnimatedSection>
          <div className="space-y-8">
            {skillCategories.map((category, ci) => {
              const categorySkills = skills.filter((s) => s.category === category);
              return (
                <AnimatedSection key={category} delay={ci * 80}>
                  <h3 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--color-primary)" }}>
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span key={skill.name} className="tech-tag">{skill.name}</span>
                    ))}
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Journey">
        <div className="container max-w-3xl">
          <AnimatedSection className="mb-12">
            <p className="section-label">Journey</p>
            <h2 className="theme-heading">Selected chronology.</h2>
          </AnimatedSection>
          <ol className="relative border-l border-[rgba(14,82,168,0.2)] pl-8 space-y-8">
            {timeline.map((item, i) => (
              <AnimatedSection as="li" key={`${item.year}-${item.title}`} delay={i * 80} className="relative">
                <div className="theme-timeline-dot absolute -left-[2.3rem] top-1 w-4 h-4 rounded-full border-2 border-[#0E52A8] flex items-center justify-center" aria-hidden="true">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0E52A8]" />
                </div>
                <div className="card p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="theme-heading font-semibold">{item.title}</h3>
                    <span className="text-xs font-semibold flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }}>
                      {item.year}
                    </span>
                  </div>
                  <p className="text-sm mb-2 font-medium" style={{ color: "var(--color-primary)" }}>{item.organization}</p>
                  <p className="text-sm theme-copy">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-label="Connect">
        <div className="container">
          <AnimatedSection className="text-center">
            <p className="section-label justify-center">Next</p>
            <h2 className="theme-heading mb-4">See the work, or start a conversation.</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/projects" className="btn btn-primary">
                Selected work
                <RiArrowRightLine size={16} />
              </Link>
              <Link href="/experience" className="btn btn-outline">Experience</Link>
              <Link href="/contact" className="btn btn-outline">Contact</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
