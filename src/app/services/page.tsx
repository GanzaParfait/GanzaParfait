import type { Metadata } from "next";
import { siteConfig, services } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { RiArrowRightLine, RiCheckLine } from "react-icons/ri";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Software development, AI integration, technical consulting, and speaking services by Prince Parfait GANZA.",
  alternates: { canonical: `${siteConfig.url}/services` },
  openGraph: {
    title: "Services — Prince Parfait GANZA",
    description:
      "Web development, AI integration, consulting, and speaking by Prince Parfait GANZA.",
    url: `${siteConfig.url}/services`,
  },
};

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="section pt-32 pb-10 relative dot-grid overflow-hidden" aria-label="Services header">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-radial pointer-events-none" />
        <div className="container relative z-10 max-w-4xl">
          <AnimatedSection>
            <p className="section-label">Services</p>
            <h1 className="text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              How I can help.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              From building full-stack web applications to integrating AI, I
              work with founders, startups, and organizations to ship
              software that creates lasting value.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services grid */}
      <section className="section" aria-label="Service offerings">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <AnimatedSection key={service.id} delay={i * 80}>
                <article
                  className="card glass-hover p-8 h-full"
                  aria-label={service.title}
                >
                  <div className="text-4xl mb-4" aria-hidden="true">
                    {service.icon}
                  </div>
                  <h2
                    className="text-white text-xl font-semibold mb-3"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {service.title}
                  </h2>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2" role="list">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-sm text-slate-400"
                      >
                        <RiCheckLine
                          size={16}
                          className="text-[#0E52A8] flex-shrink-0"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-mesh" aria-label="Work process">
        <div className="container max-w-3xl">
          <AnimatedSection className="text-center mb-12">
            <p className="section-label justify-center">How I Work</p>
            <h2 className="text-white" style={{ fontFamily: "var(--font-heading)" }}>
              My process.
            </h2>
          </AnimatedSection>

          <ol className="relative border-l border-[rgba(14,82,168,0.2)] pl-8 space-y-8">
            {[
              {
                n: "01",
                title: "Understand",
                desc: "I begin by deeply understanding your problem, users, and goals before writing a single line of code.",
              },
              {
                n: "02",
                title: "Plan",
                desc: "Define scope, architecture, and timeline. Clear plans prevent costly rework.",
              },
              {
                n: "03",
                title: "Build",
                desc: "Ship iteratively with regular updates. No black boxes — you see progress throughout.",
              },
              {
                n: "04",
                title: "Launch & Support",
                desc: "Deployment, documentation, and ongoing support to ensure everything runs smoothly.",
              },
            ].map((step, i) => (
              <AnimatedSection as="li" key={step.n} delay={i * 80} className="relative">
                <div
                  className="absolute -left-[2.3rem] top-1 w-4 h-4 rounded-full border-2 border-[#0E52A8] bg-[#050816] flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0E52A8]" />
                </div>
                <div className="card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-[#0E52A8] font-semibold">{step.n}</span>
                    <h3 className="text-white font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="section" aria-label="Get in touch">
        <div className="container">
          <AnimatedSection className="text-center">
            <p className="section-label justify-center">Start Today</p>
            <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Ready to work together?
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Share your project, and we&apos;ll figure out the best way to
              move forward together.
            </p>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Get A Quote
              <RiArrowRightLine size={18} />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
