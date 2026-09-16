import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine, RiMapPinLine } from "react-icons/ri";
import { education, experience } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const PAGE_DESCRIPTION =
  "Professional record for Prince Parfait GANZA: Founder and CEO of LERONY Ltd, with software engineering, client systems, and training kept as evidence.";

export const metadata: Metadata = buildPageMetadata({
  title: "Experience | Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/experience",
  absoluteTitle: true,
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Experience", path: "/experience" },
];

export default function ExperiencePage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/experience",
            name: "Experience | Prince Parfait GANZA",
            description: PAGE_DESCRIPTION,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/experience"),
        ])}
      />

      <section className="section page-compact-hero" aria-label="Experience header">
        <div className="container max-w-3xl">
          <AnimatedSection>
            <p className="section-label">Experience</p>
            <h1 className="theme-heading mb-3">The record behind the identity.</h1>
            <p className="theme-copy leading-relaxed max-w-2xl">
              Founder and CEO of LERONY Ltd leads. Software engineering, training, and client systems stay as evidence.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section pt-0" aria-label="Professional experience">
        <div className="container max-w-3xl">
          <div className="experience-list">
            {experience.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 60}>
                <article className="experience-row">
                  <div className="experience-row-top">
                    <p className="experience-type">{item.type === "training" ? "Training" : "Work"}</p>
                    <p className="experience-meta">
                      {item.period}
                      {item.location ? (
                        <span>
                          <RiMapPinLine size={13} /> {item.location}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <h2>{item.role}</h2>
                  {item.website ? (
                    <a
                      href={item.website}
                      className="experience-org"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.organization}
                    </a>
                  ) : (
                    <p className="experience-org">{item.organization}</p>
                  )}
                  <p className="theme-copy experience-summary">{item.summary}</p>
                  {item.highlights.length ? (
                    <ul className="experience-highlights">
                      {item.highlights.slice(0, 4).map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  ) : null}
                  {item.id === "lerony" ? (
                    <a
                      href={item.website || "https://lerony.com"}
                      className="experience-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit lerony.com <RiArrowRightLine size={14} />
                    </a>
                  ) : null}
                  {(item.id === "askfield" || item.id === "psta") && (
                    <Link
                      href={item.id === "psta" ? "/projects/psta-accounting" : `/projects/${item.id}`}
                      className="experience-link"
                    >
                      Related work <RiArrowRightLine size={14} />
                    </Link>
                  )}
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section experience-edu" aria-label="Education">
        <div className="container max-w-3xl">
          <AnimatedSection className="mb-6">
            <p className="section-label">Education</p>
            <h2 className="theme-heading">Academic record.</h2>
          </AnimatedSection>
          <div className="experience-edu-grid">
            {education.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 60}>
                <article className="experience-edu-card">
                  <p>{item.period}</p>
                  <h3>{item.program}</h3>
                  <span>{item.institution}</span>
                  <em>{item.status}</em>
                </article>
              </AnimatedSection>
            ))}
          </div>
          <div className="page-compact-cta">
            <Link href="/projects" className="btn btn-primary">
              View work <RiArrowRightLine size={16} />
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
