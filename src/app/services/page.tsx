import type { Metadata } from "next";
import { services, siteConfig } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { RiArrowRightLine, RiCheckLine } from "react-icons/ri";
import { Globe, BrainCircuit, Puzzle, Layers, Compass } from "lucide-react";
import type { ElementType } from "react";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const SERVICE_ICONS: Record<string, ElementType> = {
  globe: Globe,
  layers: Layers,
  "brain-circuit": BrainCircuit,
  puzzle: Puzzle,
  compass: Compass,
};

const PAGE_DESCRIPTION =
  "Engagements with Prince Parfait GANZA and LERONY Ltd: products, systems, and technology leadership. Capabilities, not the identity.";

export const metadata: Metadata = buildPageMetadata({
  title: "Capabilities | Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/services",
  absoluteTitle: true,
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/services",
            name: "Capabilities | Prince Parfait GANZA",
            description: PAGE_DESCRIPTION,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/services"),
        ])}
      />

      <section className="section page-compact-hero" aria-label="Services header">
        <div className="container max-w-4xl">
          <AnimatedSection>
            <p className="section-label">Capabilities</p>
            <h1 className="theme-heading mb-4">How a serious engagement works.</h1>
            <p className="theme-copy text-lg leading-relaxed max-w-2xl">
              This page explains the work, not the identity. Software engineering, systems, and practical AI are capabilities used to deliver products and ventures. Larger commercial work runs through {siteConfig.company.name}.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section pt-0" aria-label="Service offerings">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, i) => {
              const Icon = SERVICE_ICONS[service.icon] || Globe;
              return (
                <AnimatedSection key={service.id} delay={i * 80}>
                  <article className="card p-8 h-full" aria-label={service.title}>
                    <div style={{
                      width: "3.25rem",
                      height: "3.25rem",
                      borderRadius: "1rem",
                      background: "rgba(14,82,168,0.08)",
                      border: "1px solid rgba(14,82,168,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                    }}>
                      <Icon size={22} color="var(--color-primary)" strokeWidth={1.75} />
                    </div>
                    <h2 className="theme-heading text-xl font-semibold mb-3">{service.title}</h2>
                    <p className="theme-copy mb-6 leading-relaxed">{service.description}</p>
                    <ul className="space-y-2" role="list">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm theme-copy">
                          <RiCheckLine size={16} className="text-[#0E52A8] flex-shrink-0" aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </article>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Work process" style={{ background: "var(--color-bg-2)" }}>
        <div className="container max-w-3xl">
          <AnimatedSection className="text-center mb-12">
            <p className="section-label justify-center">Process</p>
            <h2 className="theme-heading">How delivery usually runs.</h2>
          </AnimatedSection>
          <ol className="relative border-l border-[rgba(14,82,168,0.2)] pl-8 space-y-8">
            {[
              { n: "01", title: "Understand", desc: "The problem, users, constraints, and what already exists — before a stack is chosen." },
              { n: "02", title: "Plan", desc: "Scope, architecture, and sequence. Clear plans prevent expensive rework." },
              { n: "03", title: "Build", desc: "Iterative delivery with visible progress. No black box." },
              { n: "04", title: "Launch & support", desc: "Deployment, handover, and support so the system can actually be operated." },
            ].map((step, i) => (
              <AnimatedSection as="li" key={step.n} delay={i * 80} className="relative">
                <div className="theme-timeline-dot absolute -left-[2.3rem] top-1 w-4 h-4 rounded-full border-2 border-[#0E52A8] flex items-center justify-center" aria-hidden="true">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0E52A8]" />
                </div>
                <div className="card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-semibold" style={{ color: "var(--color-primary)" }}>{step.n}</span>
                    <h3 className="theme-heading font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm theme-copy">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-label="Get in touch">
        <div className="container text-center">
          <AnimatedSection>
            <h2 className="theme-heading mb-4">Ready to scope a system?</h2>
            <p className="theme-copy mb-8 max-w-md mx-auto">
              Share the problem. We will decide whether it is a personal engagement or a {siteConfig.company.name} delivery.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn btn-primary btn-lg">
                Contact
                <RiArrowRightLine size={18} />
              </Link>
              <Link href="/projects" className="btn btn-outline btn-lg">
                See selected work
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
