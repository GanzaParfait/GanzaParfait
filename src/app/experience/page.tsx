import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine, RiMapPinLine } from "react-icons/ri";
import { education, experience, siteConfig } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

const PAGE_DESCRIPTION =
  "Professional roles, training, and education: founder of LERONY Ltd, software work with Caritas Rwanda, PSTA, and AskField, plus data-systems training.";

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
      <Breadcrumbs items={breadcrumbItems} />

      <section className="section pt-8 pb-10" aria-label="Experience header">
        <div className="container max-w-4xl">
          <AnimatedSection>
            <p className="section-label">Experience</p>
            <h1 className="theme-heading mb-4">Roles, training, and study.</h1>
            <p className="theme-copy text-lg leading-relaxed max-w-2xl">
              Structured records only. Compensation, internal titles beyond what is confirmed, and unverified dates are omitted.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section pt-0" aria-label="Professional experience">
        <div className="container max-w-4xl">
          <div className="space-y-6">
            {experience.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 80}>
                <article className="card p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-primary)" }}>
                        {item.type === "training" ? "Training" : "Work"}
                      </p>
                      <h2 className="theme-heading text-xl">{item.role}</h2>
                      <p className="font-medium mt-1" style={{ color: "var(--color-primary)" }}>{item.organization}</p>
                    </div>
                    <div className="text-sm theme-muted text-right">
                      <p>{item.period}</p>
                      {item.location && (
                        <p className="inline-flex items-center gap-1 mt-1">
                          <RiMapPinLine size={14} />
                          {item.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="theme-copy mb-4 leading-relaxed">{item.summary}</p>
                  <ul className="space-y-1.5">
                    {item.highlights.map((highlight) => (
                      <li key={highlight} className="text-sm theme-copy pl-4 relative">
                        <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-[#0E52A8]" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  {(item.id === "lerony" || item.id === "askfield" || item.id === "psta") && (
                    <Link
                      href={item.id === "psta" ? "/projects/psta-accounting" : `/projects/${item.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold mt-4"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Related case study
                      <RiArrowRightLine size={14} />
                    </Link>
                  )}
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Education" style={{ background: "var(--color-bg-2)" }}>
        <div className="container max-w-4xl">
          <AnimatedSection className="mb-8">
            <p className="section-label">Education</p>
            <h2 className="theme-heading">Academic record.</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {education.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 80}>
                <article className="card p-6 h-full">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>
                    {item.period}
                  </p>
                  <h3 className="theme-heading text-lg mt-2">{item.program}</h3>
                  <p className="theme-copy mt-1">{item.institution}</p>
                  <p className="text-sm theme-muted mt-2">{item.status}</p>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Work call to action">
        <div className="container text-center">
          <AnimatedSection>
            <h2 className="theme-heading mb-4">The systems behind these roles.</h2>
            <p className="theme-copy mb-8 max-w-md mx-auto">
              Selected work is documented as case studies — problem, contribution, technology — without invented metrics.
            </p>
            <Link href="/projects" className="btn btn-primary btn-lg">
              View work
              <RiArrowRightLine size={18} />
            </Link>
            <p className="theme-muted text-sm mt-6">
              {siteConfig.company.name} · {siteConfig.contact.location}
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
